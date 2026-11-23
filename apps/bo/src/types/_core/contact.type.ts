import type { IUser } from '@/types/_core/user.type';
import type { TargetEnum } from '@shared/types';
import type { ComponentType } from 'react';

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
  // the workspace the message is read in; a message saved before the field existed is the portfolio's
  target?: TargetEnum;
}

export type IContact = IContactAttributes & { id: string };

/**
 * An action a business domain adds to the message being read (such as turning a quote request into a
 * quote), shown under the message in the workspaces it names. The generic inbox renders it without
 * knowing the domain.
 */
export interface IContactDetailAction {
  // a stable key for the list
  id: string;
  workspaces: TargetEnum[];
  component: ComponentType<{ contact: IContact }>;
}

export interface IContactState {
  loading: boolean;
  contact: IContact | null;
  contacts: IContact[];
  count: number;
}
