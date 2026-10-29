import differenceBy from 'lodash/differenceBy.js';

import type { IUploadedFile } from '@/types/file.type';

import { isFieldChanged, isSubFieldChanged } from '@/cloud/utils/parse.utils.cloud';
import { locales } from '@/config/i18next';
import FileService from '@/services/files.service';

import { logger } from './logger';


export const PAGE_SINGLE_IMAGE_FIELDS = ['bannerImage', 'previewImage', 'image'];
export const PAGE_FILES_FIELDS = ['images', 'editorFiles'];
export const PROJECT_FILES_FIELDS = ['previewImage', 'image', 'logo', ...PAGE_FILES_FIELDS];

type MoveToRecycleBinOptions = {
  singleFileFields: string[];
  multipleFilesFields: string[];
};
/**
 * move images to recycle bin after article or page is deleted
 * !important: the object should be saved after calling this function
 * @param parseObj
 */
export const moveCMSImagesToRecycleBin = async (
  parseObj: Parse.Object, options?: MoveToRecycleBinOptions): Promise<void> => {
  try {
    // remove file to recycle bin
    const fileService = new FileService();
    const singleFileFields = options?.singleFileFields || PAGE_SINGLE_IMAGE_FIELDS;
    const multipleFilesFields = options?.multipleFilesFields || PAGE_FILES_FIELDS;

    // ----------- singe file fields ----------- //
    await Promise.all(singleFileFields.map(async (field: string) => {
      if (parseObj.has(field)) {
        // remove the file from the cloud
        const file = await fileService.moveFileToRecycleBin(parseObj.get(field).publicId);

        // update the database object
        parseObj.set(field, file);
      }
    }));

    // ----------- multiple files fields ----------- //
    for (const field of multipleFilesFields) {
      if (parseObj.has(field)) {
        const files = parseObj.get(field) || [];

        // remove the file from the cloud
        const newFiles = await Promise.all(files.map(async (file: IUploadedFile) => {
          const uploadedFile = await fileService.moveFileToRecycleBin(file.publicId);

          return uploadedFile;
        }));


        // update the database object
        parseObj.set(field, newFiles);
      }
    }

    logger.info({
      messages: 'Fields moved to recycle bin',
      id: parseObj.id,
    });
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:movePageImagesToRecycleBin] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};

/**
 * if the field is changed
 * delete the old files since we don't need them anymore
 * @param parseObj
 * @param prevParseObj
 */
type DeleteOldFilesAfterUpdateOptions = {
  singleFileFields: string[];
  multipleFilesFields: string[];
};
export const destroyOldFilesAfterUpdate = async (
  parseObj: Parse.Object,
  prevParseObj: Parse.Object | undefined,
  options?: DeleteOldFilesAfterUpdateOptions
): Promise<void> => {
  try {
    const file = new FileService();

    const singleFileFields = options?.singleFileFields || PAGE_SINGLE_IMAGE_FIELDS;
    const multipleFilesFields = options?.multipleFilesFields || PAGE_FILES_FIELDS;
    const publicIdsToDelete = [];

    // ----------- singe file fields deletion ----------- //
    for (const field of singleFileFields) {
      // check first if the field is changed
      if (isFieldChanged(parseObj, prevParseObj, field)) {
        const prevField = prevParseObj?.get(field);
        const newField = parseObj.get(field);

        // delete old files if there is new one
        if (prevField?.publicId !== newField?.publicId) {
          publicIdsToDelete.push(prevField.publicId);
        }
      }
    }

    // ----------- multiple files fields deletion ----------- //
    for (const field of multipleFilesFields) {
      // check first if the field is changed
      if (isFieldChanged(parseObj, prevParseObj, field)) {
        const prevField: IUploadedFile[] = prevParseObj?.get(field) || [];
        const newField: IUploadedFile[] = parseObj.get(field) || [];

        const oldFilesToDelete: IUploadedFile[] = differenceBy(prevField, newField, 'publicId');

        const publicIds = oldFilesToDelete.map((file: IUploadedFile): string => file.publicId);

        publicIdsToDelete.push(...publicIds);
      }
    }

    if (publicIdsToDelete.length === 0) return;
    // delete all files in a single request
    await file.destroyFiles(publicIdsToDelete);
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:deleteOldFilesAfterUpdate] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};

/**
 * In the client side, there are no ways to know if the editor files are changed or not used anymore
 * so we need to check if the content is changed and delete the old files
 * by using the files in the editorFiles field
 * @param parseObj
 * @param prevParseObj
 * @param field
 * @returns
 */
export const deleteEditorFilesAfterUpdate = async (
  parseObj: Parse.Object,
  prevParseObj: Parse.Object | undefined,
  subfield = 'content',
  field = 'translated'
): Promise<string[] | void | undefined> => {
  try {
    // check if level 1 field is changed (ex: translated)
    if (!isFieldChanged(parseObj, prevParseObj, field)) return;
    const publicIdsToDelete = [];

    for (const locale of locales) {
      // check if level 2 field is changed (ex: translated.fr)
      const isLevel1Changed = isSubFieldChanged({
        newObject: parseObj,
        oldObject: prevParseObj,
        field,
        level2Field: locale,
      });

      if (isLevel1Changed) {
        const content = parseObj.get(field)[locale][subfield];
        const prevEditorFiles = prevParseObj?.get('editorFiles') || [];
        const prevTranslatedFiles = prevEditorFiles.filter((file: IUploadedFile) => file.locale === locale);
        // const prevContent = prevParseObj.get(field)[locale][subfield];

        const isLevel2Changed = isSubFieldChanged({
          newObject: parseObj,
          oldObject: prevParseObj,
          field,
          level2Field: locale,
          level3Field: subfield,
        });

        // check if level 3 field is changed (ex: translated.fr.content)
        if (isLevel2Changed) {
          for (const prevFile of prevTranslatedFiles) {
            // if the old file is not used anymore
            if (!content.includes(prevFile.url)) {
              publicIdsToDelete.push(prevFile.publicId);
            }
          }
        }
      }
    }

    logger.info('Ids to delete ', publicIdsToDelete.join(', '));
    if (publicIdsToDelete.length === 0) return;

    const file = new FileService();

    await file.destroyFiles(publicIdsToDelete);
    return publicIdsToDelete;
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:deleteEditorFilesAfterUpdate] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};
