import { PROJECT_TECHNOLOGIES } from '@shared/domain-constants';
import { PROJECT_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import dayjs from 'dayjs';
import { capitalize } from 'string-ts';

import type { StatusDotColor } from '@/components/StatusDot';

import i18n from '@/config/i18n';
import { PROJECT_FIELDS, PROJECT_TYPES } from '@/constants/_domain/project.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { IFileCloud } from '@/types/_core/file.type';
import { IProject, IProjectInput, ProjectStatusEnum } from '@/types/_domain/project.type';
import { getParseDateValue } from '@/utils/_core/date.utils';
import { getFileFromUrl } from '@/utils/_core/file.utils';
import { getValues } from '@/utils/_core/parse.utils';
import { projectCodec } from '@/validations/_domain/project.validations';

const sortByLabel = (options: ISelectOption[]): ISelectOption[] =>
  [...options].sort((a, b) => a.label.localeCompare(b.label));

/**
 * every kind of project, labelled in the current language and sorted for the form's select
 */
export const sortedProjectTypesOptions: ISelectOption[] = sortByLabel(
  PROJECT_TYPES.map((type: string): ISelectOption => ({
    value: type,
    label: i18n.t(`project:project.types.${type}`),
  }))
);

export const sortedTechnologiesOptions: ISelectOption[] = sortByLabel(
  PROJECT_TECHNOLOGIES.map((technology: string): ISelectOption => ({
    value: technology,
    label: capitalize(technology),
  }))
);

export const getProjectTypeLabel = (type: string): string => i18n.t(`project:project.types.${type}`);

/**
 * where a project stands, from the two flags it carries. A binned project is off the website
 * whatever its `active` flag still says, so the draft state covers it.
 */
export const getProjectStatus = (project: IProject): ProjectStatusEnum => (
  project.active && !project.deleted
    ? ProjectStatusEnum.PUBLISHED
    : ProjectStatusEnum.DRAFT
);

export const getProjectStatusColor = (status: ProjectStatusEnum): StatusDotColor => (
  status === ProjectStatusEnum.PUBLISHED
    ? 'success'
    : 'default'
);

export const getTranslatedProjectStatusLabel = (status: ProjectStatusEnum): string =>
  i18n.t(`project:project.status.${status}`);

/**
 * the files of a project, read back into the form's shape: one file per single-image field and the
 * gallery as a list
 */
const getProjectImagesInitialValues = async (project: IProject) => {
  const singleImages = await Promise.all(
    PROJECT_SINGLE_IMAGE_FIELDS.map(async (field: string) => {
      const file = project[field as keyof IProject] as IFileCloud | undefined;

      return [field, file ? await getFileFromUrl(file.url) : undefined] as const;
    })
  );
  const images = await Promise.all(
    (project.images ?? []).map((image: IFileCloud) => getFileFromUrl(image.url))
  );

  return { ...Object.fromEntries(singleImages), images };
};

/**
 * project edition initial values
 * @param project the project being edited
 */
export const getProjectEditionInitialValues = async (
  project: IProject | null | undefined
): Promise<IProjectInput | undefined> => {
  if (!project) return;

  const imagesFields = await getProjectImagesInitialValues(project);

  return {
    ...getValues(project, PROJECT_FIELDS),
    ...imagesFields,
    ...projectCodec.encode(project.translated as Record<string, any>),
    dateRange: [
      project.dateStart ? dayjs(getParseDateValue(project.dateStart)) : null,
      project.dateEnd ? dayjs(getParseDateValue(project.dateEnd)) : null,
    ],
  };
};

/**
 * the form holds one field for the date start and the date end, but the database stores them in two
 */
export const setProjectDateRangeToDateStartAndEnd = (
  project: Parse.Object,
  dateRange?: (Date | null)[]
): void => {
  if (!dateRange || dateRange.length === 0) return;

  const [dateStart, dateEnd] = dateRange;

  if (dateStart) project.set('dateStart', dateStart);
  if (dateEnd) project.set('dateEnd', dateEnd);
};
