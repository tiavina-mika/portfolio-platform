import { z } from 'zod';


import type { ICategory } from '@/types/_core/category.type';
import type { IFileCloud, ITranslatedFileCloud } from '@/types/_core/file.type';
import type { IUser } from '@/types/_core/user.type';
import type { IParseServerDate } from '@/types/_core/utils.type';
import type { IProjectTranslatedFields, IProjectUrl } from '@shared/domain-types';

import { projectFilterSchema, projectSchema } from '@/validations/_domain/project.validations';

export type { IProjectTranslatedFields, IProjectUrl } from '@shared/domain-types';

export interface IProjectAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  user?: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
  deletedAt?: string;
  deleted: boolean;
  translated: IProjectTranslatedFields;
  logo?: IFileCloud;
  image?: IFileCloud;
  previewImage?: IFileCloud;
  images?: IFileCloud[];
  editorFiles?: ITranslatedFileCloud[];
  website?: string;
  society?: string;
  links?: IProjectUrl[];
  repositories?: IProjectUrl[];
  youtube?: string;
  npm?: IProjectUrl[];
  codesandbox?: IProjectUrl[];
  shares?: Record<string, number>;
  totalMediaShare?: number;
  active: boolean;
  platforms?: string[];
  technologies?: string[];
  types?: string[];
  categories?: ICategory[];
  // read back from the stored object, where a date comes wrapped (see `getParseDateValue`)
  dateStart?: string | IParseServerDate;
  dateEnd?: string | IParseServerDate;
}

export type IProject = IProjectAttributes & { id: string };

/**
 * where a project stands, read off the two flags it carries: `active` is what the public website
 * checks before showing it, `deleted` puts it in the recycle bin.
 */
export enum ProjectStatusEnum {
  PUBLISHED = 'published',
  DRAFT = 'draft'
}

export interface IProjectState {
  loading: boolean;
  project: IProject | null;
  projects: IProject[];
  count: number;
  editorTempFiles: ITranslatedFileCloud[];
}

export type IProjectInput = z.infer<typeof projectSchema>;
export type ProjectFiltersInput = z.infer<typeof projectFilterSchema>;
