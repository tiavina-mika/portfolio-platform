import { capitalize } from 'string-ts';
import { z } from 'zod';

import i18n, { locales } from '@/config/i18n';
import { articleTranslatedFieldsObj } from '@/constants/cms.constants';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { cutMetaText } from '@/utils/utils';

import { dateForAdvancedSearchSchema, optionSchema } from './app.validations';
import { categoryOptionSchema } from './category.validation';
import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from './zodSchema.validation';
import { CategoryEntityEnum } from '../types/category.type';

export const emptyContent = (value?: string): string => {
  if (!value || value === '<p><br></p>') {
    return '';
  }

  return value;
};

export const articleFilterSchema = z.object({
  title: z.string().optional(),
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  user: z.string().optional(),
  category: categoryOptionSchema.optional(),
  active: z.array(z.boolean().optional()).optional(),
});

export const getCMSTranslatedSchema = (entity = CategoryEntityEnum.ARTICLE) => {
  const translatedSchema: Record<string, any> = {};

  locales.forEach((locale: string) => {
    /*
     * ------------------------------------ //
     * ----- optional for all locales ----- //
     * ------------------------------------ //
     * slug
     */
    translatedSchema[locale + ':slug'] = z.string().max(
      100,
      i18n.t('form.error.max', { field: 'Slug', number: 100 })
    );
    // tags
    translatedSchema[locale + ':tags'] = z.string().max(
      200,
      i18n.t('form.error.max', { field: 'Tags', number: 200 })
    );
    // metaTitle
    translatedSchema[locale + ':metaTitle'] = z.string().transform(cutMetaText(70));
    translatedSchema[locale + ':metaDescription'] = z.string().transform(cutMetaText(170));

    // not required for pages
    translatedSchema[locale + ':description'] = z.string()
      .max(300, i18n.t('form.error.max', { field: i18n.t('common:description'), number: 300 }))
      .transform(capitalize);

    if (entity === CategoryEntityEnum.PAGE) {
      // title is optional for pages
      translatedSchema[locale + ':title'] = z.string().transform(capitalize).optional();
    }

    /*
     * ------------------------------------ //
     * - required only for default locale - //
     * ------------------------------------ //
     * other locales are optional
     */
    if (locale !== DEFAULT_LOCALE) {
      if (entity === CategoryEntityEnum.PAGE) {
        // name is required only for pages
        translatedSchema[locale + ':name'] = z.string().optional();
      }

      if (entity === CategoryEntityEnum.ARTICLE) {
        // title is required only for articles
        translatedSchema[locale + ':title'] = z.string().transform(capitalize);
      }
      translatedSchema[locale + ':content'] = z.string().optional().transform(emptyContent);
    }
    else {
      // required fields only for default locale
      [{
        key: 'name',
        label: i18n.t('cms:pageName'),
        validate: entity === CategoryEntityEnum.PAGE, // required only for pages
      }, {
        key: 'title',
        label: i18n.t('common:title'),
        validate: entity === CategoryEntityEnum.ARTICLE, // required only for articles
      }, {
        key: 'content',
        label: i18n.t('common:content'),
        validate: true,
      }, {
        key: 'description',
        label: i18n.t('common:description'),
        validate: entity === CategoryEntityEnum.ARTICLE, // required only for articles
      }].forEach(({
        key, label, validate,
      }) => {
        if (validate) {
          translatedSchema[locale + ':' + key] = z.string()
            .min(1, i18n.t('form.error.required', { field: label }))
            .transform(capitalize);
        }
      });
    }
  });

  return translatedSchema;
};

export const cmsSchema = z.object({
  active: z.boolean().optional(),
  bannerImage: generateFileSchema(),
  previewImage: generateFileSchema(),
  images: generateFileSchema(false, { max: 5 }),
});

const translatedArticleFormFieldsSchema = generateTranslatedFieldsInputSchema(articleTranslatedFieldsObj);

export const articleSchema = cmsSchema
  .extend({
    ...translatedArticleFormFieldsSchema.shape,
    categories: z.array(optionSchema).min(1),
    image: generateFileSchema(true),
  });

/**
 * Decode and encode translated fields for article
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const articleCodec = getTranslatedFieldsCodec(articleTranslatedFieldsObj);
