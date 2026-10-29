import { PROJECT_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import { capitalize } from 'string-ts';

import { ALL_PAGE_FIELDS, seoTranslatedFieldsObj } from '@/constants/_core/cms.constants';
import { TranslatedFieldOption } from '@/types/_core/app.type';
import { CmsFormSectionEnum, ICmsFormSections } from '@/types/_core/cms.type';

export const PROJECT_COLLECTION = 'Project';

// where the website serves a project, between the locale and the slug: /<locale>/projects/<slug>
export const PROJECT_WEBSITE_BASE_PATH = '/projects/';

// the keys of `project:project.types`, the label of each kind of project
export const PROJECT_TYPES = [
  'socialNetwork', 'eCommerce', 'multimedia', 'ecology', 'artificialIntelligence', 'education',
  'greenEnergy', 'renewableEnergy', 'economicDevelopment', 'literature', 'sport', 'searchEngine',
  'philosophy', 'deepLearning', 'chatBot', 'travel', 'portfolio', 'blog', 'startup', 'foodTech',
  'supplyChain', 'cuisine', 'utility', 'productManagement', 'transport', 'openSource',
];

export const PROJECT_PLATFORMS = ['Web', 'Mobile', 'Desktop', 'API'];

// the labels a project link must carry in its address, field by field
export const PROJECT_REPOSITORY_HOSTS = ['github', 'gitlab', 'bitbucket'];
export const PROJECT_NPM_HOST = 'npm';
export const PROJECT_CODESANDBOX_HOST = 'codesandbox';
export const PROJECT_YOUTUBE_HOST = 'youtube';

// the starting address of each kind of link, so the editor only types the end of it
export const PROJECT_LINK_DEFAULTS = {
  link: 'https://',
  repository: 'https://github.com/',
  npm: 'https://www.npmjs.com/package/',
  codesandbox: 'https://codesandbox.io/',
};

export const PROJECT_FIELDS = [
  'name',
  'societyDescription',
  'active',
  'translated',
  'society',
  'website',
  'youtube',
  'links',
  'repositories',
  'npm',
  'codesandbox',
  'types',
  'platforms',
  'technologies',
];

export const PROJECT_PROPERTIES = new Set([
  ...ALL_PAGE_FIELDS,
  ...PROJECT_FIELDS,
  ...PROJECT_SINGLE_IMAGE_FIELDS,
  'images',
  'dateStart',
  'dateEnd',
]);

export const projectTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'name', required: true, max: 400 },
  { name: 'title', required: true, max: 400, transform: capitalize },
  { name: 'description', required: true, max: 300, transform: capitalize },
  { name: 'content', required: true },
  { name: 'societyDescription', required: false, max: 1000, transform: capitalize },
];

/*
 * the project form walks through the same five sections as every CMS form: its types, platforms and
 * technologies take the category slot (they classify the project the way categories classify an
 * article), and its links, dates and visibility fill the settings one
 */
export const PROJECT_FORM_SECTIONS: ICmsFormSections = {
  sections: [
    CmsFormSectionEnum.CONTENT,
    CmsFormSectionEnum.SEO,
    CmsFormSectionEnum.IMAGES,
    CmsFormSectionEnum.CATEGORY,
    CmsFormSectionEnum.SETTINGS,
  ],
  translatedFields: {
    [CmsFormSectionEnum.CONTENT]: ['name', 'title', 'description', 'content', 'societyDescription'],
    [CmsFormSectionEnum.SEO]: ['slug', 'tags', 'metaTitle', 'metaDescription'],
    [CmsFormSectionEnum.IMAGES]: [],
    [CmsFormSectionEnum.CATEGORY]: [],
    [CmsFormSectionEnum.SETTINGS]: [],
  },
  plainFields: {
    [CmsFormSectionEnum.CONTENT]: [],
    [CmsFormSectionEnum.SEO]: [],
    [CmsFormSectionEnum.IMAGES]: ['image', 'logo', 'previewImage', 'images'],
    [CmsFormSectionEnum.CATEGORY]: ['types', 'platforms', 'technologies'],
    [CmsFormSectionEnum.SETTINGS]: ['active', 'society', 'website', 'youtube', 'dateRange'],
  },
  uncountedFields: {
    [CmsFormSectionEnum.SETTINGS]: ['links', 'repositories', 'npm', 'codesandbox'],
  },
  labelKeys: {
    [CmsFormSectionEnum.CONTENT]: 'cms:content',
    [CmsFormSectionEnum.SEO]: 'cms:seo',
    [CmsFormSectionEnum.IMAGES]: 'common:images',
    [CmsFormSectionEnum.CATEGORY]: 'project:project.form.classification',
    [CmsFormSectionEnum.SETTINGS]: 'common:settings',
  },
  requiredFieldsHelperKey: 'project:project.form.sectionsOrderHelper',
};

// how many technologies a list row names before folding the rest into a count
export const PROJECT_TECHNOLOGIES_SHOWN = 3;
