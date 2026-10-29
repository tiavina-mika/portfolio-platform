/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/file.type';

import {
  deleteEditorFilesAfterUpdate, destroyOldFilesAfterUpdate, moveCMSImagesToRecycleBin, PROJECT_FILES_FIELDS,
} from '@/utils/cms.utils';
import { LOCALES } from '@/utils/constants';
import { destroyFilesAfterObjectDestroyed } from '@/utils/file.utils';
import { cutMetaTitle, slugify } from '@/utils/util';

import { isFieldChanged } from '../utils/parse.utils.cloud';
import { parseFunction } from '../utils/utils.cloud';


export const Project = Parse.Object.extend('Project');

const singleImageFields = ['image', 'logo', 'previewImage'];
const multipleImagesFields = ['editorFiles', 'images'];

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Project',
  parseFunction<Parse.Cloud.BeforeSaveRequest>(async (request): Promise<void> => {
    const project = request.object;
    const prevProject = request.original;
    const user = request.user;
    const dirtyKeys = project.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;
    // without user //
    if (isFieldChanged(project, prevProject, 'shares')) {
      project.increment('totalMediaShare', 1);
    }

    if (!user) return;
    /*
     * --------- creation and update --------- //
     * translated slug generation
     */
    const translated = project.get('translated');

    // create slug for translated title fields
    for (const local of LOCALES) {
      if (translated[local]) {
        // locale field, ex: fr, en, ...
        const translatedLocaleValues = translated[local];
        /*
         * fields inside the locale field
         * ---------- slug ---------- //
         * slug defined manually (via form) or automatically (by name field)
         */
        const slug = translatedLocaleValues.slug || translatedLocaleValues.title;
        const translatedSlug = slugify(slug);

        if (!translatedLocaleValues.metaTitle && translatedLocaleValues.title) {
          translatedLocaleValues.metaTitle = cutMetaTitle(translatedLocaleValues.title);
        }


        if (!translatedLocaleValues.metaDescription) {
          const metaDescription = translatedLocaleValues.description || translatedLocaleValues.title || '';

          if (metaDescription) {
            translatedLocaleValues.metaDescription = metaDescription;
          }
        }

        translated[local] = { ...translatedLocaleValues, slug: translatedSlug || '' };
      }
    }
    project.set('translated', translated);

    // ----------- creation ----------- //
    if (!project.existed() || !prevProject) {
      project.set('user', user);
      project.set('deleted', false);
    }
  })
);

Parse.Cloud.afterSave(
  'Project',
  parseFunction<Parse.Cloud.AfterSaveRequest>(async (request): Promise<void> => {
    const project = request.object;
    const prevProject = request.original;
    const user = request.user;

    if (!user) return;

    // ----------- update ----------- //
    let hasChanged = false;

    // after delete
    if (isFieldChanged(project, prevProject, 'deleted')) {
      project.set('deletedAt', dayjs().toDate());

      // remove files to recycle bin
      await moveCMSImagesToRecycleBin(project, {
        singleFileFields: singleImageFields,
        multipleFilesFields: multipleImagesFields,
      });
      hasChanged = true;
    }

    // delete files after update
    const [, publicIds] = await Promise.all([
      destroyOldFilesAfterUpdate(
        project,
        prevProject,
        { singleFileFields: singleImageFields, multipleFilesFields: multipleImagesFields }
      ),
      deleteEditorFilesAfterUpdate(project, prevProject),
    ]);

    // remove files from the database (editorFiles field)
    if (publicIds && publicIds.length > 0) {
      const newEditorFiles = (project.get('editorFiles') || []).filter((file: IUploadedFile) => !publicIds.includes(file.publicId));

      project.set('editorFiles', newEditorFiles);
      hasChanged = true;
    }

    if (!hasChanged) return;
    await project.save();
  })
);

Parse.Cloud.afterDelete(
  'Project',
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const project = request.object;

    const result = await destroyFilesAfterObjectDestroyed(project, PROJECT_FILES_FIELDS);

    return !!result;
  })
);
