import type { ProjectCardData } from '@/containers/project/ProjectCard';

import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getImageByBreakpoint } from '@/server/responsive.server';
import { IProject } from '@/types/project.type';

import { getTranslatedField } from './translation.utils';

/**
 * What a project card shows: name, short description and the preview picture sized for the device
 * (it reads the user agent, so it is only called from a request-time server component)
 * @param project
 * @param locale
 */
export const getProjectCardData = async (
  project: IProject,
  locale: Locale
): Promise<ProjectCardData> => {
  const { translated } = project;
  const file = project.previewImage ?? project.image;

  return {
    id: project.id,
    name: getTranslatedField(translated, locale, 'name'),
    description: getTranslatedField(translated, locale, 'description'),
    href: ROUTES.projects.preview(getTranslatedField(translated, locale, 'slug')),
    imageUrl: file ? await getImageByBreakpoint(file) : undefined,
    imageAlt: getTranslatedField(translated, locale, 'title'),
  };
};
