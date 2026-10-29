import Parse from 'parse';

import { Locale } from '@/i18n/config';

import { IFileCloud, ISEOFields } from './app.type';
import { ICategory } from './cms.type';

interface IProjectTranslatedFields extends ISEOFields {
  description?: string;
  slug?: string;
  title?: string;
  name?: string;
  content?: string;
  tags?: string;
  societyDescription?: string;
}

interface IProjectTranslated extends Record<Locale, IProjectTranslatedFields> {}

export interface IProjectUrl {
  url: string;
}
export interface IProjectAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  deleted: boolean;
  translated: IProjectTranslated;
  logo?: IFileCloud;
  image?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  website?: string;
  society?: string;
  links?: IProjectUrl[];
  repositories?: IProjectUrl[];
  youtube?: string;
  npm?: IProjectUrl[];
  codesandbox?: IProjectUrl[];
  platforms?: string[];
  technologies?: string[];
  categories?: ICategory[];
}

export interface IProject extends Parse.Object<IProjectAttributes> {
  id: string;
}
