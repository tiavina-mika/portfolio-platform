import type { IUser } from '@/types/_core/user.type';

export type ContentVersionEntityType = 'Article' | 'Page';

export interface IContentVersionAttributes {
  objectId: string;
  createdAt?: string;
  entityType: ContentVersionEntityType;
  entityId: string;
  createdBy?: IUser;
}

export type IContentVersion = IContentVersionAttributes & { id: string };

export interface IContentVersionState {
  versions: IContentVersion[];
  count: number;
}
