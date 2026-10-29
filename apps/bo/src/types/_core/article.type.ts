import { z } from 'zod';


import type { ISEOFields } from '@/types/_core/app.type';
import type { ICategory } from '@/types/_core/category.type';
import type { IFileCloud, ITranslatedFileCloud } from '@/types/_core/file.type';
import type { IUser } from '@/types/_core/user.type';

import { articleFilterSchema, articleSchema } from '@/validations/_core/article.validations';

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
  // audience counters — `views` is bumped by the public website, `viewsGoal` is set by the editor
  views?: number;
  viewsGoal?: number;
  active: boolean;
  // the country the article is written for — absent on an article saved before the field existed
  country?: string;
}

export type IArticle = IArticleAttributes & { id: string };

/**
 * where an article stands, read off the two flags it actually carries: `deleted` puts it in the
 * bin, `active` is what the public website checks before showing it. There is no editorial
 * workflow behind this — an article is either visible, not visible yet, or binned.
 */
export enum ArticleStatusEnum {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
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
