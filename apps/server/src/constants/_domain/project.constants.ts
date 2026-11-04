import { PROJECT_SINGLE_IMAGE_FIELDS } from '@shared/validations';

import { PAGE_FILES_FIELDS } from '@/constants/_core/cms.constants';

export { PROJECT_SINGLE_IMAGE_FIELDS };

/** the file fields a project may hold several of, uploaded through the editor or the gallery */
export const PROJECT_MULTIPLE_FILES_FIELDS = PAGE_FILES_FIELDS;

/** every field holding an uploaded file: all of them are destroyed with the project */
export const PROJECT_FILES_FIELDS = [...PROJECT_SINGLE_IMAGE_FIELDS, ...PROJECT_MULTIPLE_FILES_FIELDS];

/** the translated text fields the back-office list can be narrowed on, one box per field */
export const PROJECT_SEARCH_TRANSLATED_FIELDS = [
  'title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content', 'societyDescription',
];

/**
 * the columns the back-office list needs: the heavy ones (the gallery and the editor files) are left
 * out, the form reads them from `getProject`
 */
export const PROJECT_LIST_FIELDS = [
  'translated', ...PROJECT_SINGLE_IMAGE_FIELDS, 'types', 'technologies', 'society', 'website', 'platforms',
  'active', 'deleted', 'deletedAt', 'user', 'totalMediaShare', 'shares', 'createdAt', 'updatedAt',
];

/** the columns the public project page renders (the translated text is narrowed to one locale) */
export const PROJECT_FOR_CLIENT_FIELDS = [
  ...PROJECT_SINGLE_IMAGE_FIELDS, 'images', 'updatedAt', 'technologies', 'types', 'links', 'repositories',
  'youtube', 'npm', 'website', 'society', 'codesandbox', 'platforms', 'totalMediaShare',
];

/** the columns a dashboard card or a search hit names a project by */
export const PROJECT_SUMMARY_FIELDS = ['translated', 'logo', 'updatedAt'];
