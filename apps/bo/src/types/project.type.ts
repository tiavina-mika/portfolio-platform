import { z } from 'zod';

import { projectFilterSchema, projectSchema } from '@/validations/project.validation';

import type { IProjectTranslatedFields, IProjectUrl } from '@shared/domain-types';
import { ICategory } from './category.type';
import { IFileCloud, ITranslatedFileCloud } from './file.type';

export type { IProjectTranslatedFields, IProjectUrl } from '@shared/domain-types';
export interface IProjectAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
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
  shares?: Record<string, number>;
  totalMediaShare?: number;
  active: boolean;
  codesandbox?: IProjectUrl[];
  platforms?: string[];
  technologies?: string[];
  types?: string[];
  categories?: ICategory[];
  dateStart?: string;
  dateEnd?: string;
}

export interface IProject extends Parse.Object<IProjectAttributes> {
  id: string;
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
