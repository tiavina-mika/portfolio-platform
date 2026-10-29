import {
  string, object, array, boolean, literal, union,
} from 'zod';

export const localeFieldSchema = union([literal('fr'), literal('en'), literal('mg')]);
// subject, url, title, folder, template, to, from, notification
export const SendEmailSchema = object({
  subject: string({
    message: 'common:form.error.invalidStringType',
  }).nonempty('user:errors.requiredEmailSubject'),
  url: string({
    message: 'Invalid url',
  }).url('Invalid url'),
  title: string({
    message: 'common:form.error.invalidStringType',
  }).max(86, 'common:form.error.emailTitleMax'),
  folder: string({
    message: 'Invalid folder name',
  }).nonempty('Invalid folder name'),
  template: string({
    message: 'Invalid template path',
  }).nonempty('Invalid template path'),
  from: string({
    message: 'common:form.error.invalidStringType',
  })
    .nonempty('user:errors.requiredSenderEmail')
    .email('common:form.error.invalidEmail'),
  to: string().nonempty('user:errors.requiredSenderEmail').email({ message: 'common:form.error.invalidEmail' })
    .or(array(string().nonempty('user:errors.requiredSenderEmail').email({ message: 'common:form.error.invalidEmail' }))),
  notification: boolean(),
});

export const DownloadFileInputSchema = object({
  publicId: string().optional(),
  locale: localeFieldSchema.optional(),
  id: string().optional(),
  fileName: string().optional(),
  sessionToken: string().optional(),
});

/**
 * program to generate random strings
 * @param length
 * @param characters
 * @returns
 */
export const generateRandomString = (length: number, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
  let result = ' ';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
