import type { IProjectTranslatedFields, IProjectUrl } from '@shared/domain-types';

import { Locale } from '@/i18n/config';

import { IFileCloud } from './app.type';
import { ICategory } from './cms.type';

export type { IProjectUrl };

interface IProjectTranslated extends Record<Locale, IProjectTranslatedFields> {}

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
  totalMediaShare?: number;
}

export interface IProject extends IProjectAttributes {
  id: string;
}
