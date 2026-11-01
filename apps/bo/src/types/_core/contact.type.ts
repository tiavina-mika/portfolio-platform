import type { IUser } from '@/types/_core/user.type';

export interface IContactAttributes {
  objectId: string;
  /*
   * a visitor leaves an email or a phone number, at least one. The phone is in international form
   * (+261341234567)
   */
  email?: string;
  phone?: string;
  name?: string;
  updatedAt: string;
  createdAt: string;
  deleted: boolean;
  user?: IUser;
  message: string;
  locale?: string;
  acceptNewsLetter?: boolean;
  // false until a back-office user opens the message: the sidebar badge counts the unseen ones
  seen?: boolean;
}

export type IContact = IContactAttributes & { id: string };

export interface IContactState {
  loading: boolean;
  contact: IContact | null;
  contacts: IContact[];
  count: number;
}
