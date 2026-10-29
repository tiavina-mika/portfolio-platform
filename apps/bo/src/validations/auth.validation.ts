import { validatePasswordChecklist } from 'mui-password-checklist';
import { object, string, number } from 'zod';

import i18n from '@/config/i18n';
import { formatPhoneNumber, validatePhoneNumber } from '@/utils/user.utils';
import { capitalizeFirstLetter } from '@/utils/utils';

/**
 * Password strength and requirements
 */
export const complexPasswordSchema = string()
  .max(64, i18n.t('form.error.max', { field: i18n.t('user:password'), number: 64 }))
  .superRefine((value: string, ctx: any) => {
    const {
      allChecksPassed: isAllChecksPassed,
    } = validatePasswordChecklist(value);

    // no need to trigger the error if the password rules are met
    if (isAllChecksPassed) return;
    ctx.addIssue({
      code: 'custom',
      // maybe this message should not be displayed to the user
      message: 'Should contain at least 8 characters, one lowercase, one uppercase, ' +
        'one number, and one special character',
    });
  });

const passwordFieldSchema = string()
  .min(8, i18n.t('form.error.min', { field: i18n.t('user:password'), number: 8 }))
  .max(64, i18n.t('form.error.max', { field: i18n.t('user:password'), number: 64 }));

const userSchema = object({
  email: string()
    .email({ message: i18n.t('form.error.required', { field: 'Email' }) })
    .max(120, i18n.t('form.error.max', { field: 'Email', number: 120 }))
    .refine(value => value.toLowerCase()),
  password: complexPasswordSchema,
});

export const loginSchema = userSchema.pick({ email: true, password: true });

export const emailSchema = loginSchema.pick({ email: true });

const passwordConfirmationSchema = string().min(
  1,
  i18n.t('form.error.required', { field: i18n.t('user:passwordConfirmation') })
);

export const resetPasswordSchema = object({
  newPassword: passwordFieldSchema,
  newPasswordConfirmation: passwordConfirmationSchema,
})
  // compare the password and confirm password fields
  .refine(value => value.newPassword === value.newPasswordConfirmation, {
    message: i18n.t('form.error.passwordNotMatch'),
    path: ['newPasswordConfirmation'],
  });

export const signUpSchema = userSchema
  .extend({
    passwordConfirmation: passwordConfirmationSchema,
    lastName: string()
      .min(1, i18n.t('form.error.required', { field: i18n.t('user:lastName') }))
      .max(112, i18n.t('form.error.max', { field: i18n.t('user:lastName'), number: 112 }))
      .transform(capitalizeFirstLetter),
    firstName: string()
      .max(112, i18n.t('form.error.max', { field: i18n.t('user:firstName'), number: 112 }))
      .optional()
      .transform((value: any) => (value
        ? capitalizeFirstLetter(value)
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
    .min(1, i18n.t('form.error.required', { field: i18n.t('user:lastName') }))
    .max(112, i18n.t('form.error.max', { field: i18n.t('user:lastName'), number: 112 }))
    .refine(capitalizeFirstLetter),
  firstName: string()
    .max(112, i18n.t('form.error.max', { field: i18n.t('user:firstName'), number: 112 }))
    .refine(capitalizeFirstLetter),
  phone: number()
    .or(
      string()
        .min(6, i18n.t('form.error.required', { field: i18n.t('user:phoneNumber'), number: 6 }))
        .max(12, i18n.t('form.error.max', { field: i18n.t('user:phoneNumber'), number: 12 }))
        .regex(/\d+/)
        // validate phone number (by regex)
        .refine(validatePhoneNumber, { message: i18n.t('user.invalidPhoneNumber') })
        // format the input entered by user to database format
        .transform(formatPhoneNumber)
        // convert the input string to number
        .transform(Number)
    )
    .refine(n => n >= 0),

  /*
   * sex: sexSchema,
   * birthday: date({
   *   required_error: i18n.t('form.error.required', { field: i18n.t('user:birthday') }),
   *   invalid_type_error: i18n.t('form.error.required', { field: i18n.t('common:form.invalidDateType') }),
   * }), // convert string / date type to unix timestamp
   */
  address: string()
    .min(1, i18n.t('form.error.required', { field: i18n.t('common:address') }))
    .max(150, i18n.t('form.error.max', { field: i18n.t('common:address'), number: 150 }))
    .refine(capitalizeFirstLetter),
});

export const signUpUploadImageSchema = object({ image: string() });

export const changePasswordSchema = object({
  currentPassword: passwordFieldSchema,
  newPassword: passwordFieldSchema,
  newPasswordConfirmation: passwordConfirmationSchema,
})
  // compare the password and confirm password fields
  .refine(value => value.newPassword === value.newPasswordConfirmation, {
    message: i18n.t('form.error.passwordNotMatch'),
    path: ['newPasswordConfirmation'],
  });

export const profileUserInfoSchema = signUpInfoSchema.pick({ lastName: true, firstName: true });
