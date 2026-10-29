import { Dayjs } from 'dayjs';
import { ComponentType } from 'react';
import { z } from 'zod';

import { Locale } from '@/i18n/config';
import {
  ContactSchema,
  NewsletterSchema,
  UnsubscribeReasonSchema,
} from '@/validations/app.validations';

interface IContactAttributes {
  name: string;
  email: string;
  message: string;
  createdAt?: string;
  objectId: string;
}

export interface IContact extends Parse.Object<IContactAttributes> {
  id: string;
}
interface IAppTranslatedFields {
  description: string;
  quote: string;
}

export interface IAppTranslated extends Record<Locale, IAppTranslatedFields> {}

export interface IAppAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  cv?: IFileCloud;
  image?: IFileCloud;
  imageForDarkMode?: IFileCloud;
  translated: IAppTranslated;
}

export interface IApp extends Parse.Object<IAppAttributes> {
  id: string;
}

export interface ISelectOption<T = string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string }> | string;
}

export interface IMenuItem {
  label: string;
  onClick: () => void;
  id?: string;
}

export interface IInfo {
  title: string;
  description: string;
  icon?: string;
}
export interface IDynamicRouteParams {
  pathname: 'string';
  params: Record<string, string>;
}

export type IMenu = ISelectOption<string | IDynamicRouteParams> & {
  id?: string;
  display?: 'mobile' | 'desktop' | 'both';
};
export interface INavBarSubMenuItem extends IMenu {
  title: string;
}

export interface INavBar {
  title: string;
  items: INavBarSubMenuItem[];
}

export type INavBarMenu = INavBar[] | IMenu[];

export type DateType = string | number | Date | Dayjs | null | undefined;

// in database, it's a date type, but Parse Server extract the date with this type
export type ParseServerDate = {
  __type: string;
  iso: Date;
};

export type ITranslatedError = {
  path: string;
  message: string;
};

export type IActionError = {
  success: false;
  message?: string;
  errors?: ITranslatedError[]; // list of translation key messages
};

export type IError = {
  error: string;
};
export type IServerResponse<T> = T | IError;

export interface IResponsiveBreakpoints {
  width: number;
  height: number;
  url: string;
  size: number;
}

export interface IUploadedFile {
  publicId: string;
  url: string;
  createdAt?: Date;
  size?: string;
  responsiveBreakpoints?: IResponsiveBreakpoints[][];
}

export interface IPagination {
  page: number;
  perPage: number;
}

interface IOrder {
  orderedBy?: string;
  order?: 'asc' | 'desc';
}

export interface IListFilter extends IPagination, IOrder {
  locale?: Locale;
}

export interface IPaginationQuery {
  limit: number;
  skip: number;
}

export interface IInputQuery extends IOrder, IPaginationQuery {
  locale?: Locale;
  tag?: string;
}

export interface ISort {
  orderedBy: string;
  order: 'asc' | 'desc';
}

export interface ISEOFields {
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
}

export interface IFileCloud {
  url: string;
  publicId: string;
}

export interface ISearchParams extends Pick<IPagination, 'page'>, ISort {
  tag?: string;
}

export type ISearchResult = {
  id: string;
  title: string;
  url: string;
};

export type IContactInput = z.infer<typeof ContactSchema>;
export type INewsletterInput = z.infer<typeof NewsletterSchema>;
export type IUnsubscribeReasonSchemaInput = z.infer<
  typeof UnsubscribeReasonSchema
>;

export type ITranslated<T> = Record<string, T>;
