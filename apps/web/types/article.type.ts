import { Locale } from '@/i18n/config';

import { IFileCloud, ISEOFields, IUploadedFile } from './app.type';
import { ICategory } from './cms.type';
import { IUser } from './user.type';

interface IArticleTranslatedFields extends ISEOFields {
  title: string;
  content: string;
  description: string;
}

export interface IArticleTranslated extends Record<Locale, IArticleTranslatedFields> {}

export interface IArticleAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user: IUser;
  translated: IArticleTranslated;
  image?: IFileCloud;
  previewImage?: IUploadedFile;
  images?: IFileCloud[];
  categories: ICategory[];
  totalMediaShare?: number;
}

export interface IArticle extends IArticleAttributes {
  id: string;
}
