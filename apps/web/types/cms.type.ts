import Parse from 'parse';
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

export type ITranslatedPageBlock = Record<
  string,
  Omit<IPageTranslatedFields, 'name'>
>;

export interface IPageBlock {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  deleted: boolean;
  translated: ITranslatedPageBlock;
  image: IFileCloud;
}

export interface ICategoryTranslatedFields {
  name: string;
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
};

export enum CategoryEntityEnum {
  ARTICLE = 'article',
  PAGE = 'page'
}

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
}
export interface ICategory extends Parse.Object<ICategoryAttributes> {
  id: string;
}

export interface IPageAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  translated: IPageTranslated;
  bannerImage?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  category?: ICategory;
  blocks?: IPageBlock[];
  linkLocations?: ('menu' | 'footer')[];
  active: boolean;
}

export interface IPage extends Parse.Object<IPageAttributes> {
  id: string;
}
