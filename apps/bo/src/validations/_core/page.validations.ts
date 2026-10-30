import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  eachSectionBlockTranslatedFieldsObj, pageTranslatedFieldsObj, pageSectionTranslatedFieldsObj,
} from '@/constants/_core/cms.constants';
import { dateForAdvancedSearchSchema, optionSchema } from '@/validations/_core/app.validations';
import { cmsSchema } from '@/validations/_core/article.validations';
import { categoryOptionSchema } from '@/validations/_core/category.validations';
import {
  generateFileSchema,
  generateTranslatedFieldsInputSchema,
  generateTranslatedFieldsOutputSchema,
  getTranslatedFieldsCodec,
} from '@/validations/_core/zodSchema.validations';

/*
 * the number input hands its value back as the typed string, so the bound has to be coerced before
 * it can be compared to a block count — and negative bounds are a typo, never an intent
 */
const blocksFilterSchema = z.coerce.number().int().min(0).optional();

/*
 * written out rather than derived from the article filters: the two lists share most of their
 * fields by coincidence, not by rule — a page has no share count to bound, and an article has no
 * link location or block count. Deriving one from the other sends each list filters the other
 * entity cannot answer.
 */
export const pageFilterSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  metaTitle: z.string().optional(),
  tags: z.string().optional(),
  category: categoryOptionSchema.optional(),
  user: z.string().optional(),
  countries: z.array(z.string().optional()).optional(),
  active: z.array(z.boolean().optional()).optional(),
  linkLocation: z.enum(['menu', 'footer']).optional(),
  minBlocks: blocksFilterSchema,
  maxBlocks: blocksFilterSchema,
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
});

const pageTranslatedFieldsSchema = generateTranslatedFieldsInputSchema(
  pageTranslatedFieldsObj
);

/**
 * Schema of SEO and CMS fields for page
 * @example { 'fr:slug': 'slug-fr', 'fr:metaTitle': 'meta title fr', previewImage: IFileCloud  }
 */
export const pageStepOneSchema = z.object(pageTranslatedFieldsSchema.shape).extend(
  cmsSchema.pick({ previewImage: true }).shape
);

/**
 * Schema of step two fields for page
 * @example { bannerImage: IFileCloud, images: IFileCloud[]  }
 */
export const pageStepTwoSchema = cmsSchema.pick({
  bannerImage: true,
  images: true,
});

/**
 * Schema of step three fields for page
 * @example { categories: ISelectOption[], active: boolean, linkLocations: string[]  }
 */
export const pageStepThreeSchema = z.object({
  categories: z.array(optionSchema).optional(),
  /*
   * UI-only cascade fields (root category -> subcategory -> sub-subcategory) — not persisted
   * directly, they only drive which value ends up in `categories` (see PageFormStepThree)
   * plain category id — picked from a preloaded Select, not the search Autocomplete
   */
  category: z.string().optional(),
  subcategory: z.string().optional(),
  subcategory2: z.string().optional(),
  active: z.boolean().optional(),
  // the country the page is written for
  country: z.string().optional(),
  linkLocations: z.array(z.enum(['menu', 'footer'])).optional(),
  // trims a stray leading/trailing "_" left by typing a separator at the edge of the field
  code: z.string().optional().transform(value => value?.replace(/^_+|_+$/g, '')),
});

export const finalPageSchema = pageStepOneSchema
  .extend(pageStepTwoSchema.shape)
  .extend(pageStepThreeSchema.shape);

/**
 * Database-shaped schema (matches IPage — translated content nested per locale — unlike
 * `finalPageSchema` which is the flattened form schema with `fr:title`-style keys). Used only
 * to generate the downloadable JSON template, since the uploaded file must be in this shape
 * (it goes through `getFinalPageInitialValues` to become form values, not through `finalPageSchema`
 * directly). Image fields are left out — binary uploads aren't fillable by hand in a JSON template,
 * they stay on the dropzone UI — and `categories` is left out since JsonUploadButton already
 * ignores it (see `fieldsToIgnore` in PageFormStepOne).
 */
export const pageDbTemplateSchema = z.object({
  translated: generateTranslatedFieldsOutputSchema(pageTranslatedFieldsObj),
  code: z.string().optional(),
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
  imagePosition: z.enum(['top', 'bottom', 'left', 'right']).optional(),
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
export const pageCodec = getTranslatedFieldsCodec(pageTranslatedFieldsObj);
export const pageSectionCodec = getTranslatedFieldsCodec(pageSectionTranslatedFieldsObj);
