import { z } from 'zod';

import i18n from '@/config/i18n';
import { CMS_GALLERY_MAX_IMAGES } from '@/constants/_core/cms.constants';
import {
  PROJECT_CODESANDBOX_HOST, PROJECT_NPM_HOST, PROJECT_REPOSITORY_HOSTS, PROJECT_YOUTUBE_HOST,
  projectTranslatedFieldsObj,
} from '@/constants/_domain/project.constants';
import { dateForAdvancedSearchSchema, tabRouteSearchParams } from '@/validations/_core/app.validations';
import {
  generateFileSchema,
  generateTranslatedFieldsInputSchema,
  getTranslatedFieldsCodec,
} from '@/validations/_core/zodSchema.validations';

type OptionalFileSchemaType = z.ZodType<File | undefined, File | undefined>;
type OptionalFileArraySchemaType = z.ZodType<File[] | undefined, File[] | undefined>;

export const projectsRouteSearchParams = tabRouteSearchParams;

export type ProjectsRouteSearchParams = z.infer<typeof projectsRouteSearchParams>;

export const projectFilterSchema = z.object({
  title: z.string().optional(),
  tags: z.string().optional(),
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  active: z.array(z.boolean().optional()).optional(),
  types: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

const translatedProjectFormFieldsSchema = generateTranslatedFieldsInputSchema(projectTranslatedFieldsObj);

/**
 * Decode and encode translated fields for project
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const projectCodec = getTranslatedFieldsCodec(projectTranslatedFieldsObj);

const urlSchema = z.string()
  .url({ message: i18n.t('common:form.error.invalidUrl') })
  .optional()
  .or(z.literal(''));

// an address is optional, but when it is typed it must belong to the kind of site the field is for
const hostUrlSchema = (hosts: string[], message: string) => z.string()
  .optional()
  .refine((value) => !value || hosts.some((host) => value.includes(host)), { message });

export const projectSchema = z.object({
  active: z.boolean().optional(),
  image: generateFileSchema(true) as OptionalFileSchemaType,
  logo: generateFileSchema() as OptionalFileSchemaType,
  previewImage: generateFileSchema() as OptionalFileSchemaType,
  images: generateFileSchema(false, { max: CMS_GALLERY_MAX_IMAGES }) as OptionalFileArraySchemaType,
  website: urlSchema,
  youtube: hostUrlSchema([PROJECT_YOUTUBE_HOST], i18n.t('project:project.invalidYoutubeUrl')),
  society: z.string().optional(),
  links: z.array(z.object({ url: urlSchema })).optional(),
  repositories: z.array(z.object({
    url: hostUrlSchema(PROJECT_REPOSITORY_HOSTS, i18n.t('project:project.invalidRepositoryUrl')),
  })).optional(),
  npm: z.array(z.object({
    url: hostUrlSchema([PROJECT_NPM_HOST], i18n.t('project:project.invalidNpmUrl')),
  })).optional(),
  codesandbox: z.array(z.object({
    url: hostUrlSchema([PROJECT_CODESANDBOX_HOST], i18n.t('project:project.invalidCodesandboxUrl')),
  })).optional(),
  dateRange: dateForAdvancedSearchSchema,
  types: z.array(z.string()).min(1),
  platforms: z.array(z.string()).optional(),
  technologies: z.array(z.string()).min(1),
  ...translatedProjectFormFieldsSchema.shape,
});
