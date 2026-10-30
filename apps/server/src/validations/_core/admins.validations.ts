import { COUNTRIES } from '@shared/constants';
import { MessageChannelEnum } from '@shared/types';
import {
  string, object, boolean, array, z, enum as zEnum,
} from 'zod';

import { contactChangeValueShape, hasContactChangeValue } from './user.validations';
import {
  paginationQuerySchema, dateRangeFieldSchema, multiBooleanFieldSchema, objectIdFieldSchema,
  localeFieldSchema,
} from './util.validations';

const usersFiltersSchema = object({
  deleted: boolean().optional(),
  seen: boolean().optional(),
  platform: string().optional(),
  fromBO: boolean().optional(),
}).optional();

const usersSearchSchema = object({
  text: string().optional(),
  lastName: string().optional(),
  firstName: string().optional(),
  email: string().optional(),
  sex: array(string()).optional(),
  platform: array(string()).optional(),
  platforms: array(string()).optional(),
  countries: array(string()).optional(),
  verified: boolean().optional(),
  // proven by a code sent to it — a member who signed up by phone never has a verified email
  emailVerified: boolean().optional(),
  phoneVerified: boolean().optional(),
  isOnline: multiBooleanFieldSchema.optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
  birthday: dateRangeFieldSchema.optional(),
}).optional();

export const getUsersSchema = paginationQuerySchema.extend({
  filters: usersFiltersSchema,
  search: usersSearchSchema,
  ids: array(string()).optional(),
});

export const getUserSchema = object({
  id: objectIdFieldSchema,
  shouldMarkAsSeen: boolean().optional(),
  include: array(string()).optional(),
});

export const deleteUserSchema = object({
  id: objectIdFieldSchema,
});

export const deleteUsersSchema = object({
  ids: array(string()).nonempty(),
});

export const destroyUsersSchema = object({
  ids: array(string()).nonempty(),
});

export const toggleUsersSeenSchema = object({
  ids: array(string()).optional(),
  value: boolean().optional(),
});

/*
 * The recipient is identified by the id of their account on both channels: a member who signed up
 * by phone has no email to look them up by, and the address or phone number a message goes to is
 * read from that account rather than supplied by the caller — so `email` is optional and never
 * identifies anyone. A text carries no subject line, so the subject is optional here and only
 * required of an email — the function itself is what rejects an email without one, since this schema
 * has to stay a plain object for the shared validation wrapper.
 */
export const sendMessageToUserSchema = object({
  userId: objectIdFieldSchema,
  email: string().email().optional(),
  channel: z.enum(MessageChannelEnum),
  subject: string().optional(),
  message: string().nonempty(),
});

/*
 * Helping a member back into their account is a decision taken on the account of someone else, so
 * every action carries the reason it was taken for: it is what the member's history records, and
 * what answers "why was my number changed?" later. The `locale` is the administrator's, for the
 * error they may get back: what the member receives is written in the member's own language.
 */
const accountHelpReasonSchema = string().trim().min(5).max(500);

export const resendMemberPhoneCodeSchema = object({
  userId: objectIdFieldSchema,
  reason: accountHelpReasonSchema,
  locale: localeFieldSchema.optional(),
});

export const sendMemberPasswordResetSchema = object({
  userId: objectIdFieldSchema,
  reason: accountHelpReasonSchema,
  locale: localeFieldSchema.optional(),
});

/** The country support moves a member's account to: one the platform runs in. */
export const changeMemberCountrySchema = object({
  userId: objectIdFieldSchema,
  reason: accountHelpReasonSchema,
  country: zEnum(Object.keys(COUNTRIES) as [string, ...string[]]),
  locale: localeFieldSchema.optional(),
});

/** The same value shape as a member's own contact change, plus who it is for and why. */
export const changeMemberContactSchema = object({
  userId: objectIdFieldSchema,
  reason: accountHelpReasonSchema,
  ...contactChangeValueShape,
  locale: localeFieldSchema.optional(),
}).refine(hasContactChangeValue, { path: ['type'] });
