import { z } from 'zod';


import type { IListTabCounts, ISEOFields } from '@/types/_core/app.type';
import type { ICategory } from '@/types/_core/category.type';
import type { IFileCloud, ITranslatedFileCloud } from '@/types/_core/file.type';
import type { IUser } from '@/types/_core/user.type';

import {
  sectionBlocksSchema,
  pageFilterSchema,
  pageSectionSchema,
  pageStepOneSchema,
  pageStepThreeSchema,
  pageStepTwoSchema,
  finalPageSchema,
} from '@/validations/_core/page.validations';

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
  imagePosition: 'top' | 'bottom' | 'left' | 'right';
}

export interface IPageSectionTranslatedFields {
  title: string;
  description?: string;
}

export interface IPageSectionAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user?: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deleted: boolean;
  deletedAt?: string;
  translated: Record<string, IPageSectionTranslatedFields>;
  active: boolean;
  pages: IPage[];
  blocks: ISectionBlockObj[];
  imagePosition: 'top' | 'bottom' | 'left' | 'right';
}

export type IPageSection = IPageSectionAttributes & { id: string };

/** where one block of the section form stands, as its entry in the list of blocks shows it */
export interface ISectionBlockProgress {
  /** its title in the open language tab, empty while it has none */
  title: string;
  /** a title and a content in the default language — what the site needs to draw it */
  isComplete: boolean;
  /** a title in the open language tab */
  isTranslated: boolean;
  hasImage: boolean;
  imagePosition?: ISectionBlockObj['imagePosition'];
  hasErrors: boolean;
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
  // the country the page is written for — absent on a page saved before the field existed
  country?: string;
  editorFiles?: ITranslatedFileCloud[];
  // stable technical identifier, independent of language/title — unlike `translated.<locale>.slug`
  code?: string;
  /*
   * how much content the page holds, summed over the sections pointing at it. Computed per request
   * by the list endpoint and never stored on the page — absent on a page fetched on its own.
   */
  sectionsCount?: number;
  publishedSectionsCount?: number;
  blocksCount?: number;
}

export type IPage = IPageAttributes & { id: string };

/**
 * where a page stands, read off the two flags it actually carries: `deleted` puts it in the bin,
 * `active` is what the public website checks before showing it. There is no editorial workflow
 * behind this — a page is either on the site, not on it yet, or binned.
 */
export enum PageStatusEnum {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  DELETED = 'deleted'
}

export interface IPageState {
  loading: boolean;
  page: IPage | null;
  pages: IPage[];
  count: number;
  // how many pages each tab of the list holds, whichever tab is currently being displayed
  tabCounts: IListTabCounts;
  editorTempFiles: ITranslatedFileCloud[];
  pageSections: IPageSection[];
  pageSection: IPageSection | null;
  pageSectionCount: number;
  sectionsByPage: IPageSection[];
}

export type IPageStepOneInput = z.infer<typeof pageStepOneSchema>;
export type IPageStepTwoInput = z.infer<typeof pageStepTwoSchema>;
export type IPageStepThreeInput = z.infer<typeof pageStepThreeSchema>;
// raw values entered in the form, before the schema's transforms (categories option -> id) are applied
export type IPageStepThreeFormInput = z.input<typeof pageStepThreeSchema>;
export type IPageInput = z.infer<typeof finalPageSchema>;
/*
 * raw values entered across the whole PageForm wizard, before the schema's transforms
 * (categories option -> id) are applied. Built as an intersection of the already-correct
 * per-step input types rather than `z.input<typeof finalPageSchema>` directly — the repeated
 * `.extend()` chain behind `finalPageSchema` degrades some fields (e.g. `category`,
 * `subcategory`) to `{}` at the type level once combined with the translated fields' loosely
 * typed `z.ZodObject<any>` shape (see `generateTranslatedFieldsInputSchema`).
 */
export type IPageFormInput = IPageStepOneInput & IPageStepTwoInput & IPageStepThreeFormInput;

export type ISectionBlocksInput = z.infer<typeof sectionBlocksSchema>;

export type PageFiltersInput = z.infer<typeof pageFilterSchema>;

export type PageSectionInput = z.infer<typeof pageSectionSchema>;
