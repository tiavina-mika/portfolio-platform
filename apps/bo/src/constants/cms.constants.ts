import { capitalize } from 'string-ts';

import i18n from '@/config/i18n';
import { ISelectOption, TranslatedFieldOption } from '@/types/app.type';
import { ICategoryEntityOption } from '@/types/category.type';
import { PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

export const imagePositionOptions: ISelectOption[] = [
  {
    label: i18n.t('cms:bottom'),
    value: 'bottom',
  },
  {
    label: i18n.t('cms:right'),
    value: 'right',
  },
  {
    label: i18n.t('cms:left'),
    value: 'left',
  },
];

export const pageLinkLocationOptions: ISelectOption[] = [
  {
    label: i18n.t('cms:inTheMenu'),
    value: 'menu',
  },
  {
    label: i18n.t('cms:inTheFooter'),
    value: 'footer',
  },
];

/**
 * in the database, these translated fields is transformed to have this schema
 * { "fr": { "title": "xxx_fr", "description": "yyyy_fr" },  "en": { "title": "xxx_en",
 * "description": "yyyy_en" }, ... }
 */
const TRANSLATED_SEO_FIELDS = [
  'slug',
  'metaTitle',
  'metaDescription',
  'tags',
];

export const TRANSLATED_CMS_FIELDS = [
  ...TRANSLATED_SEO_FIELDS,
  'name',
  'title',
  'description',
  'content',
];

export const ALL_PAGE_FIELDS = [
  'active',
  'category',
  'editorFiles',
  ...PAGE_SINGLE_IMAGE_FIELDS,
  ...PAGE_IMAGES_FIELDS,
];

export const activeOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('cms:published'),
    value: true,
  },
  {
    label: i18n.t('cms:notPublished'),
    value: false,
  },
];

export const categoryEntityOptions: ICategoryEntityOption[] = [
  {
    label: i18n.t('cms:article'),
    value: 'article',
  },
  {
    label: i18n.t('cms:page'),
    value: 'page',
  },
];

export const seoTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'slug', required: false, max: 100 },
  { name: 'tags', required: false, max: 200 },
  { name: 'metaTitle', required: false, max: 70 },
  { name: 'metaDescription', required: false, max: 170 },
];

export const articleTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'title', required: true, max: 400, transform: capitalize },
  { name: 'description', required: true, max: 2000, transform: capitalize },
  { name: 'content', required: true },
];

export const pageTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'title', required: false, transform: capitalize },
  { name: 'name', required: true, max: 150, transform: capitalize },
  { name: 'description', required: false, max: 2000, transform: capitalize },
  { name: 'content', required: true },
];

export const eachSectionBlockTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'title', required: true, transform: capitalize },
  { name: 'description', required: false, transform: capitalize },
  { name: 'content', required: true, max: 3000 },
];

export const pageSectionTranslatedFieldsObjOld: TranslatedFieldOption[] = [
  { name: 'blocksTitle', required: true, transform: capitalize },
  { name: 'blocksDescription', required: false, max: 2000, transform: capitalize },
];

export const pageSectionTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'title', required: true, transform: capitalize },
  { name: 'description', required: false, max: 2000, transform: capitalize },
];

export const categoryTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'slug', required: false, max: 100 },
  { name: 'tags', required: false, max: 200 },
  { name: 'name', required: true, max: 400, transform: capitalize },
];
