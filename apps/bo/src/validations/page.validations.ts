import { z } from 'zod';

import i18n from '@/config/i18n';
import { eachSectionBlockTranslatedFieldsObj, pageSectionTranslatedFieldsObjOld, pageTranslatedFieldsObj } from '@/constants/cms.constants';

import { pageSectionTranslatedFieldsObj } from './../constants/cms.constants';
import { optionSchema } from './app.validations';
import {
  articleFilterSchema, cmsSchema,
} from './article.validations';
import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from './zodSchema.validation';

export const pageFilterSchema = articleFilterSchema.extend({ metaTitle: z.string().optional() });

const pageTranslatedFieldsSchema = generateTranslatedFieldsInputSchema(
  pageTranslatedFieldsObj
);

/**
 * Schema of SEO and CMS fields for page
 * @example { 'fr:slug': 'slug-fr', 'fr:metaTitle': 'meta title fr'  }
 */
export const pageStepOneSchema = z.object(pageTranslatedFieldsSchema.shape);

/**
 * Schema of step two fields for page
 * @example { bannerImage: IFileCloud, previewImage: IFileCloud  }
 */
export const pageStepTwoSchema = cmsSchema.pick({
  bannerImage: true,
  previewImage: true,
  images: true,
});

/**
 * Schema of step three fields for page
 * @example { categories: ISelectOption[], active: boolean, linkLocations: string[]  }
 */
export const pageStepThreeSchema = z.object({
  categories: z.array(optionSchema).optional(),
  active: z.boolean().optional(),
  linkLocations: z.array(z.enum(['menu', 'footer'])).optional(),
});

/**
 * Schema of each block of a page
 * @example { 'fr:title': 'title-fr', 'en:title': 'title-en'  }
 */
const eachTranslatedSectionBlockFormFieldsSchema = generateTranslatedFieldsInputSchema(
  eachSectionBlockTranslatedFieldsObj
);

/**
 * Schema of a page block
 * @Note it's used in an array, so no need to make it optional
 * @example { 'fr:title': 'title-fr', image: IFileCloud, imagePosition: 'left'  }
 */
export const sectionBlockSchema = z.object({
  ...eachTranslatedSectionBlockFormFieldsSchema.shape,
  image: generateFileSchema(false),
  imagePosition: z.enum(['left', 'right', 'bottom']).optional(),
}).refine((values) => {
  if (!values.image) return true;
  // imagePosition is required if image is set
  return values.imagePosition;
}, {
  message: i18n.t('cms:errors.imagePositionRequired'),
  path: ['imagePosition'],
});


export const sectionBlocksSchema = z.object({ blocks: z.array(sectionBlockSchema).optional() });

export const pageSectionTranslatedFieldsSchema = generateTranslatedFieldsInputSchema(
  pageSectionTranslatedFieldsObj
);

export const pageSectionSchema = z.object({
  ...pageSectionTranslatedFieldsSchema.shape,
  blocks: z.array(sectionBlockSchema).optional(),
  active: z.boolean().optional(),
});

/**
 * Decode and encode translated fields for article
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const eachSectionBlockCodec = getTranslatedFieldsCodec(eachSectionBlockTranslatedFieldsObj);
export const pageSectionOldCodec = getTranslatedFieldsCodec(pageSectionTranslatedFieldsObjOld);
export const pageCodec = getTranslatedFieldsCodec(pageTranslatedFieldsObj);
export const pageSectionCodec = getTranslatedFieldsCodec(pageSectionTranslatedFieldsObj);
