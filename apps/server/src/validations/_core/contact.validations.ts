import { CONTACT_MESSAGE_MAX_LENGTH } from '@shared/constants';
import { TICKET_SUBJECT_REASONS } from '@shared/domain-constants';
import { TicketAwaitingEnum, TicketSubjectEnum } from '@shared/types';
import { isTypedSmsMobilePhoneNumber } from '@shared/utils';
import { z } from 'zod';

import { TicketPriorityEnum, TicketSourceEnum, TicketStatusEnum } from '@/types/ticket.type';
import { areContactObjectsValid } from '@/utils/_core/ticket.utils';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, objectIdFieldSchema,
} from './util.validations';

/**
 * A request written in the app: its author is the session, so no name, e-mail or phone is taken
 * from the caller. The reason must be one its subject offers — and is required whenever the
 * subject offers any — so the back-office can count tickets per (subject, reason) without
 * stray values.
 */
export const createContactSchema = z.object({
  subject: z.enum(TicketSubjectEnum),
  reason: z.string().max(40).optional(),
  message: z.string().trim().min(1).max(CONTACT_MESSAGE_MAX_LENGTH),
  // the records the request is about — whose they are is checked against the session, not here
  rideId: objectIdFieldSchema.optional(),
  requestId: objectIdFieldSchema.optional(),
  paymentId: objectIdFieldSchema.optional(),
  reportedUserId: objectIdFieldSchema.optional(),
  locale: z.string().optional(),
}).refine(
  ({ subject, reason }) => {
    const reasons = TICKET_SUBJECT_REASONS[subject];

    return reasons.length ? !!reason && reasons.includes(reason) : !reason;
  },
  { path: ['reason'] }
).refine(
  ({ subject, ...ids }) => areContactObjectsValid(subject, ids),
  { path: ['subject'] }
);

/**
 * The public website's form: its visitor has no account, so they say who they are, and the
 * reCAPTCHA token stands in for the missing session. They leave an email or a phone number — at
 * least one, since that is the only way to answer them: many members have no email at all, and a
 * number is answered by SMS. A number must be one an SMS can reach, for the same reason.
 */
export const createPublicContactSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(120),
  message: z.string().max(CONTACT_MESSAGE_MAX_LENGTH),
  phone: z.string().trim().max(30).refine(
    // typed with a + dial code it names its own country, any other is read as one of the default country
    phone => isTypedSmsMobilePhoneNumber(phone),
    { params: { key: 'invalidContactPhone' } }
  ).optional(),
  acceptNewsLetter: z.boolean().optional(),
  locale: z.string().optional(),
  recaptchaToken: z.string().nonempty().max(4000),
}).refine(
  ({ email, phone }) => !!email || !!phone,
  { params: { key: 'contactEmailOrPhoneRequired' }, path: ['email'] }
);

export const subscribeToNewsletterSchema = z.object({
  email: z.string().email(),
  language: z.string().max(10).optional(),
  recaptchaToken: z.string().nonempty().max(4000),
});

// the random token of the double opt-in link (32 bytes, hex)
export const confirmNewsletterSubscriptionSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  locale: z.string().max(10).optional(),
});

const contactsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  // the tickets one account opened — the back-office links here from that account's own page
  userId: objectIdFieldSchema.optional(),
}).optional();

/*
 * `search` also matches arbitrary key/value pairs against Contact fields
 * (see `Object.keys(search).forEach` in getContacts) — `.catchall()` accepts those
 * dynamic keys on top of the well-known ones below
 */
const contactsSearchSchema = z.object({
  user: z.string().optional(),
  text: z.string().optional(),
  replied: z.array(z.boolean()).optional(),
  status: z.array(z.enum(TicketStatusEnum)).optional(),
  priority: z.array(z.enum(TicketPriorityEnum)).optional(),
  source: z.enum(TicketSourceEnum).optional(),
  subject: z.array(z.enum(TicketSubjectEnum)).optional(),
  countries: z.array(z.string()).optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).catchall(z.union([z.string(), z.boolean()])).optional();

export const getContactsSchema = paginationQuerySchema.extend({
  filters: contactsFiltersSchema,
  search: contactsSearchSchema,
  include: includeFieldSchema,
});

export const getContactSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});

export const getMyTicketsSchema = paginationQuerySchema.extend({
  awaiting: z.enum(TicketAwaitingEnum).optional(),
  isReport: z.boolean().optional(),
});

export const getMyTicketSchema = z.object({
  id: objectIdFieldSchema,
});

export const reopenMyTicketSchema = z.object({
  id: objectIdFieldSchema,
});
