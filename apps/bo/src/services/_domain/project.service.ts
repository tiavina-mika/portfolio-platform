import { PROJECT_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import Parse from 'parse';

import { locales } from '@/config/i18n';
import { PROJECT_COLLECTION, PROJECT_PROPERTIES } from '@/constants/_domain/project.constants';
import { Locale } from '@/types/_core/setting.type';
import { IProject, IProjectInput } from '@/types/_domain/project.type';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/_core/file.utils';
import { setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { setProjectDateRangeToDateStartAndEnd } from '@/utils/_domain/project.utils';
import { projectCodec } from '@/validations/_domain/project.validations';

const PROJECT_GALLERY_FIELDS = ['images'];

const toParseProject = (project: IProject): Parse.Object =>
  Parse.Object.fromJSON({ ...project, className: PROJECT_COLLECTION });

export const fetchProject = async (id: string, include: string[] = []): Promise<IProject | undefined> => {
  const project = await Parse.Cloud.run('getProject', { id, include });

  return project?.toJSON ? toJSONWithId<IProject>(project) : project || undefined;
};

export const fetchProjects = async ({
  limit, skip, orderBy, order, filters, search, include = [],
}: {
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
  include?: string[];
}): Promise<{ results: IProject[]; count: number }> => {
  // result with count, made server side because the list also carries the author of each project
  const result: Record<string, any> = await Parse.Cloud.run('getProjects', {
    limit, skip, orderBy, order, filters, search, locales, include,
  });

  return {
    results: result.results.map((project: Parse.Object) => toJSONWithId<IProject>(project)),
    count: result.count,
  };
};

export const saveProject = async ({
  id, existingProject, values, sessionToken, locale, editorTempFiles,
}: {
  id: string | null | undefined;
  existingProject?: IProject;
  values: IProjectInput;
  sessionToken: string;
  locale: Locale;
  editorTempFiles: number;
}): Promise<IProject> => {
  const isUpdate = !!id && !!existingProject;
  const parseProject: Parse.Object = isUpdate
    ? toParseProject(existingProject)
    : new Parse.Object(PROJECT_COLLECTION);

  const uploadOptions = {
    folder: 'projects',
    sessionToken,
    values,
    singleUploadFields: PROJECT_SINGLE_IMAGE_FIELDS,
    multipleUploadFields: PROJECT_GALLERY_FIELDS,
    locale,
  };
  const uploadValues = isUpdate
    ? await uploadUpdatedFormFiles<IProjectInput>({ parseObj: parseProject, ...uploadOptions })
    : await uploadFormFiles<IProjectInput>(uploadOptions);

  const newValues: Record<string, any> = {
    ...values,
    ...uploadValues,
    editorFiles: editorTempFiles,
    translated: projectCodec.decode(values),
  };

  setProjectDateRangeToDateStartAndEnd(parseProject, values.dateRange as (Date | null)[] | undefined);
  setValues(parseProject, newValues, PROJECT_PROPERTIES);

  const savedProject = await parseProject.save();

  return toJSONWithId<IProject>(savedProject);
};

/**
 * Publishes or unpublishes one project. `active` is what decides whether the public website shows
 * it at all.
 */
export const setProjectActive = async (project: IProject, value: boolean): Promise<IProject> => {
  const parseProject = toParseProject(project);

  parseProject.set('active', value);

  const savedProject = await parseProject.save();

  return toJSONWithId<IProject>(savedProject);
};

export const toggleProjectsFieldByIds = async (
  ids: string[],
  field: string,
  value: boolean
): Promise<void> => {
  await new Parse.Query(PROJECT_COLLECTION)
    .containedIn('objectId', ids)
    .each(async (project) => {
      project.set(field, value);
      await project.save();
    });
};
