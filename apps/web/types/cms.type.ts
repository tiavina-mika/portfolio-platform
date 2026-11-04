import { CategoryEntityEnum } from '@shared/types';
import { Locale } from 'use-intl/core';

import {
  IFileCloud, IInputQuery, ISelectOption, ISEOFields,
} from './app.type';
import { IUser } from './user.type';

interface IPageTranslatedFields extends ISEOFields {
  title: string;
  name: string;
  content: string;
  description?: string;
}

interface IPageTranslated extends Record<Locale, IPageTranslatedFields> {}

// ------- page sections ------- //
export type ITranslatedSectionBlock = Record<string, Omit<IPageTranslatedFields, 'name'>>;

export interface ISectionBlockObj {
  id: string;
  translated: ITranslatedSectionBlock;
  image: IFileCloud;
  imagePosition: 'top' | 'bottom' | 'left' | 'right';
}

export interface IPageSectionAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  deleted: boolean;
  translated: Record<string, { title: string; description?: string }>;
  active: boolean;
  pages: IPage[];
  blocks: ISectionBlockObj[];
}

export interface IPageSection extends IPageSectionAttributes {
  id: string;
}

// ------- categories ------- //
export interface ICategoryTranslatedFields {
  name: string;
  slug?: string;
  tags?: string;
  // absent on categories saved before the back-office offered them — the page falls back to the name
  metaTitle?: string;
  metaDescription?: string;
}

export interface ICMSInputQuery extends IInputQuery {
  tag?: string;
  category?: string;
}

export interface IProjectInputQuery extends IInputQuery {
  tag?: string;
  technologies?: string;
  society?: string;
  otherThanProjectId?: string;
}

export type PagesForUrlsOutput = {
  footers: ISelectOption[];
  menus: ISelectOption[];
  footersGroupedByCategory: ISelectOption<ISelectOption[]>[];
};

export enum PageLinkPositionEnum {
  MENU = 'menu',
  FOOTER = 'footer'
}

export type ICategoryTypeEntity = `${CategoryEntityEnum}`;
export type ICategoryEntityOption = ISelectOption<ICategoryTypeEntity>;
export interface ICategoryTranslated extends Record<Locale, ICategoryTranslatedFields> {}
export interface ICategoryAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deletedAt?: string;
  deleted: boolean;
  translated: ICategoryTranslated;
  image?: IFileCloud;
  // each category can be linked to an article, a page, product, ...
  entity: CategoryEntityEnum;
  // absent = root category; set = this category is a subcategory (max depth: 2 levels)
  parentCategory?: ICategory;
  // precomputed — true when at least one active, non-deleted subcategory points to this category
  hasSubcategories?: boolean;
}
export interface ICategory extends ICategoryAttributes {
  id: string;
}

export interface IPageAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  // stable technical identifier, independent of language/title — unlike `translated.<locale>.slug`
  code?: string;
  translated: IPageTranslated;
  bannerImage?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  categories?: ICategory[];
  linkLocations?: ('menu' | 'footer')[];
  active: boolean;
}

export interface IPage extends IPageAttributes {
  id: string;
}

/*
 * a subcategory paired with a small preview of its own pages plus their total count — used to
 * render a level-3 subcategory's content inline on its level-2 parent's listing page
 */
export interface ICategoryWithPagesPreview {
  category: ICategory;
  pages: IPage[];
  total: number;
}
