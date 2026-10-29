/* eslint-disable @typescript-eslint/require-await */
import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import dayjs from 'dayjs';

import { CMS_COUNTER_FIELDS } from '@/constants/_core/cms.constants';
import { PROJECT_FILES_FIELDS, PROJECT_MULTIPLE_FILES_FIELDS, PROJECT_SINGLE_IMAGE_FIELDS } from '@/constants/_domain/project.constants';
import { type IUploadedFile } from '@/types/file.type';
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

import { deleteEditorFilesAfterUpdate, destroyOldFilesAfterUpdate, moveCMSImagesToRecycleBin } from '../../utils/_core/cms.utils.cloud';
import { destroyFilesAfterObjectDestroyed } from '../../utils/_core/file.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { getProjectTranslatedDefaultValues } from '../../utils/_domain/project.utils.cloud';

export const Project = Parse.Object.extend(DOMAIN_COLLECTIONS.project);

const PROJECT_FILE_OPTIONS = {
  singleFileFields: PROJECT_SINGLE_IMAGE_FIELDS,
  multipleFilesFields: PROJECT_MULTIPLE_FILES_FIELDS,
};

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  DOMAIN_COLLECTIONS.project,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const project = request.object;
    const prevProject = request.original;
    const user = request.user;
    const dirtyKeys = project.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;

    // a visitor sharing the project (no user): the total follows the shares
    if (project.existed() && dirtyKeys.includes('shares')) {
      project.increment('totalMediaShare', 1);
    }

    if (!user) return;

    // --------- creation and update --------- //
    const translated = project.get('translated');

    if (translated) {
      project.set('translated', getProjectTranslatedDefaultValues(translated));
    }

    // ----------- creation ----------- //
    if (!project.existed() || !prevProject) {
      project.set('user', user);
      project.set('deleted', false);
    }
  })
);

Parse.Cloud.afterSave(
  DOMAIN_COLLECTIONS.project,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const project = request.object;
    const prevProject = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    /*
     * a save that only bumps an audience counter (a visitor's share) changes nothing the website
     * renders, so it must not drop the projects cache
     */
    const isAudienceCounterSave = dirtyKeys.length > 0 &&
      dirtyKeys.every((key: string) => CMS_COUNTER_FIELDS.includes(key));

    if (!isAudienceCounterSave) {
      await revalidateWebCacheTag('projects');
    }

    if (!user) return;

    // ----------- creation ----------- //
    if (!project.existed() || !prevProject) return;

    // ----------- update ----------- //
    let hasChanged = false;

    // after delete
    if (dirtyKeys.includes('deleted') && project.get('deleted')) {
      project.set('deletedAt', dayjs().toDate());
      hasChanged = true;

      // remove the files to the recycle bin
      await moveCMSImagesToRecycleBin(project, PROJECT_FILE_OPTIONS);
    }

    // delete the files replaced by the update
    const [, publicIds] = await Promise.all([
      destroyOldFilesAfterUpdate(project, prevProject, PROJECT_FILE_OPTIONS),
      deleteEditorFilesAfterUpdate(project, prevProject),
    ]);

    // remove the deleted files from the database (editorFiles field)
    if (publicIds && publicIds.length > 0) {
      const newEditorFiles = (project.get('editorFiles') || [])
        .filter((file: IUploadedFile) => !publicIds.includes(file.publicId));

      project.set('editorFiles', newEditorFiles);
      hasChanged = true;
    }

    if (!hasChanged) return;
    await project.save();
  })
);

Parse.Cloud.afterDelete(
  DOMAIN_COLLECTIONS.project,
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const project = request.object;

    await revalidateWebCacheTag('projects');

    const result = await destroyFilesAfterObjectDestroyed(project, PROJECT_FILES_FIELDS);

    return !!result;
  })
);
