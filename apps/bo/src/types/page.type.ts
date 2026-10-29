import { z } from 'zod';

import {
  sectionBlocksSchema,
  pageFilterSchema,
  pageSectionSchema,
  pageStepOneSchema,
  pageStepThreeSchema,
  pageStepTwoSchema,
} from '@/validations/page.validations';

import { ISEOFields } from './app.type';
import { ICategory } from './category.type';
import { IFileCloud, ITranslatedFileCloud } from './file.type';
import { IUser } from './user.type';

export interface IPageTranslatedFields extends ISEOFields {
  title: string;
  name: string;
  content: string;
  description?: string;
  blockTitle?: string;
  blockDescription?: string;
}

export type ITranslatedSectionBlock = Record<string, Omit<IPageTranslatedFields, 'name'>>;

export interface ISectionBlockObj {
  id: string;
  translated: ITranslatedSectionBlock;
  image: IFileCloud;
  imagePosition: 'left' | 'right' | 'bottom';
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

export interface IPageSection extends Parse.Object<IPageSectionAttributes> {
  id: string;
}

export interface IPageAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deletedAt?: string;
  deleted: boolean;
  translated: IPageTranslatedFields;
  bannerImage?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  categories?: ICategory[];
  linkLocations?: ('menu' | 'footer')[];
  active: boolean;
  editorFiles?: ITranslatedFileCloud[];
}

export interface IPage extends Parse.Object<IPageAttributes> {
  id: string;
}

export interface IPageState {
  loading: boolean;
  page: IPage | null;
  pages: IPage[];
  count: number;
  editorTempFiles: ITranslatedFileCloud[];
  pageSections: IPageSection[];
  pageSection: IPageSection | null;
  pageSectionCount: number;
  sectionsByPage: IPageSection[];
}

export type IPageStepOneInput = z.infer<typeof pageStepOneSchema>;
export type IPageStepTwoInput = z.infer<typeof pageStepTwoSchema>;
export type IPageStepThreeInput = z.infer<typeof pageStepThreeSchema>;
export type IPageInput = IPageStepOneInput & IPageStepTwoInput & IPageStepThreeInput;

export type ISectionBlocksInput = z.infer<typeof sectionBlocksSchema>;

export type PageFiltersInput = z.infer<typeof pageFilterSchema>;

export type PageSectionInput = z.infer<typeof pageSectionSchema>;
