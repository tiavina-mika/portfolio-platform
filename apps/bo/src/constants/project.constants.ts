import { capitalize } from 'string-ts';

import { TranslatedFieldOption } from '@/types/app.type';

import { seoTranslatedFieldsObj } from './cms.constants';


export const projectFields = [
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

export const projectSingleImageFields = ['logo', 'previewImage', 'image'];

export const ALL_PROJECT_FIELDS = [
  'editorFiles',
  'images',
  'dateStart',
  'dateEnd',
  ...projectFields,
  ...projectSingleImageFields,
];

export { PROJECT_TECHNOLOGIES as technologies } from '@shared/domain-constants';

export const projectTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'name', required: true, max: 400 },
  { name: 'title', required: true, max: 400, transform: capitalize },
  { name: 'description', required: true, max: 300, transform: capitalize },
  { name: 'content', required: true },
  { name: 'societyDescription', required: false, max: 1000, transform: capitalize },
];
