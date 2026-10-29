import { ContactChangeTypeEnum } from '@shared/types';
import { banFormSchema } from '@shared/validations';
import { z } from 'zod';

import i18n from '@/config/i18n';
import { validatePhoneNumber } from '@/utils/_core/user.utils';
import { dateForAdvancedSearchSchema } from '@/validations/_core/app.validations';

export const ABOUT_ME_LENGTH = 500;

const sexSchema = z.union([z.literal('male'), z.literal('female')]);

export const userFilterSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  sex: z.array(z.string().optional()).optional().or(sexSchema).optional(),
  birthday: dateForAdvancedSearchSchema,
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  platforms: z.array(z.string().optional()).optional(),
  countries: z.array(z.string().optional()).optional(),
  isOnline: z.array(z.boolean().optional()).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

export const usersRouteSearchParams = z.object({
  role: z.string().optional(),
  from: z.string().optional(),
  tab: z.string().optional(),
});

export const notificationFilterSchema = z.object({
  createdAt: dateForAdvancedSearchSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  // array of status
  status: z.array(z.string().optional()).optional(),
  // the categories a send can belong to — a ride, a booking, a review, the account itself
  type: z.array(z.string().optional()).optional(),
  // how far a send has got through its recipients (see NotificationReadStateEnum)
  readState: z.array(z.string().optional()).optional(),
  // one recipient, or several
  sendType: z.string().optional(),
  // raised by the platform itself, or by an account
  senderType: z.string().optional(),
  deleted: z.array(z.boolean().optional()).optional(),
  seen: z.array(z.boolean().optional()).optional(),
});

export const banUserFormSchema = banFormSchema;

/*
 * Helping a member back into their account is a decision taken on someone else's account: the
 * reason is what their history records, and the server refuses an action without one.
 */
const ACCOUNT_HELP_REASON_MIN_LENGTH = 5;
const ACCOUNT_HELP_REASON_MAX_LENGTH = 500;

const accountHelpReasonSchema = z
  .string()
  .trim()
  .min(ACCOUNT_HELP_REASON_MIN_LENGTH)
  .max(ACCOUNT_HELP_REASON_MAX_LENGTH);

export const accountHelpReasonFormSchema = z.object({
  reason: accountHelpReasonSchema,
});

export const changeMemberCountryFormSchema = z.object({
  country: z.string().min(1),
  reason: accountHelpReasonSchema,
});

/*
 * The new contact is a phone number or an email, whichever the type says: the other field stays
 * empty, so each is checked only when it is the one being changed.
 */
export const changeMemberContactFormSchema = z.object({
  type: z.enum(ContactChangeTypeEnum),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  reason: accountHelpReasonSchema,
}).superRefine((values, context) => {
  if (values.type === ContactChangeTypeEnum.PHONE) {
    if (!values.phone || !validatePhoneNumber(values.phone)) {
      context.addIssue({ code: 'custom', path: ['phone'], message: i18n.t('user:invalidPhoneNumber') });
    }

    return;
  }

  if (!values.email || !z.email().safeParse(values.email).success) {
    context.addIssue({
      code: 'custom',
      path: ['email'],
      message: i18n.t('user:detail.accountHelp.changeContact.invalidEmail'),
    });
  }
});
