import { CategoryEntityEnum } from '@shared/types';
import { z } from 'zod';


import type { IEntityState } from '@/redux/factories/_core/entitySlice.factory';
import type { ISelectOption } from '@/types/_core/app.type';
import type { IFileCloud } from '@/types/_core/file.type';
import type { IUser } from '@/types/_core/user.type';

import { categoryFilterSchema, categorySchema } from '@/validations/_core/category.validations';

export interface ICategoryTranslatedFields {
  name: string;
  slug?: string;
  tags?: string;
  // absent on categories saved before the form offered them — the website then falls back to the name
  metaTitle?: string;
  metaDescription?: string;
}

// export type TranslatedFormFieldsCategory = z.infer<typeof translatedCategoryFormFieldsSchema>;

export type ICategoryTypeEntity = `${CategoryEntityEnum}`;
export type ICategoryEntityOption = ISelectOption<ICategoryTypeEntity>;
export interface ICategoryAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deletedAt?: string;
  deleted: boolean;
  translated: ICategoryTranslatedFields;
  image?: IFileCloud;
  // each category can be linked to an article, a page, product, ...
  entity: CategoryEntityEnum;
  active: boolean;
  // stable technical identifier, independent of language/title — unlike `translated.<locale>.slug`
  code?: string;
  itemCount?: number;
  // absent = root category; set = this category is a subcategory (max depth: 3 levels)
  parentCategory?: ICategory;
  // precomputed — true when at least one active, non-deleted subcategory points to this category
  hasSubcategories?: boolean;
  /*
   * how many subcategories hang under the category and how much content it files. Computed per
   * request by the list endpoint and never stored — the persisted `itemCount` above folds items
   * and subcategories into a single figure, which cannot be split back apart. Absent on a category
   * fetched on its own.
   */
  subcategoriesCount?: number;
  activeSubcategoriesCount?: number;
  itemsCount?: number;
  publishedItemsCount?: number;
}
export type ICategory = ICategoryAttributes & { id: string };

/**
 * where a category stands, read off the two flags it actually carries: `deleted` puts it in the
 * bin, `active` is what decides whether it is offered on the public website. There is no editorial
 * workflow behind this — a category is either in use, switched off, or binned.
 */
export enum CategoryStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted'
}

// where a category sits in the tree — what having a `parentCategory` means, never a stored depth
export enum CategoryLevelEnum {
  ROOT = 'root',
  SUBCATEGORY = 'subcategory'
}

export type ICategoryState = IEntityState<ICategory>;

export type ICategoryInput = z.infer<typeof categorySchema>;
export type CategoryFiltersInput = z.infer<typeof categoryFilterSchema>;
