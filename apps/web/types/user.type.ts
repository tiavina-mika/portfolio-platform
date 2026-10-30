import Parse from 'parse';

import { IUploadedFile } from './app.type';

export interface IUserAttributes {
  objectId: string;
  email: string;
  username?: string;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string;
  firstName?: string;
  lastName: string;
  image?: IUploadedFile;
}

export interface IUser extends Parse.User<IUserAttributes> {
  id: string;
}
