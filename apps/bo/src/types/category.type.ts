import { z } from 'zod';

import { categoryFilterSchema, categorySchema } from '@/validations/category.validation';

import { ISelectOption } from './app.type';
import { IFileCloud } from './file.type';
import { IUser } from './user.type';

export interface ICategoryTranslatedFields {
  name: string;
  slug?: string;
  tags?: string;
}

// export type TranslatedFormFieldsCategory = z.infer<typeof translatedCategoryFormFieldsSchema>;

export enum CategoryEntityEnum {
  ARTICLE = 'article',
  PAGE = 'page'
}

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
}
export interface ICategory extends Parse.Object<ICategoryAttributes> {
  id: string;
}

export interface ICategoryState {
  loading: boolean;
  category: ICategory | null;
  categories: ICategory[];
  count: number;
  categoriesOptions: ISelectOption[];
}

export type ICategoryInput = z.infer<typeof categorySchema>;
export type CategoryFiltersInput = z.infer<typeof categoryFilterSchema>;
