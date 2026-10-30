import { CategoryEntityEnum } from '@shared/types';
import { capitalize } from 'string-ts';
import { z } from 'zod';

import i18n, { locales } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  ARTICLE_VIEWS_GOAL_MAX,
  ARTICLE_VIEWS_GOAL_MIN,
  articleTranslatedFieldsObj, CMS_GALLERY_MAX_IMAGES, META_DESCRIPTION_MAX_LENGTH, META_TITLE_MAX_LENGTH,
} from '@/constants/_core/cms.constants';
import { cutMetaText } from '@/utils/_core/utils';
import { dateForAdvancedSearchSchema, tabAndCategoryRouteSearchParams } from '@/validations/_core/app.validations';
import { categoryOptionSchema } from '@/validations/_core/category.validations';
import {
  generateFileSchema,
  generateTranslatedFieldsInputSchema,
  generateTranslatedFieldsOutputSchema,
  getTranslatedFieldsCodec,
} from '@/validations/_core/zodSchema.validations';

/**
 * What the article list reads off its own address. Beyond the tab and the category, it accepts the
 * id of an author: an article's page sends the editor here to see the rest of what that author
 * wrote. `user` rather than `author` — it is the name of the field the filter runs on.
 */
export const articlesRouteSearchParams = tabAndCategoryRouteSearchParams
  .extend({ user: z.string().optional() });

export type ArticlesRouteSearchParams = z.infer<typeof articlesRouteSearchParams>;

export const emptyContent = (value?: string): string => {
  if (!value || value === '<p><br></p>') {
    return '';
  }

  return value;
};

/*
 * the number input hands its value back as the typed string, so the bound has to be coerced before
 * it can be compared to a share count — and negative bounds are a typo, never an intent
 */
const sharesFilterSchema = z.coerce.number().int().min(0).optional();

export const articleFilterSchema = z.object({
  title: z.string().optional(),
  tags: z.string().optional(),
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  user: z.string().optional(),
  category: categoryOptionSchema.optional(),
  countries: z.array(z.string().optional()).optional(),
  active: z.array(z.boolean().optional()).optional(),
  minShares: sharesFilterSchema,
  maxShares: sharesFilterSchema,
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
    translatedSchema[locale + ':metaTitle'] = z.string().transform(cutMetaText(META_TITLE_MAX_LENGTH));
    translatedSchema[locale + ':metaDescription'] =
      z.string().transform(cutMetaText(META_DESCRIPTION_MAX_LENGTH));

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

type OptionalFileSchemaType = z.ZodType<File | undefined, File | undefined>;
type OptionalFileArraySchemaType = z.ZodType<File[] | undefined, File[] | undefined>;

export const cmsSchema = z.object({
  active: z.boolean().optional(),
  bannerImage: generateFileSchema() as OptionalFileSchemaType,
  previewImage: generateFileSchema() as OptionalFileSchemaType,
  images: generateFileSchema(false, { max: CMS_GALLERY_MAX_IMAGES }) as OptionalFileArraySchemaType,
});

const translatedArticleFormFieldsSchema = generateTranslatedFieldsInputSchema(articleTranslatedFieldsObj);

/*
 * optional per-article view goal. The number input hands back an empty string when the editor
 * clears it, which must read as "measure it against the ordinary goal" rather than as the number 0
 * — a 0 goal would make every percentage infinite.
 */
const viewsGoalSchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce
    .number()
    .int()
    .min(ARTICLE_VIEWS_GOAL_MIN)
    .max(ARTICLE_VIEWS_GOAL_MAX)
    .optional()
).optional();

export const articleSchema = cmsSchema
  .extend({
    // the country the article is written for
    country: z.string().optional(),
    ...translatedArticleFormFieldsSchema.shape,
    // plain category ids — picked from a preloaded Select, not the search Autocomplete
    categories: z.array(z.string()).min(1),
    image: generateFileSchema(true) as OptionalFileSchemaType,
    viewsGoal: viewsGoalSchema,
  });

/**
 * Schema used to validate an uploaded JSON file for article creation, once transformed to the
 * flattened form shape (see `getArticleJsonUploadInitialValues` in cms.utils.ts). Unlike
 * `articleSchema`, `categories` and `image` are left out entirely — pointers and binary uploads
 * aren't fillable by hand in a JSON template, they stay on the Select / dropzone UI.
 */
export const articleJsonUploadSchema = z.object(translatedArticleFormFieldsSchema.shape).extend(
  cmsSchema.pick({ active: true }).shape
);

/**
 * Database-shaped schema (matches IArticle — translated content nested per locale — unlike
 * `articleJsonUploadSchema` which is the flattened form schema with `fr:title`-style keys). Used
 * only to generate the downloadable JSON template, since the uploaded file must be in this shape
 * (it goes through `getArticleJsonUploadInitialValues` to become form values, not through
 * `articleJsonUploadSchema` directly). Image fields and `categories` are left out for the same
 * reason as above.
 */
export const articleDbTemplateSchema = z.object({
  translated: generateTranslatedFieldsOutputSchema(articleTranslatedFieldsObj),
  active: z.boolean().optional(),
});

/**
 * Decode and encode translated fields for article
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const articleCodec = getTranslatedFieldsCodec(articleTranslatedFieldsObj);
