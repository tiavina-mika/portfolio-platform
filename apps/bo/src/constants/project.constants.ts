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

export const technologies = [
  'Adobe XD',
  'Ant Design',
  'Bitbucket',
  'Bootstrap',
  'Canvas',
  'CSS',
  'CPanel',
  'Digital Ocean',
  'Electron',
  'emotion',
  'express',
  'Figma',
  'Flask',
  'Elastic Search',
  'github',
  'gitlab',
  'Google Cloud Platform',
  'graphql',
  'HTML',
  'Illustrator',
  'javascript',
  'jest',
  'jira',
  'JQuery',
  'Material-UI',
  'mongodb',
  'MySQL',
  'Netlify',
  'npm',
  'nextjs',
  'nestjs',
  'nodejs',
  'onRender',
  'Parse Server',
  'Photoshop',
  'PHP',
  'PostgreSQL',
  'Python',
  'react',
  'react-native',
  'redux',
  'REST API',
  'Shadcn UI',
  'Stripe',
  'storybook',
  'Symfony',
  'Swell',
  'Tailwind CSS',
  'Tanstack Query',
  'trello',
  'turbo repo',
  'typescript',
  'vanilla-extract',
];

export const projectTranslatedFieldsObj: TranslatedFieldOption[] = [
  ...seoTranslatedFieldsObj,
  { name: 'name', required: true, max: 400 },
  { name: 'title', required: true, max: 400, transform: capitalize },
  { name: 'description', required: true, max: 300, transform: capitalize },
  { name: 'content', required: true },
  { name: 'societyDescription', required: false, max: 1000, transform: capitalize },
];
