import { z } from 'zod';

import { localeFieldSchema } from './util.validations';

export const registerSessionSchema = z.object({
  deviceId: z.string().nonempty(),
  deviceName: z.string().nonempty(),
  platform: z.union([z.literal('ios'), z.literal('android'), z.literal('web')]),
  appVersion: z.string().optional(),
  locale: localeFieldSchema.optional(),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const revokeOtherSessionsSchema = z.object({
  locale: localeFieldSchema.optional(),
});

export const getUserSessionsSchema = z.object({
  locale: localeFieldSchema.optional(),
});

export const registerPushTokenSchema = z.object({
  deviceId: z.string().nonempty(),
  pushToken: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const unregisterPushTokenSchema = z.object({
  deviceId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

// back-office: the sessions of the user whose file is open
export const adminGetUserSessionsSchema = z.object({
  userId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const adminRevokeUserSessionSchema = z.object({
  userId: z.string().nonempty(),
  sessionId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const adminRevokeAllUserSessionsSchema = z.object({
  userId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});
