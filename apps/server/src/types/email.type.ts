import type { Brevo } from '@getbrevo/brevo';
import { z } from 'zod';

import { secureCodeEmailSchema } from '@/validations/email.validation';

export type ISendEmail = Brevo.SendTransacEmailRequest;

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
