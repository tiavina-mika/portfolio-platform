import {
  CreateSmtpEmail, CreateUpdateContactModel, GetContacts, SendSmtpEmail,
} from '@getbrevo/brevo';
import { z } from 'zod';

import { secureCodeEmailSchema } from '@/validations/email.validation';

export interface ISendEmail extends SendSmtpEmail {}

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
  smtpBlacklistSender?: string;
}

export type ISecureCodeParams = z.infer<typeof secureCodeEmailSchema>;

export interface IEmailResponse<T = CreateSmtpEmail> {
  response: Record<string, any>;
  body: T;
}

export type ICreateEmailContactResponse = IEmailResponse<CreateUpdateContactModel> | undefined;
export type IGetContactsResponse = IEmailResponse<GetContacts> | undefined;
export type ICreateEmailResponse = IEmailResponse | undefined;
