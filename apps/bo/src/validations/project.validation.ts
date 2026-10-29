import { capitalize } from 'string-ts';
import { z } from 'zod';


import i18n, { locales } from '@/config/i18n';
import { projectTranslatedFieldsObj } from '@/constants/project.constants';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { cutMetaText } from '@/utils/utils';

import { dateForAdvancedSearchSchema } from './app.validations';
import { generateFileSchema, generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from './zodSchema.validation';

export const projectFilterSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  active: z.array(z.boolean().optional()).optional(),
  types: z.array(z.string()).optional(),
});

export const getProjectTranslatedSchema = () => {
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
    translatedSchema[locale + ':metaDescription'] = z.string()
      .transform(cutMetaText(170));

    // not required for pages
    translatedSchema[locale + ':description'] = z.string()
      .max(300, i18n.t('form.error.max', { field: i18n.t('common:description'), number: 300 }))
      .transform(capitalize);

    translatedSchema[locale + ':societyDescription'] = z.string()
      .max(1000, i18n.t('form.error.max', { field: i18n.t('common:project.societyDescription'), number: 1000 }))
      .transform(capitalize);

    /*
     * ------------------------------------ //
     * - required only for default locale - //
     * ------------------------------------ //
     * other locales are optional
     */
    if (locale !== DEFAULT_LOCALE) {
      translatedSchema[locale + ':name'] = z.string().optional();
      translatedSchema[locale + ':title'] = z.string().transform(capitalize);
      translatedSchema[locale + ':content'] = z.string().optional();
    }
    else {
      // required fields only for default locale
      [
        {
          key: 'name',
          label: i18n.t('common:name'),
        }, {
          key: 'title',
          label: i18n.t('common:title'),
        }, {
          key: 'content',
          label: i18n.t('common:content'),
        }, {
          key: 'description',
          label: i18n.t('common:description'),
        },
      ].forEach(({
        key, label,
      }) => {
        translatedSchema[locale + ':' + key] = z.string()
          .min(1, i18n.t('form.error.required', { field: label }))
          .transform(capitalize);
      });
    }
  });

  return translatedSchema;
};

const translatedProjectFormFieldsSchema = generateTranslatedFieldsInputSchema(projectTranslatedFieldsObj);

/**
 * Decode and encode translated fields for article
 * Decode: { 'fr:name': 'name-fr' } => { translated: { fr: { name: 'name-fr' } } }
 * Encode: { translated: { fr: { name: 'name-fr' } } } => { 'fr:name': 'name-fr' }
 */
export const projectCodec = getTranslatedFieldsCodec(projectTranslatedFieldsObj);

export const projectSchema = z.object({
  active: z.boolean().optional(),
  image: generateFileSchema(true),
  logo: generateFileSchema(),
  previewImage: generateFileSchema(),
  images: generateFileSchema(false, { max: 5 }),
  // optional fields array validation
  website: z.string()
    .url({ message: i18n.t('form.error.invalidUrl') })
    .optional()
    .or(z.literal('')),
  youtube: z.string()
    .optional()
    .refine(value => !value || value?.includes('youtube'), { message: i18n.t('project.invalidYoutubeUrl') }),
  society: z.string().optional(),
  links: z.array(
    z.object({
      url: z.string()
        .url({ message: i18n.t('form.error.invalidUrl') })
        .optional()
        .or(z.literal('')),
    })
  ).optional(),
  repositories: z.array(
    z.object({
      url: z.string()
        .optional()
        .refine(
          value => !value ||
            (value.includes('github') ||
              value.includes('gitlab') ||
              value.includes('bitbucket')),
          { message: i18n.t('project.invalidRepositoryUrl') }
        ),
    })
  ).optional(),

  npm: z.array(
    z.object({
      url: z.string()
        .optional()
        .refine(
          value => !value || value.includes('npm'),
          { message: i18n.t('project.invalidNpmUrl') }
        ),
    })
  ).optional(),
  codesandbox: z.array(
    z.object({
      url: z.string()
        .optional()
        .refine(
          value => !value || value.includes('codesandbox'),
          { message: i18n.t('project.invalidCodesandboxUrl') }
        ),
    })
  ).optional(),

  dateRange: dateForAdvancedSearchSchema,
  types: z.array(z.string()),
  platforms: z.array(z.string()).optional(),
  technologies: z.array(z.string()),
  ...translatedProjectFormFieldsSchema.shape, // translated fields
});
