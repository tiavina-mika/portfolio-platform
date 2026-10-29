import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, ReactNode } from 'react';
import { z } from 'zod';

import type { ISEOFields } from '@shared/types';


import { Store } from '@/redux/store';
import {
  appMainImagesSchema,
  appSchema,
  autoCompleteOptionSchema,
  confirmDeletionSchema,
  settingsSchema,
  tabAndCategoryRouteSearchParams,
} from '@/validations/app.validations';

import { IFileCloud } from './file.type';
import { IUser } from './user.type';
import { DateType } from './util.type';

export type DefaultMUIColorType =
  | 'default' |
  'primary' |
  'secondary' |
  'error' |
  'info' |
  'success' |
  'warning';
export type ISettingsInput = z.infer<typeof settingsSchema>;
export type ConfirmDeletionInput = z.infer<typeof confirmDeletionSchema>;
export type ITabAndCategorySearchParams = z.infer<typeof tabAndCategoryRouteSearchParams>;
export type IAutocompleteOption = z.infer<typeof autoCompleteOptionSchema>;

export type IAppInput = z.infer<typeof appSchema>;
export type IAppMainImagesInput = z.infer<typeof appMainImagesSchema>;

interface IAppTranslated {
  description: string;
  quote: string;
}

export interface IAppAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  cv?: IFileCloud;
  image?: IFileCloud;
  imageDarkMode?: IFileCloud;
  translated: IAppTranslated;
}

export interface IApp extends Parse.Object<IAppAttributes> {
  id: string;
}
export interface ISelectOption<T = string> {
  label: string;
  value: T;
  icon?: string | ReactNode;
  hide?: boolean;
}

// export interface IAutocompleteOption<T extends object> extends Omit<ISelectOption<T>, 'hide'> {}

interface IAppSnackBar {
  open: boolean;
  type: string;
  message: string;
  duration: number;
}
export enum EnvEnum {
  DEVELOPMENT = 'development',
  PREPROD = 'preprod',
  PRODUCTION = 'production'
}

export type IEnv = `${EnvEnum}`;

export type ISeverity = 'success' | 'info' | 'warning' | 'error' | '';
export interface IAlert {
  severity: ISeverity;
  type?: 'accountVerification' | 'resetPassword'; // add another type later
  message?: string;
  title?: string;
  duration?: 'permanent' | 'temporary';
}

export interface IDownloadAlert {
  id: string;
  type?: ISeverity;
  message: string;
  duration?: number;
}

export interface IAppState {
  app: IApp | null;
  loading: boolean;
  error: string;
  message: string;
  infoMessage: string;
  appSnackBar: IAppSnackBar;
  currentUser?: IUser | null;
  accountEmail?: string;
  pageTitle: string;
  notifications: Record<string, number>;
  alert: IAlert | null;
  downloadAlerts: IDownloadAlert[];
}

export enum EnvironmentEnum {
  DEV = 'DEV',
  PROD = 'PROD'
}

export type OrderType = 'desc' | 'asc';
export interface IOrderList {
  orderBy: string;
  order: OrderType;
}

export interface IFilterInput {
  filters: Record<string, any>;
  search: Record<string, any>;
}

export interface IQueriesInput extends Partial<IFilterInput> {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: string;
  select?: string[];
  include?: string[];
}

export type ListView = 'list' | 'grid';
export interface IListSelectionAction {
  /**
   * @NOTE not used if the action is a component
   */
  onClick?: ((selectedIds: string[]) => void) | undefined;
  /**
   * if the action triggers is an icon
   * @NOTE use either icon or component
   */
  icon?: ReactNode;
  /**
   * if the action triggers is a component
   * @example button, select, input
   * @NOTE use either component or icon
   */
  renderTriggerComponent?: (
    selectedIds: string[],
    // callback to reset selected ids after the action is triggered
    resetSelectedIds: () => void
  ) => ReactNode;
  /**
   * if display only for a certain condition
   * @example display only if the user is an admin
   */
  display?: boolean;
  /**
   * if component: placeholder or label
   * if icon: tooltip
   */
  label?: string;
  /**
   * mainly display secondary actions when the first action is triggered
   * @example dialog, modal, menu, popover, form, ...
   * @param selectedIds
   * @returns
   */
  renderActionComponent?: (selectedIds: string[]) => ReactNode;
}

export interface ITableHeadCell<D> {
  disablePadding?: boolean;
  id: D;
  label: string;
  numeric?: boolean;
  disableSorting?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface IPagination extends IOrderList {
  selected?: any[];
  currentPage: number;
  rowsPerPage: number;
}

// image returned by the upload ap
export interface IDefaultPagination extends Omit<IPagination, 'currentPage'> {
  rowsPerPageOptions?: number[];
}

export interface IIdParams {
  id: string;
}

export interface IRouteContext {
  store: Store | null;
}


export interface ICardRadio<T = string> extends ISelectOption<T> {
  readonly icon?: any;
  readonly description?: string;
}

export type INavigate = ReturnType<typeof useNavigate>;

export interface INotificationMenu {
  objectId: string;
  user?: IUser;
  title: string;
  description: string;
  date: DateType;
  onClick?: () => void; // mainly id
}

export interface IApiError {
  error: string;
  details: {

    /*
     * mainly a translated key
     * @see: middlewares/validation.middleware in the server
     */
    message: string;
    key: string;
  }[];
}

export interface IRenderSearchProps {
  onSearch: (name: string, value: string) => void;
  onAdvancedSearch: (values: Record<string, any>) => void;
}

export interface IMenu<TOnClick = MouseEvent<HTMLElement>> {
  label: string;
  icon?: ReactNode;
  onClick: (value: TOnClick) => void;
  display?: boolean;
}

export interface ITabSearchParams<T = string> {
  tab: T;
}

/**
 * ex: { key: 'active', value: true, label: 'Active', tab: 'active' }
 * => ?tab=active => { active: true }
 */
export interface IListTabValue<T = string | boolean> {
  key: string; // key in database (field)
  value: T; // value in database
  label: string; // label to display (translated)
  tab: string; // tab search param (translated)
  forAdmin?: boolean;
  className?: string; // collection name used to check rights
}

export interface IToFilters {
  tabs: IListTabValue[];
  searchParams: Record<string, string | number | boolean>;
  filters: Record<string, string | number | boolean>;
  acceptedFields?: string[];
}

export interface IAdvancedSearchOption {
  label: string;
  name: string;
  checked: boolean;
  component: ReactNode;
}

export type { ISEOFields };

/**
 * Options for translated fields generation
 * These options define the properties of each translated field.
 */
export type TranslatedFieldOption = {
  name: string;
  required?: boolean;
  min?: number;
  max?: number;
  transform?: (value: any) => any;
};
