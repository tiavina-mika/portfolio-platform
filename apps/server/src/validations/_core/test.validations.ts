import { z } from 'zod';

import { getAllowedTestEmailSenders } from '@/utils/_core/user.utils';

import { localeFieldSchema } from './util.validations';

/**
 * validated against the closed allowed-senders list rather than z.enum(...) — that list is built
 * from an env var at runtime and z.enum requires a non-empty literal tuple, which an empty array
 * (env var unset) would violate
 */
const senderFieldSchema = z.string().email()
  .refine((value) => getAllowedTestEmailSenders().includes(value), { message: 'Invalid sender' });

export const createBatchTestSchema = z.object({
  limit: z.coerce.number().int().positive(),
});

export const sendArticleToNewsletterTestSchema = z.object({
  email: z.string().email().nonempty(),
  locale: localeFieldSchema.optional(),
  articleId: z.string().optional(),
  sender: senderFieldSchema.optional(),
});

export const sendVerificationCodeTestSchema = z.object({
  email: z.string().email().nonempty(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  locale: localeFieldSchema.optional(),
  sender: senderFieldSchema.optional(),
});

export const sendResetPasswordVerificationCodeTestSchema = z.object({
  email: z.string().email().nonempty(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  locale: localeFieldSchema.optional(),
  sender: senderFieldSchema.optional(),
});

export const sendInvitationTestSchema = z.object({
  email: z.string().email().nonempty(),
  locale: localeFieldSchema.optional(),
  sender: senderFieldSchema.optional(),
});

export const sendWelcomeEmailTestSchema = z.object({
  email: z.string().email().nonempty(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  locale: localeFieldSchema.optional(),
  sender: senderFieldSchema.optional(),
});

export const sendVerificationCodeSmsTestSchema = z.object({
  phoneNumber: z.string().trim().nonempty(),
  locale: localeFieldSchema.optional(),
});
