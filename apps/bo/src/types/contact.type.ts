import { z } from 'zod';

import { contactFilterSchema, replyContactSchema } from '@/validations/email.validation';

export interface IContactAttributes {
  objectId: string;
  email: string;
  name?: string;
  updatedAt: string;
  createdAt: string;
  deleted: boolean;
  user?: Parse.User;
  message: string;
  replied: boolean;
  language?: string;
  repliedBy?: Parse.User;
  repliedAt?: string;
}

export interface IContact extends Parse.Object<IContactAttributes> {
  id: string;
}

export interface IContactState {
  loading: boolean;
  contacts: IContact[];
  count: number;
}

export type ReplyContactInput = z.infer<typeof replyContactSchema>;
export type ContactFiltersInput = z.infer<typeof contactFilterSchema>;
