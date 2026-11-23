import type { ClientKindEnum, ClientStatusEnum, IClientAddress } from '@shared/domain-types';

/** an Aldaron client, as the list and the edit dialog read it */
export interface IClient {
  id: string;
  name: string;
  kind: ClientKindEnum;
  email: string;
  phone?: string;
  address?: IClientAddress;
  taxId?: string;
  notes?: string;
  status: ClientStatusEnum;
  createdAt: string;
  updatedAt: string;
}

/** what the client form sends: the status moves only through archiving */
export interface IClientInput {
  name: string;
  kind: ClientKindEnum;
  email: string;
  phone?: string;
  address?: IClientAddress;
  taxId?: string;
  notes?: string;
}

export interface IClientState {
  clients: IClient[];
  count: number;
}
