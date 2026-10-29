import { z } from 'zod';

import { articleFilterSchema, articleSchema } from '@/validations/article.validations';

import { ISEOFields } from './app.type';
import { ICategory } from './category.type';
import { IFileCloud, ITranslatedFileCloud } from './file.type';
import { IUser } from './user.type';

export interface IArticleTranslatedFields extends ISEOFields {
  title: string;
  content: string;
  description: string;
}

export interface IArticleAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deletedAt?: string;
  deleted: boolean;
  translated: IArticleTranslatedFields;
  image?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  categories: ICategory[];
  editorFiles?: ITranslatedFileCloud[];
  shares?: Record<string, number>;
  totalMediaShare?: number;
  active: boolean;
}

export interface IArticle extends Parse.Object<IArticleAttributes> {
  id: string;
}

export interface IArticleState {
  loading: boolean;
  article: IArticle | null;
  articles: IArticle[];
  count: number;
  editorTempFiles: ITranslatedFileCloud[];
}

export type IArticleInput = z.infer<typeof articleSchema>;
export type ArticleFiltersInput = z.infer<typeof articleFilterSchema>;
