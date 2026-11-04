import { z } from 'zod';

import type { Brevo } from '@getbrevo/brevo';

import { secureCodeEmailSchema } from '@/validations/_core/email.validations';

export type ISendEmail = Brevo.SendTransacEmailRequest;

/**
 * plain, Parse-free shape of an email recipient — lets email-sending logic
 * (and its unit tests) work without needing a real Parse.User/DB row
 */
export type EmailRecipient = {
  email: string;
  firstName?: string;
  lastName?: string;
};

interface IContactEmailAttribute {
  firstName?: string;
  lastName: string;
  sms?: string;
  whatsapp?: string;
}

export interface ICreateContactEmailParams {
  email: string;
  attributes: IContactEmailAttribute;
  emailBlacklisted?: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  updateEnabled?: boolean;
  smtpBlacklistSender?: string[];
}

export type ISecureCodeParams = z.infer<typeof secureCodeEmailSchema>;

export type ICreateEmailContactResponse = Brevo.CreateContactResponse | undefined;
export type IGetContactsResponse = Brevo.GetContacts | undefined;
export type ICreateEmailResponse = Brevo.SendTransacEmailResponse | undefined;

/** A transactional e-mail handed to Brevo: its response, or Brevo's own code and wording for the refusal. */
export type ISendEmailResult = {
  data?: Brevo.SendTransacEmailResponse;
  errorCode?: string;
  errorMessage?: string;
};
