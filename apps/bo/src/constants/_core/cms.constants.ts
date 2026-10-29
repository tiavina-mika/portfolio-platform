import { PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import { capitalize } from 'string-ts';

import i18n from '@/config/i18n';
import { ISelectOption, TranslatedFieldOption } from '@/types/_core/app.type';
import { CategoryLevelEnum, ICategoryEntityOption } from '@/types/_core/category.type';
import { CmsFormSectionEnum, ICmsFormSections } from '@/types/_core/cms.type';

// Google generally truncates title display around ~60 characters
export const META_TITLE_MAX_LENGTH = 60;
export const META_DESCRIPTION_MAX_LENGTH = 160;

/**
 * views an article is expected to reach, used to turn its raw view count into a "% of goal" every
 * article can be read against — an editor only sets `viewsGoal` on an article whose ambition
 * differs from the ordinary one (a campaign piece, a niche topic).
 */
export const ARTICLE_DEFAULT_VIEWS_GOAL = 3000;
// an editor typing a goal below this is fixing a typo, not describing an ambition
export const ARTICLE_VIEWS_GOAL_MIN = 1;
export const ARTICLE_VIEWS_GOAL_MAX = 1000000;

// the gallery shown under a page or an article body — past this it stops being a gallery and becomes a slideshow
export const CMS_GALLERY_MAX_IMAGES = 5;

// where the website serves an article, between the locale and the slug: /<locale>/blog/<slug>
export const ARTICLE_WEBSITE_BASE_PATH = '/blog/';

/*
 * reading pace used to turn an article's body into the "x min read" shown next to its title. The
 * same figure the public website prints under the article, so an editor comparing the two never
 * sees two different durations for one text.
 */
export const AVERAGE_READING_WORDS_PER_MINUTE = 200;

// where a block's picture sits around its text — above and below first, then the two sides
export const imagePositionOptions: ISelectOption[] = [
  {
    label: i18n.t('cms:top'),
    value: 'top',
  },
  {
    label: i18n.t('cms:bottom'),
    value: 'bottom',
  },
  {
    label: i18n.t('cms:left'),
    value: 'left',
  },
  {
    label: i18n.t('cms:right'),
    value: 'right',
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

// a page section only translates its heading — its blocks carry their own locale
export const PAGE_SECTION_TRANSLATED_FIELDS = ['title', 'description'];

/*
 * the page form loads the whole category tree of an entity in one go and walks it in memory: a
 * content type holds a few dozen categories at most, and one query beats one per level picked
 */
export const CATEGORY_TREE_QUERY_LIMIT = 500;

/** The sections of a CMS form, in the order the summary rail lists them. */
const CMS_FORM_SECTIONS: CmsFormSectionEnum[] = [
  CmsFormSectionEnum.CONTENT,
  CmsFormSectionEnum.SEO,
  CmsFormSectionEnum.IMAGES,
  CmsFormSectionEnum.CATEGORY,
  CmsFormSectionEnum.SETTINGS,
];

export const PAGE_FORM_SECTIONS: ICmsFormSections = {
  sections: CMS_FORM_SECTIONS,
  translatedFields: {
    [CmsFormSectionEnum.CONTENT]: ['name', 'title', 'description', 'content'],
    [CmsFormSectionEnum.SEO]: ['slug', 'tags', 'metaTitle', 'metaDescription'],
    [CmsFormSectionEnum.IMAGES]: [],
    [CmsFormSectionEnum.CATEGORY]: [],
    [CmsFormSectionEnum.SETTINGS]: [],
  },
  /*
   * `active` is counted although it always carries a value: the toggle is one of the three things
   * the settings section asks about, and leaving it out of the total would make that section read
   * as full while an editor can still see an unanswered question on it
   */
  plainFields: {
    [CmsFormSectionEnum.CONTENT]: [],
    [CmsFormSectionEnum.SEO]: ['previewImage'],
    [CmsFormSectionEnum.IMAGES]: ['bannerImage', 'images'],
    /*
     * only the root category is counted: the lower levels exist only when the root one has
     * children, so counting them would make a page filed under a leaf category read as unfinished
     */
    [CmsFormSectionEnum.CATEGORY]: ['category'],
    [CmsFormSectionEnum.SETTINGS]: ['active', 'code', 'linkLocations'],
  },
  // the cascading choices write into `categories`, which is the field actually saved
  uncountedFields: {
    [CmsFormSectionEnum.CATEGORY]: ['subcategory', 'subcategory2', 'categories'],
  },
  labelKeys: {
    [CmsFormSectionEnum.CONTENT]: 'cms:content',
    [CmsFormSectionEnum.SEO]: 'cms:seo',
    [CmsFormSectionEnum.IMAGES]: 'common:images',
    [CmsFormSectionEnum.CATEGORY]: 'cms:category.category',
    [CmsFormSectionEnum.SETTINGS]: 'common:settings',
  },
  requiredFieldsHelperKey: 'cms:pageForm.sectionsOrderHelper',
};

export const ARTICLE_FORM_SECTIONS: ICmsFormSections = {
  sections: CMS_FORM_SECTIONS,
  translatedFields: {
    [CmsFormSectionEnum.CONTENT]: ['title', 'description', 'content'],
    [CmsFormSectionEnum.SEO]: ['slug', 'tags', 'metaTitle', 'metaDescription'],
    [CmsFormSectionEnum.IMAGES]: [],
    [CmsFormSectionEnum.CATEGORY]: [],
    [CmsFormSectionEnum.SETTINGS]: [],
  },
  // `active` is counted for the same reason as on the page form: the toggle is a question asked
  plainFields: {
    [CmsFormSectionEnum.CONTENT]: [],
    [CmsFormSectionEnum.SEO]: [],
    [CmsFormSectionEnum.IMAGES]: ['image', 'previewImage', 'images'],
    [CmsFormSectionEnum.CATEGORY]: ['categories'],
    [CmsFormSectionEnum.SETTINGS]: ['active', 'viewsGoal'],
  },
  uncountedFields: {},
  labelKeys: {
    [CmsFormSectionEnum.CONTENT]: 'cms:content',
    [CmsFormSectionEnum.SEO]: 'cms:seo',
    [CmsFormSectionEnum.IMAGES]: 'common:images',
    // an article can sit on several shelves at once, so its section is named in the plural
    [CmsFormSectionEnum.CATEGORY]: 'cms:category.categories',
    [CmsFormSectionEnum.SETTINGS]: 'common:settings',
  },
  requiredFieldsHelperKey: 'cms:articleForm.sectionsOrderHelper',
};

export const ALL_PAGE_FIELDS = [
  'active',
  'country',
  'code',
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

/*
 * where a category sits in the tree. The two values are what having a parent means, so they are
 * offered as a pair rather than as a depth number an editor would have to know the scale of.
 */
export const categoryLevelOptions: ISelectOption[] = [
  {
    label: i18n.t('cms:category.rootCategory'),
    value: CategoryLevelEnum.ROOT,
  },
  {
    label: i18n.t('cms:category.subcategory'),
    value: CategoryLevelEnum.SUBCATEGORY,
  },
];

// joins the levels of a category path, ex: "Safety › Before leaving"
export const CATEGORY_PATH_SEPARATOR = ' › ';

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
  { name: 'metaTitle', required: false, max: META_TITLE_MAX_LENGTH, transform: capitalize },
  { name: 'metaDescription', required: false, max: META_DESCRIPTION_MAX_LENGTH, transform: capitalize },
];

export const articleTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'title', required: true, max: 400, transform: capitalize },
  { name: 'description', required: true, max: 300, transform: capitalize },
  { name: 'content', required: true },
];

export const pageTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'title', required: false, transform: capitalize },
  { name: 'name', required: true, max: 150, transform: capitalize },
  { name: 'description', required: false, max: 300, transform: capitalize },
  { name: 'content', required: true },
];

