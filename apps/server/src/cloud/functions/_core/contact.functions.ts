import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  collections, RECAPTCHA_VERIFICATION_FAILED, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { type CreatedContact, TicketSourceEnum } from '@/types/ticket.type';
import { toTypedPhoneUsername } from '@/utils/_core/phone.utils';
import { verifyRecaptchaToken } from '@/utils/_core/recaptcha.utils';
import { getContactPriority } from '@/utils/_core/ticket.utils';
import {
  confirmNewsletterSubscriptionSchema, createContactSchema, createPublicContactSchema, getContactsSchema,
  getContactSchema, getMyTicketsSchema, getMyTicketSchema, reopenMyTicketSchema, subscribeToNewsletterSchema,
} from '@/validations/_core/contact.validations';
import { getTicketContextSchema } from '@/validations/_core/ticket-message.validations';

import { sendTicketAcknowledgementEmail } from '../../emails/_core/contact.email';
import {
  type ContactSummary, type TicketContext, getContactSummaryService, getTicketAgentsService,
  getTicketContextService,
} from '../../services/_core/contact-list.service.cloud';
import {
  applyAuthorIdentity, getContactByIdService, getContactsService, getMyTicketService, getMyTicketsService,
  markMyTicketAsReadService,
  resolveContactObjects,
} from '../../services/_core/contact.service.cloud';
import {
  confirmNewsletterSubscriptionService, subscribeToNewsletterService,
} from '../../services/_core/newsletter.service.cloud';
import { getTicketById, reopenTicketService } from '../../services/_core/ticket-message.service.cloud';
import { sendTicketAcknowledgementSms } from '../../sms/_core/ticket.sms.cloud';
import { Contact } from '../../triggers/_core/contact.triggers';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'createContact',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<CreatedContact> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const {
      subject, reason, message, locale = DEFAULT_LANGUAGE, rideId, requestId, paymentId, reportedUserId,
    } = request.params;

    const objects = await resolveContactObjects(currentUser, {
      rideId, requestId, paymentId, reportedUserId,
    }, locale);

    const contact = new Contact();

    applyAuthorIdentity(contact, currentUser);
    contact.set('subject', subject);
    if (reason) contact.set('reason', reason);
    contact.set('message', message);
    Object.entries(objects).forEach(([field, object]) => {
      if (object) contact.set(field, object);
    });
    contact.set('user', currentUser);
    /*
     * set here rather than taken from the params: this is the app's only way in, and the origin of
     * a ticket decides how it is answered — it must not be something the caller can claim
     */
    contact.set('source', TicketSourceEnum.APP);
    // derived from what the request is about, never picked by the caller
    contact.set('priority', getContactPriority(subject, reason));

    const context = locale ? { locale } : {};

    await contact.save(null, { ...USE_MASTER_KEY, context });

    // the reference is what the confirmation screen shows its author, to quote to support
    return { id: contact.id, reference: contact.get('reference') };
  }),
  parseFunctionValidation(createContactSchema)
);

/**
 * The public website's way in: a visitor has no account, so the reCAPTCHA token stands in for the
 * session and is verified here rather than on the website's own server. It used to be verified
 * there and the row then written straight to `POST /parse/classes/Contact`, a write any caller
 * holding the app id could make with no token at all.
 */
Parse.Cloud.define(
  'createPublicContact',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const {
      email, name, message, phone, acceptNewsLetter, locale, recaptchaToken,
    } = request.params;

    if (!(await verifyRecaptchaToken(recaptchaToken))) {
      throw new Error(RECAPTCHA_VERIFICATION_FAILED);
    }

    const contact = new Contact();

    // the schema guarantees one of the two: a visitor with neither could never be answered
    if (email) contact.set('email', email);
    contact.set('name', name);
    contact.set('message', message);
    // the origin decides how the ticket is answered, so it is stamped here, never claimed
    contact.set('source', TicketSourceEnum.WEB);

    // stored the way an app ticket stores its author's number, so one number reads one way everywhere
    if (phone) contact.set('phone', toTypedPhoneUsername(phone));
    if (acceptNewsLetter) contact.set('acceptNewsLetter', acceptNewsLetter);

    const context = locale ? { locale } : {};

    await contact.save(null, { ...USE_MASTER_KEY, context });

    /*
     * not awaited (they never throw): the ticket exists whatever happens to the receipt, and the
     * visitor should not wait on the mail or SMS provider — nor see an error for a ticket that was
     * filed. One channel only: the email when there is one, the SMS for a visitor with a number alone.
     */
    void sendTicketAcknowledgementEmail(contact);
    void sendTicketAcknowledgementSms(contact);

    /*
     * the form's newsletter box: the Contact triggers only react to it on an edited ticket, so a new
     * ticket never subscribed anyone. Same double opt-in as the newsletter form — by email, so a
     * visitor with a number alone has nothing to subscribe.
     */
    if (acceptNewsLetter && email) {
      await subscribeToNewsletterService(email, locale);
    }
  }),
  parseFunctionValidation(createPublicContactSchema)
);

