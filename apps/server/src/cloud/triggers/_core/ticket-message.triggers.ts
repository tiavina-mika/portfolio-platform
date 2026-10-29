import dayjs from 'dayjs';

import { USE_MASTER_KEY, collections } from '@/constants/_core/constants';
import { TicketMessageSenderRoleEnum, TicketStatusEnum } from '@/types/ticket.type';
import { type ParseTriggerValidation } from '@/types/utils.type';
import { logger } from '@/utils/_core/logger';
import { getTicketMessagePreview } from '@/utils/_core/ticket.utils';
import { ticketMessageSchema } from '@/validations/_core/ticket-message.validations';

import { sendTicketReplyEmail } from '../../emails/_core/ticket.email';
import { getTicketById } from '../../services/_core/ticket-message.service.cloud';
import { createNotificationForTicketReply } from '../../services/_core/ticket-notification.service.cloud';
import { sendTicketReplySms } from '../../sms/_core/ticket.sms.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseTriggerValidation } from '../../utils/_core/validation.utils.cloud';

export const TicketMessage = Parse.Object.extend(collections.TicketMessage);

Parse.Cloud.beforeSave(
  collections.TicketMessage,
  parseFunction((request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const ticketMessage = request.object;

    if (!ticketMessage.existed()) {
      ticketMessage.set('deleted', false);
    }

    return Promise.resolve();
  }),
  parseTriggerValidation(ticketMessageSchema, ['message', 'senderRole', 'attachments']) as ParseTriggerValidation
);

Parse.Cloud.afterSave(
  collections.TicketMessage,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const ticketMessage = request.object;

    // only react to the initial creation of a message, never an edit
    if (ticketMessage.existed()) return;

    const ticketPointer: Parse.Object | undefined = ticketMessage.get('ticket');

    if (!ticketPointer) return;

    // re-fetch rather than trust the pointer field to carry the full object post-save
    const ticket = await getTicketById(ticketPointer.id);
    const senderRole = ticketMessage.get('senderRole');

    /*
     * a note is written by an agent about the ticket rather than to its author: it must not touch
     * anything the author sees — not the thread's own activity date, not their unread mark, and
     * not a notification — so it stops the trigger before any of that
     */
    if (ticketMessage.get('isInternal')) {
      logger.info(`Internal note ${ticketMessage.id} added on ticket ${ticket.id} at ${dayjs().format()}`);
      return;
    }

    const isFromCustomer = senderRole === TicketMessageSenderRoleEnum.CUSTOMER;
    const isFromAgent = senderRole === TicketMessageSenderRoleEnum.AGENT;

    const currentStatus = ticket.get('status');
    const isReopening = isFromCustomer &&
      (currentStatus === TicketStatusEnum.RESOLVED || currentStatus === TicketStatusEnum.CLOSED);

    ticket.set('lastMessageAt', dayjs().toDate());
    /*
     * who wrote last and what they said, kept on the ticket itself: the author's list filters on
     * whose turn it is and shows the latest line, and reading both from the thread would cost one
     * query per row
     */
    ticket.set('lastMessageBy', senderRole);
    ticket.set('lastMessagePreview', getTicketMessagePreview(ticketMessage.get('message')));
    if (isFromCustomer) ticket.set('unreadByAdmin', true);
    if (isFromAgent) {
      ticket.set('unreadByUser', true);
      ticket.increment('unreadCountByUser');
    }
    if (isReopening) ticket.set('status', TicketStatusEnum.OPEN);

    await ticket.save(null, USE_MASTER_KEY);

    logger.info(
      `TicketMessage ${ticketMessage.id} created on ticket ${ticket.id} by ${senderRole} at ` +
      dayjs().format()
    );

    /*
     * one reply, three possible channels, and exactly one of them fires: a ticket with an account is
     * notified in the app, where the person can answer back; a ticket without one — written from
     * the public website form — only exists as what the visitor left, so the reply leaves by email
     * when there is an address, by SMS when there is only a number. Each of the calls returns early
     * when another one is the right channel.
     */
    if (isFromAgent) {
      const senderPointer: Parse.User | undefined = ticketMessage.get('sender');
      /*
       * the saved message holds its sender as a bare pointer, and the e-mail signs the reply with
       * the agent's name — which rendered empty until the name was loaded here
       */
      const sender = senderPointer
        ? await new Parse.Query(Parse.User)
          .select(['firstName', 'lastName'])
          .get(senderPointer.id, USE_MASTER_KEY)
          .catch(() => undefined)
        : undefined;

      await createNotificationForTicketReply(ticket);
      await sendTicketReplyEmail(ticket, ticketMessage.get('message'), sender);
      await sendTicketReplySms(ticket, ticketMessage.get('message'));
    }
  })
);
