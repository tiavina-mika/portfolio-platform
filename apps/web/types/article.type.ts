import Parse from 'parse';

import { Locale } from '@/i18n/config';

import { IFileCloud, ISEOFields } from './app.type';
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
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  categories: ICategory[];
}

export interface IArticle extends Parse.Object<IArticleAttributes> {
  id: string;
}