/**
 * Newsletter sign-up from the public website — same reasoning as `createPublicContact`. It only
 * records the address as pending and e-mails a confirmation link (double opt-in), see
 * `subscribeToNewsletterService`.
 */
Parse.Cloud.define(
  'subscribeToNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { email, language, recaptchaToken } = request.params;

    if (!(await verifyRecaptchaToken(recaptchaToken))) {
      throw new Error(RECAPTCHA_VERIFICATION_FAILED);
    }

    await subscribeToNewsletterService(email, language);
  }),
  parseFunctionValidation(subscribeToNewsletterSchema)
);

/**
 * The link of the confirmation e-mail, opened on the website. No reCAPTCHA: the token is random and
 * can only come from the e-mail this server sent to the address.
 */
Parse.Cloud.define(
  'confirmNewsletterSubscription',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => (
    confirmNewsletterSubscriptionService(request.params.token)
  )),
  parseFunctionValidation(confirmNewsletterSubscriptionSchema)
);

type GetContactsResult = { results: Parse.Object[]; count: number };

Parse.Cloud.define(
  'getContacts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<GetContactsResult> => {
    const {
      limit, skip, orderBy, order, filters, search, include = [],
    } = request.params;

    return getContactsService({
      limit, skip, orderBy, order, filters, search, include,
    });
  }, ['find'], collections.Contact),
  parseFunctionValidation(getContactsSchema)
);

Parse.Cloud.define(
  'getContact',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;

    await assertInAgentCountries(collections.Contact, id);
    const contact = await getContactByIdService(id, include);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!contact) return false;

    return contact;
  }, ['get'], collections.Contact),
  parseFunctionValidation(getContactSchema)
);

/**
 * The figures the inbox states above its scopes. Unlike `getContacts` it takes no search, so the
 * counts stay put while an agent narrows the queue under them.
 */
Parse.Cloud.define(
  'getContactSummary',
  fromBO(async (): Promise<ContactSummary> => getContactSummaryService(), ['find'], collections.Contact)
);

/**
 * What the inbox draws beside a thread: the requester's record and their previous tickets.
 */
Parse.Cloud.define(
  'getTicketContext',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<TicketContext> => {
    const { ticketId } = request.params;

    await assertInAgentCountries(collections.Contact, ticketId);
    const ticket = await new Parse.Query(collections.Contact)
      .include(['user'])
      .get(ticketId, USE_MASTER_KEY);

    return getTicketContextService(ticket);
  }, ['get'], collections.Contact),
  parseFunctionValidation(getTicketContextSchema)
);

/** The back-office users a ticket can be handed to — see `getTicketAgentsService`. */
Parse.Cloud.define(
  'getTicketAgents',
  fromBO(async (): Promise<Parse.User[]> => getTicketAgentsService(), ['update'], collections.Contact)
);

type GetMyTicketsResult = { results: Parse.Object[]; count: number };

/**
 * Mobile-callable equivalent of `getContacts` — scoped to the caller's own tickets, unlike
 * `getContacts`/`getContact` above which are `fromBO`-gated for the back office.
 */
Parse.Cloud.define(
  'getMyTickets',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<GetMyTicketsResult> => {
    const { user } = request;
    const {
      limit, skip, awaiting, isReport, locale = DEFAULT_LANGUAGE,
    } = request.params;

    if (!user) throw new Error(translate('error.pleaseLogin', locale));

    return getMyTicketsService({
      user, limit, skip, awaiting, isReport,
    });
  }),
  parseFunctionValidation(getMyTicketsSchema)
);

Parse.Cloud.define(
  'getMyTicket',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { user } = request;
    const { id, locale = DEFAULT_LANGUAGE } = request.params;

    if (!user) throw new Error(translate('error.pleaseLogin', locale));

    const contact = await getMyTicketService(id);
    const ticketUser = contact?.get('user');

    if (!contact || ticketUser?.id !== user.id) {
      throw new Error(translate('error.unauthorizedToDoThisAction', locale));
    }

    // opening the ticket is reading it: the author's list stops counting its replies as new
    return markMyTicketAsReadService(contact);
  }),
  parseFunctionValidation(getMyTicketSchema)
);

/**
 * Puts a ticket its author still considers unfinished back in the support queue. Kept apart from
 * the back-office `updateTicketStatus`: an author may only ever move their own ticket back to
 * `open`, never to any other status, and never on a ticket that is not theirs.
 */
Parse.Cloud.define(
  'reopenMyTicket',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { user } = request;
    const { id, locale = DEFAULT_LANGUAGE } = request.params;

    if (!user) throw new Error(translate('error.pleaseLogin', locale));

    const ticket = await getTicketById(id);

    if (ticket.get('user')?.id !== user.id) {
      throw new Error(translate('error.unauthorizedToDoThisAction', locale));
    }

    return reopenTicketService(ticket);
  }),
  parseFunctionValidation(reopenMyTicketSchema)
);
