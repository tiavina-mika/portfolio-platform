import { MessageChannelEnum } from '@shared/types';
import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  MESSAGE_TO_USER_MAX_LENGTH, MESSAGE_TO_USER_SUBJECT_MAX_LENGTH,
} from '@/constants/_core/user.constants';

export const emailParamsSchema = z.object({
  email: z
    .string()
    .email()
    .trim()
    .max(60),
});

/*
 * What the dialog asks for. The message is marked required there and is rejected empty by the Cloud
 * Function, so it is enforced here too — otherwise the marker is a promise the form does not keep,
 * and an empty message only fails once it has reached the server. The subject is the one field the
 * channel decides: a text message has no subject line, so it is only demanded of an email.
 */
export const sendMessageFormSchema = z.object({
  channel: z.enum(MessageChannelEnum),
  subject: z
    .string()
    .trim()
    .max(MESSAGE_TO_USER_SUBJECT_MAX_LENGTH)
    .optional(),
  message: z
    .string()
    .trim()
    .min(1)
    .max(MESSAGE_TO_USER_MAX_LENGTH),
}).refine(
  (values) => values.channel !== MessageChannelEnum.EMAIL || !!values.subject,
  {
    message: i18n.t('user:sendMessage.subjectRequiredForEmail'),
    path: ['subject'],
  }
);

/*
 * What the Cloud Function is called with: the dialog's fields plus the recipient, which the caller
 * adds — the dialog names the recipient in its own title rather than asking for the address. The
 * recipient is the id of the account: a member who signed up by phone has no email to name them by,
 * so `email` is optional and never what identifies the account.
 */
export const sendMessageSchema = z.object({
  userId: z.string().nonempty(),
  channel: z.enum(MessageChannelEnum),
  subject: z.string().optional(),
  message: z.string(),
  email: emailParamsSchema.shape.email.optional(),
});
