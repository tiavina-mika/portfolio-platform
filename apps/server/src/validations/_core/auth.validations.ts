import {
  isPasswordContainingEmailWord,
  isPasswordSameAsEmail,
  isPasswordSameAsPhone,
  passwordFieldSchema,
} from '@shared/validations';
import { z } from 'zod';

import { isSmsReachablePhone } from '@/utils/_core/phone.utils';

import { phoneFieldSchema as userPhoneFieldSchema } from './user.validations';
import { localeFieldSchema } from './util.validations';

/*
 * `.refine` with a key, not `.regex`: the server rebuilds the message from the issue code and would
 * otherwise only know the generic "invalid regex format", which has no translation
 */
export const strongPasswordFieldSchema = passwordFieldSchema
  .refine((value) => /[a-z]/.test(value), { params: { key: 'passwordNeedsLowercase' } })
  .refine((value) => /[A-Z]/.test(value), { params: { key: 'passwordNeedsUppercase' } })
  .refine((value) => /[0-9]/.test(value), { params: { key: 'passwordNeedsDigit' } });

/*
 * `.transform`, not `.refine`: the previous `.refine(value => value.toLowerCase())` validated
 * nothing (a non-empty string is always truthy) and changed nothing — a refinement only inspects
 * its value. Parse matches the login identifier byte for byte, so the case has to be settled here.
 */
export const emailFieldSchema = z.string()
  .nonempty()
  .email()
  .transform(value => value.trim().toLowerCase());

export const sendVerificationCodeSchema = z.object({
  /*
   * `emailFieldSchema`, not a bare `z.string().email()`: both callers look the account up by this
   * exact value, so it has to be lowercased the same way the stored one is
   */
  email: emailFieldSchema.optional(),
  phoneNumber: z.string().trim().nonempty().optional(),
  locale: localeFieldSchema.optional(),
}).refine((data) => !!data.email || !!data.phoneNumber, {
  message: 'error.required',
  path: ['email'],
});

export const userAuthSchema = z.object({
  email: emailFieldSchema,
  password: passwordFieldSchema,
});

export const phoneAuthSchema = z.object({
  phoneNumber: z.string().trim().nonempty(),
  password: passwordFieldSchema,
});

export const emailLoginSchema = z.object({
  email: emailFieldSchema,
  password: passwordFieldSchema,
  locale: localeFieldSchema.optional(),
});

/**
 * Server-side validation applied at account creation (see `signupTriggerValidation`) — stricter
 * than `userAuthSchema` (login shape) since a new password must meet the same complexity rules
 * enforced client-side.
 */
export const emailSignUpSchema = z.object({
  email: emailFieldSchema,
  password: strongPasswordFieldSchema,
})
  .refine(({ email, password }) => !isPasswordSameAsEmail(password, email), {
    params: { key: 'passwordSameAsIdentifier' },
    path: ['password'],
  })
  .refine(({ email, password }) => !isPasswordContainingEmailWord(password, email), {
    params: { key: 'passwordContainsEmailWord' },
    path: ['password'],
  });

/*
 * A sign-up may only use a mobile number of a country an SMS provider texts: any other number
 * would either never receive its code or text a stranger holding the same digits. Accounts created
 * before this rule keep their number — it only guards creation.
 */
export const phoneSignUpSchema = z.object({
  phone: userPhoneFieldSchema.refine(
    ({ code, number }) => isSmsReachablePhone({ code, number: String(number) }),
    { params: { key: 'invalidContactPhone' } }
  ),
  password: strongPasswordFieldSchema,
}).refine(
  ({ phone, password }) =>
    !isPasswordSameAsPhone(password, { dialCode: phone.code, number: String(phone.number) }),
  { params: { key: 'passwordSameAsIdentifier' }, path: ['password'] }
);

/**
 * `resetToken` is the single-use token minted by `verifyAccount` once the reset code was
 * confirmed — hex-encoded 32 random bytes, hence the fixed length.
 */
export const resetPasswordSchema = z.object({
  resetToken: z.string().length(64),
  password: strongPasswordFieldSchema,
});

export const verifyAccountSchema = z.object({
  code: z.string()
    .nonempty()
    .length(6),
  type: z.union([z.literal('accountVerification'), z.literal('resetPassword')]),
  /*
   * required, with no default: a call that forgot it used to be read as "email", which marked the
   * wrong contact as verified (or answered with the wrong channel) instead of failing loudly
   */
  toVerify: z.union([z.literal('email'), z.literal('phone')]),
  email: emailFieldSchema.optional(),
  phoneNumber: z.string().trim().nonempty().optional(),
  locale: localeFieldSchema.optional(),
}).refine((data) => (data.toVerify === 'email' ? !!data.email : !!data.phoneNumber), {
  // the contact the code confirms has to be the one the request names
  message: 'error.required',
  path: ['toVerify'],
});

export const encryptedEmailSchema = z.object({
  encryptedEmail: z.string()
    .nonempty(),
  locale: localeFieldSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordFieldSchema,
  newPassword: strongPasswordFieldSchema,
  logoutOtherDevices: z.boolean().optional().default(true),
  locale: localeFieldSchema.optional(),
});

export const requestStepUpVerificationSchema = z.object({
  locale: localeFieldSchema.optional(),
});

export const cancelPasswordResetDelaySchema = z.object({
  /** whether the owner also wants the support team told that the reset was not theirs */
  warnSupport: z.boolean().optional(),
  locale: localeFieldSchema.optional(),
});

export const verifyStepUpCodeSchema = z.object({
  code: z.string()
    .nonempty()
    .length(6),
  locale: localeFieldSchema.optional(),
});

const mfaCodeFieldSchema = z.string()
  .nonempty()
  .length(6);

export const generateMfaSecretSchema = z.object({
  // asked again before an authenticator is attached: a stolen session alone must not be enough
  password: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const confirmMfaEnrollmentSchema = z.object({
  code: mfaCodeFieldSchema,
  locale: localeFieldSchema.optional(),
});

export const verifyMfaLoginSchema = z.object({
  mfaChallengeToken: z.string().nonempty(),
  code: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const disableMfaSchema = z.object({
  code: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const regenerateMfaBackupCodesSchema = z.object({
  code: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});

export const adminResetMfaSchema = z.object({
  userId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});
