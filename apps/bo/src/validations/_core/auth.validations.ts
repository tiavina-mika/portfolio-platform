import { passwordFieldSchema } from '@shared/validations';
import { capitalize } from 'string-ts';
import { validatePasswordChecklist } from 'validate-password-checklist';
import { object, string, number } from 'zod';

import i18n from '@/config/i18n';
import { formatPhoneNumber, validatePhoneNumber } from '@/utils/_core/user.utils';

/**
 * Password strength schema — used at signup and password change/reset.
 * Login intentionally skips complexity checks to avoid blocking users
 * with passwords created before these rules were introduced.
 */
export const complexPasswordSchema = string()
  .max(64)
  .superRefine((value: string, ctx: any) => {
    const { allChecksPassed: isAllChecksPassed } = validatePasswordChecklist(value);

    if (isAllChecksPassed) return;
    ctx.addIssue({
      code: 'custom',
      message: i18n.t('user:errors.passwordComplexityRequired'),
    });
  });

const userSchema = object({
  email: string()
    .email({ message: i18n.t('form.error.required', { field: 'Email' }) })
    .nonempty()
    .max(120)
    .transform(value => value.toLowerCase()),
  password: complexPasswordSchema,
});

export const loginSchema = object({
  email: string()
    .email({ message: i18n.t('form.error.required', { field: 'Email' }) })
    .nonempty()
    .max(120)
    .transform(value => value.toLowerCase()),
  password: passwordFieldSchema,
});

export const emailSchema = loginSchema.pick({ email: true });

// the password asked again before an authenticator app is attached to the account
export const mfaPasswordSchema = loginSchema.pick({ password: true });

export const resetPasswordSchema = object({
  newPassword: complexPasswordSchema,
  newPasswordConfirmation: string(),
})
  // compare the password and confirm password fields
  .refine(value => value.newPassword === value.newPasswordConfirmation, {
    message: i18n.t('form.error.passwordNotMatch'),
    path: ['newPasswordConfirmation'],
  });

export const signUpSchema = userSchema
  .extend({
    passwordConfirmation: string(),
    lastName: string()
      .max(112)
      .transform(capitalize),
    firstName: string()
      .max(112)
      .optional()
      .transform((value: any) => (value
        ? capitalize(value)
        : '')),
  })
  // compare the password and confirm password fields (should be the same)
  .refine((values: any) => values.password === values.passwordConfirmation, {
    message: i18n.t('form.error.passwordNotMatch'),
    path: ['passwordConfirmation'],
  })
  // compare the password and email fields (should not be the same)
  .refine((values: any) => values.password !== values.email, {
    message: i18n.t('form.error.passwordAndEmailShouldBeDifferent'),
    path: ['password'],
  })

  /*
   * compare the password and email fields
   * password should not contain the email address
   */
  .refine((values: any) => {
    const {
      email, password,
    } = values;
    const emailArr = email.split('@');
    const endOfMail = emailArr[1];
    const emailService = endOfMail.split('.')[0];

    return !(
      !!emailService &&
      password.toLowerCase().includes(emailService.toLowerCase())
    );
  }, {
    message: i18n.t('form.error.passwordNotContainEmail'),
    path: ['password'],
  });

export const signUpInfoSchema = object({
  lastName: string()
    .nonempty()
    .max(112)
    .refine(capitalize),
  firstName: string()
    .max(112)
    .refine(capitalize),
  phone: number()
    .or(
      string()
        .min(6)
        .max(12)
        .regex(/\d+/)
        // validate phone number (by regex)
        .refine(validatePhoneNumber, { message: i18n.t('user.invalidPhoneNumber') })
        // format the input entered by user to database format
        .transform(formatPhoneNumber)
        // convert the input string to number
        .transform(Number)
    )
    .refine(n => n >= 0),

  address: string()
    .max(150)
    .optional()
    .refine(value => typeof value === 'string' ? capitalize(value) : value),
});

export const signUpUploadImageSchema = object({ image: string() });

export const changePasswordSchema = object({
  currentPassword: passwordFieldSchema,
  newPassword: complexPasswordSchema,
  newPasswordConfirmation: string(),
})
  // compare the password and confirm password fields
  .refine(value => value.newPassword === value.newPasswordConfirmation, {
    message: i18n.t('form.error.passwordNotMatch'),
    path: ['newPasswordConfirmation'],
  });

export const profileUserInfoSchema = signUpInfoSchema
  .pick({ lastName: true, firstName: true })
  .extend({ firstName: string().max(112).refine(capitalize).optional() });

export const mfaCodeSchema = object({
  code: string()
    .nonempty({ message: i18n.t('form.error.required', { field: 'Code' }) }),
});