export const eachSectionBlockTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'title', required: true, transform: capitalize },
  { name: 'description', required: false, transform: capitalize },
  { name: 'content', required: true, max: 1000 },
];

export const pageSectionTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'title', required: true, transform: capitalize },
  { name: 'description', required: false, max: 400, transform: capitalize },
];

export const categoryTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'name', required: true, max: 400, transform: capitalize },
];

// pointer fields to a Parse User — stripped from the single-item JSON download (see ActionsMenu's onDownloadJson)
export const CMS_JSON_DOWNLOAD_IGNORED_FIELDS = ['user', 'updatedBy', 'deletedBy'];

export const creationUploadedFieldsToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  '_created_at',
  '_updated_at',
  '_id',
  'objectId',
  'user',
  '_p_user',
  'updatedBy',
  'deletedBy',
  'createdBy',
  'deleted',
  'active',
  'published',
];

/*
 * how many sections a page's detail view lists. A page is a handful of stacked blocks, so this is
 * a safety cap rather than a page size — it keeps the query bounded should the data ever drift
 */
export const PAGE_SECTIONS_BY_PAGE_LIMIT = 100;

/*
 * how long the SEO preview waits after the last keystroke before asking the website for the share
 * card again: the card is a generated image, one request per typed letter would be wasted
 */
export const SHARE_CARD_PREVIEW_DELAY_MS = 600;
