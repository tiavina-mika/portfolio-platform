

import { splitTypedPhoneNumber } from '@shared/utils';
import dayjs from 'dayjs';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { TICKET_REFERENCE_SEQUENCE, TICKET_REFERENCE_START } from '@/constants/_core/ticket.constants';
import {
  TicketMessageSenderRoleEnum, TicketPriorityEnum, TicketSourceEnum, TicketStatusEnum,
} from '@/types/ticket.type';
import { type ParseTriggerValidation } from '@/types/utils.type';
import { logger } from '@/utils/_core/logger';
import { contactSchema } from '@/validations/_core/app.validations';

import { getNextSequenceValue } from '../../services/_core/counter.service.cloud';
import { createTicketMessageService } from '../../services/_core/ticket-message.service.cloud';
import { getAccountCountryCode, stampCountry } from '../../utils/_core/country.utils.cloud';
import { createContactToCloud } from '../../utils/_core/email.utils.cloud';
import { alertSlackOfNewTicket } from '../../utils/_core/staff-alert.utils.cloud';
import { createNewsletter } from '../../utils/_core/user.utils.cloud';
import { parseFunction, setBooleanFields } from '../../utils/_core/utils.cloud';
import { parseTriggerValidation } from '../../utils/_core/validation.utils.cloud';

export const Contact = Parse.Object.extend('Contact');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Contact',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void | undefined> => {
    const contact = request.object;
    const context = request.context;
    const email = contact.get('email');
    /*
     * a ticket opened on a member's behalf (an SOS) already names them, and may carry no address at
     * all (an account created by phone): the address lookup is only for tickets that lack a user
     */
    const user = contact.get('user') ?? (email
      ? await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY)
      : undefined);
    const dirtyKeys = contact.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;

    // ------- edition ------- //
    if (contact.existed()) {
      stampCountry(request);
      // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
      /*
       * `request`, not the `user` found by the ticket's e-mail above: that lookup names the
       * person who wrote the ticket, and stamping `seenBy`/`deletedBy` with them said the author
       * had handled their own request. The audit fields name the admin acting on it.
       */
      setBooleanFields(contact, request, ['deleted', 'seen']);

      return;
    }

    // ------- creation ------- //
    /*
     * the country of the author's account; a visitor with no account is placed by the dial code of
     * the number they left, and a ticket that names neither is the default country's
     */
    stampCountry(
      request,
      await getAccountCountryCode(user) ?? splitTypedPhoneNumber(String(contact.get('phone') ?? ''))?.country.code
    );
    contact.set('deleted', false);
    contact.set('replied', false);
    /*
     * The short number the author is shown and quotes to support. Drawn from a sequence rather
     * than derived from the row: the technical id is unreadable over the phone, and the creation
     * date is not unique. Drawn here rather than in the caller so a ticket opened from the public
     * website, the app or a migration all get one.
     */
    contact.set('reference', await getNextSequenceValue(TICKET_REFERENCE_SEQUENCE, TICKET_REFERENCE_START));
    /*
     * the public website form is the fallback origin: it is the one caller that cannot be
     * authenticated, so anything reaching here without saying where it came from came from there
     */
    contact.set('source', contact.get('source') ?? TicketSourceEnum.WEB);
    contact.set('status', TicketStatusEnum.OPEN);
    /*
     * a client never picks its own priority — `createContact` would otherwise let anyone file an
     * urgent ticket. Only a ticket the server opens itself (an SOS, saved with the master key)
     * keeps the priority it was given.
     */
    if (!request.master || !contact.get('priority')) {
      contact.set('priority', TicketPriorityEnum.MEDIUM);
    }
    contact.set('lastMessageAt', new Date());
    contact.set('unreadByAdmin', true);
    contact.set('unreadByUser', false);
    /*
     * `unreadByAdmin` says whether there is something new to read on this ticket and comes back on
     * every customer reply; `seen` says whether the back-office has ever picked the ticket up and
     * never goes back on its own. The two answer different questions, so the ticket carries both —
     * and `seen` has to exist as `false` from the start, since Mongo matches no absent field.
     */
    contact.set('seen', false);

    if (context?.locale) {
      contact.set('locale', context.locale);
    }

    if (!user) return;
    contact.set('user', user);
  }),
  parseTriggerValidation(contactSchema) as ParseTriggerValidation
);

Parse.Cloud.afterSave(
  'Contact',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const contact = request.object;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!contact) return;

    // ----------- edition ----------- //
    if (contact.existed()) {
      let hasChanged = false;

      if (dirtyKeys.includes('acceptNewsLetter') && contact.get('acceptNewsLetter')) {
        const newsletter = await createNewsletter(contact.get('email'), contact.get('locale'));

        if (newsletter) {
          logger.info(
            `Newsletter ${newsletter.id} created from contact ${contact.id} at ${dayjs().format()}`
          );
        }
      }

      if (dirtyKeys.includes('replied') && contact.get('replied')) {
        logger.info(`Contact ${contact.id} replied at ${dayjs().format()}`);
        contact.set('repliedAt', new Date());
        contact.set('repliedBy', user);
        hasChanged = true;
      }

      if (!hasChanged) return;
      await contact.save();
    }
    else {
      // first message of the thread — keeps it in sync with the original `message` field
      await createTicketMessageService({
        ticket: contact,
        ticketOwner: contact.get('user'),
        sender: contact.get('user'),
        senderRole: TicketMessageSenderRoleEnum.CUSTOMER,
        message: contact.get('message'),
        // only a ticket the server opens itself carries photos (a report's): the app's form takes none
        attachments: contact.get('attachments'),
      });

      // not awaited: the member's ticket is filed, Slack being slow must not hold the answer
      void alertSlackOfNewTicket(contact);
    }

    // a ticket with no address (an SOS from an account created by phone) has nothing to sync
    if (!contact.get('email')) return;

    const contactObj = { email: contact.get('email'), lastName: contact.get('name') };

    await createContactToCloud(contactObj, contact.id);
  })
);

Parse.Cloud.afterDelete(
  'Contact',
  // eslint-disable-next-line @typescript-eslint/require-await
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const article = request.object;
    const user = request.user;

    logger.info(`Contact ${article.id} deleted from the database at ${dayjs().format()} by ${user?.get('username')}`);
  })
);
