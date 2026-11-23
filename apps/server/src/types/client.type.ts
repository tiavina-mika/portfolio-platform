import type { ClientKindEnum, ClientStatusEnum, IClientAddress } from '@shared/domain-types';

/** the stored fields of an Aldaron `Client` */
export interface IClientAttributes {
  name: string;
  kind: ClientKindEnum;
  // stored trimmed and in lowercase: two spellings of one address are one client
  email: string;
  phone?: string;
  address?: IClientAddress;
  // company number or VAT number
  taxId?: string;
  // internal, never sent to the client
  notes?: string;
  status: ClientStatusEnum;
  createdBy?: Parse.User;
  updatedBy?: Parse.User;
}

/** what the back-office may write on a client: the status moves only through archiving */
export type ClientInput = Omit<IClientAttributes, 'status' | 'createdBy' | 'updatedBy'>;
