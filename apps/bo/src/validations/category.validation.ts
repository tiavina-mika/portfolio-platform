
import { z } from 'zod';

import { categoryTranslatedFieldsObj } from '@/constants/cms.constants';
import { CategoryEntityEnum } from '@/types/category.type';
import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from '@/validations/zodSchema.validation';

import { dateForAdvancedSearchSchema } from './app.validations';

const translatedCategoryFormFieldsSchema = generateTranslatedFieldsInputSchema(categoryTranslatedFieldsObj);

export const categorySchema = z.object({
  active: z.boolean(),
  entity: z.enum(CategoryEntityEnum),
  image: generateFileSchema(true),
  ...translatedCategoryFormFieldsSchema.shape,
});

/**
 * Decode and encode translated fields for category
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const categoryCodec = getTranslatedFieldsCodec(categoryTranslatedFieldsObj);

export const categoryFilterSchema = z.object({
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  user: z.string().optional(),
  entity: z.string().optional(),
  active: z.array(z.boolean().optional()).optional(),
});

export const categoryOptionSchema = z.object({
  label: z.string(),
  value: z.object({ objectId: z.string() }),
}).transform((value) => {
  return value.value.objectId;
});
