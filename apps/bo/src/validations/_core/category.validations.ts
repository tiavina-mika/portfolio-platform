import { CategoryEntityEnum } from '@shared/types';
import { z } from 'zod';

import { categoryTranslatedFieldsObj } from '@/constants/_core/cms.constants';
import { CategoryLevelEnum } from '@/types/_core/category.type';
import { dateForAdvancedSearchSchema } from '@/validations/_core/app.validations';
import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from '@/validations/_core/zodSchema.validations';


const translatedCategoryFormFieldsSchema = generateTranslatedFieldsInputSchema(categoryTranslatedFieldsObj);

export const categoryOptionSchema = z.object({
  label: z.string(),
  // hasSubcategories: precomputed on the category — lets a cascade select decide whether to show a subcategory picker
  value: z.object({ objectId: z.string(), hasSubcategories: z.boolean().optional() }),
}).transform((value) => {
  return value.value.objectId;
});

export const categorySchema = z.object({
  active: z.boolean(),
  entity: z.enum(CategoryEntityEnum),
  image: generateFileSchema(true),
  // trims a stray leading/trailing "_" left by typing a separator at the edge of the field
  code: z.string().optional().transform(value => value?.replace(/^_+|_+$/g, '')),
  /*
   * absent = root category; set = this category is a subcategory (max depth: 3 levels)
   * plain category id — picked from a preloaded Select (see CategoryForm), not the search Autocomplete
   */
  parentCategory: z.string().optional(),
  ...translatedCategoryFormFieldsSchema.shape,
});

/**
 * Decode and encode translated fields for category
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const categoryCodec = getTranslatedFieldsCodec(categoryTranslatedFieldsObj);

/*
 * the number input hands its value back as the typed string, so the bound has to be coerced before
 * it can be compared to an item count — and negative bounds are a typo, never an intent
 */
const itemsFilterSchema = z.coerce.number().int().min(0).optional();

export const categoryFilterSchema = z.object({
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  user: z.string().optional(),
  entity: z.string().optional(),
  active: z.array(z.boolean().optional()).optional(),
  level: z.enum(CategoryLevelEnum).optional(),
  minItems: itemsFilterSchema,
  maxItems: itemsFilterSchema,
});
