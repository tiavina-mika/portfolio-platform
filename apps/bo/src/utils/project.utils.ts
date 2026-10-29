import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { capitalize } from 'string-ts';

import i18n from '@/config/i18n';
import { projectFields, projectSingleImageFields, technologies } from '@/constants/project.constants';
import { ISelectOption } from '@/types/app.type';
import { IFileCloud } from '@/types/file.type';
import { IProject, IProjectInput } from '@/types/project.type';
import { projectCodec } from '@/validations/project.validation';

import { getFileFromUrl } from './file.utils';
import { getValues } from './parse.utils';

/**
 * all project types options for the form
 * it is from the i18n file
 */
export const projectTypesOptions: ISelectOption[] = Object.keys(cloneDeep(i18n.t('project.types', { returnObjects: true })))
  .map((key: string): ISelectOption => ({
    value: key,
    label: i18n.t(`project.types.${key}`),
  })
  );

export const sortedProjectTypesOptions = projectTypesOptions.sort((a, b) => a.label.localeCompare(b.label));

export const technologiesOptions = technologies.map((technology: string) => ({
  value: technology,
  label: capitalize(technology),
}));

export const sortedTechnologiesOptions = technologiesOptions.sort((a, b) => a.label.localeCompare(b.label));

export const projectPlatforms = [
  'Web', 'Mobile', 'Desktop', 'API',
];

/**
 * all project images fields for the form
 * @param parseObj
 * @returns
 */
const getProjectImagesInitialValues = async (parseObj: IProject) => {
  const [logo, previewImage, image] = await Promise.all(
    projectSingleImageFields.map(async (field: string) => {
      if (parseObj.has(field)) {
        const file = await getFileFromUrl(
          (parseObj.get(field) as IFileCloud).url
        );

        return file;
      }
      return null;
    })
  );

  const images = await Promise.all(
    parseObj.get('images')?.map((image: IFileCloud) => getFileFromUrl(image.url)) ?? []
  );

  return {
    logo,
    previewImage,
    image,
    images,
  };
};

/**
 * project edition initial values
 * @param project
 * @returns
 */
export const getProjectEditionInitialValues = async (
  project: IProject | null | undefined
): Promise<IProjectInput | undefined> => {
  if (!project) return;
  // translate fields
  const imagesFields = await getProjectImagesInitialValues(project);

  const defaultValues: Record<string, any> = {
    ...getValues(project, projectFields),
    ...imagesFields,
    ...projectCodec.encode(project.get('translated') as Record<string, any>),
    dateRange: [
      project.has('dateStart')
        ? dayjs(project.get('dateStart'))
        : null,
      project.has('dateEnd')
        ? dayjs(project.get('dateEnd'))
        : null,
    ],
  };

  return defaultValues;
};

/**
 * the form values use on field for date start and date end
 * but in the database, it should be saved with 2 fields (dateStart, dateEnd)
 * @param values
 */
export const setProjectDateRangeToDateStartAndEnd = (project: Parse.Object, dateRange: Date[]) => {
  if (dateRange && dateRange.length > 0) {
    const [dateStart, dateEnd] = dateRange;

    project.set('dateStart', dateStart);

    if (dateEnd) {
      project.set('dateEnd', dateEnd);
    }
  }
};
