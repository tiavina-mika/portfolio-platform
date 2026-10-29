import { z } from 'zod';

import { readOnlyLocales } from '@/config/i18n';
import { appTranslatedFieldsObj } from '@/constants/app.constants';

import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from './zodSchema.validation';

type ZodLiteralType = string | number | boolean | bigint;

const createManyUnion = <
  A extends Readonly<[ZodLiteralType, ZodLiteralType, ...ZodLiteralType[]]>
>(literals: A) => {
  const literalSchemas = literals.map(value => z.literal(value)) as [
    z.ZodLiteral<A[number]>,
    ...z.ZodLiteral<A[number]>[]
  ];

  return z.union(literalSchemas);
};

export const localeSchema = createManyUnion(
  readOnlyLocales as typeof readOnlyLocales & [string, string, ...string[]]
);
export const dateForAdvancedSearchSchema = z.array(z.coerce.date().nullable()).optional();

export const settingsSchema = z.object({ locale: localeSchema });

export const confirmDeletionSchema = z.object({ confirmation: z.string() });

export const selectOptionSchema = z.object({
  label: z.string().nullable(),
  value: z.string().nullable(),
});

export const getSelectOptionSchema = (nullable = true): any => {
  const option = z.object({
    label: z.string().nullable(),
    value: nullable
      ? z.string().nullable()
      : z.string(),
  });

  return option;
};

export const tabRouteSearchParams = z.object({ tab: z.string().optional() });

export const tabAndCategoryRouteSearchParams = tabRouteSearchParams
  .extend({ category: z.string().optional() });

export const autoCompleteOptionSchema = z.object({
  label: z.string(),
  value: z.record(z.string(), z.string()),
});

const appFileTypes = ['jpg', 'jpeg', 'png', 'webp'];
const translatedAppFormFieldsSchema = generateTranslatedFieldsInputSchema(appTranslatedFieldsObj);

export const appSchema = z.object(translatedAppFormFieldsSchema.shape);

/**
 * Decode and encode translated fields for category
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const appCodec = getTranslatedFieldsCodec(appTranslatedFieldsObj);


export const appMainImagesSchema = z.object({
  image: generateFileSchema(true, { maxSize: 6, extensions: appFileTypes }),
  imageForDarkMode: generateFileSchema(false, { maxSize: 6, extensions: appFileTypes }),
});

export const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
}).transform((value) => {
  // save only the value
  return value.value;
});
