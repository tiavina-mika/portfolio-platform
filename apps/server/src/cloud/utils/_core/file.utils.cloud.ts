import type { IUploadedFile } from '@/types/app.type';

import { destroyFileHooks, destroyFiles } from '@/api/_core/cloudinary.api';
import { PAGE_FILES_FIELDS } from '@/constants/_core/cms.constants';

/**
 * delete file from db and cloud disk
 * @param {*} parseObj
 * @param {*} field
 * @returns
 */
export const deleteFile = async (parseObj: Record<string, any>, field: string): Promise<void | undefined> => {
  if (!parseObj.has(field)) return;

  const file = parseObj.get(field);
  const deletedFile = await destroyFileHooks(file.publicId);

  if (deletedFile.result !== 'ok') {
    throw new Error(field + ' deletion failed.');
  }
};

/**
 * delete list files from db
 * @param {*} parseObj
 * @param {*} field
 * @returns
 */
export const deleteFiles = async (
  parseObj: Record<string, any>,
  field: string
): Promise<void | undefined> => {
  if (!parseObj.has(field)) return;

  for (const file of parseObj.get(field)) {
    const deletedFile = await destroyFileHooks(file.publicId);

    if (deletedFile.result !== 'ok') {
      throw new Error(field + ' deletion failed.');
    }
  }
};

export const deleteOldFile = async (
  oldParseObj: Record<string, any>,
  parseObj: Record<string, any>,
  field: string
): Promise<void | undefined> => {
  if (!oldParseObj.has(field)) return;

  const { publicId: oldPublicId } = oldParseObj.get(field);

  if (oldPublicId !== parseObj.get(field)?.publicId) {
    await destroyFileHooks(oldPublicId);

    const deletedFile = await destroyFileHooks(oldPublicId);

    if (deletedFile.result !== 'ok') {
      throw new Error('deletion failed.');
    }
  }
};

/**
 * delete old files after editing an array of files
 * @param {*} oldParseObj
 * @param {*} parseObj
 * @param {string} field
 * @returns
 */
export const deleteOldFiles = async (
  oldParseObj: Record<string, any>,
  parseObj: Record<string, any>,
  field: string
): Promise<void | undefined> => {
  if (!oldParseObj.has(field)) return;

  const newFileById = new Map();
  const newFiles = parseObj.has(field) ? parseObj.get(field) : [];

  for (const image of newFiles) {
    newFileById.set(image.publicId, image);
  }
  for (const oldFile of oldParseObj.get(field)) {
    if (newFileById.get(oldFile.publicId)?.publicId !== oldFile.publicId) {
      const deletedFile = await destroyFileHooks(oldFile.publicId);

      if (deletedFile.result !== 'ok') {
        throw new Error(field + ' deletion failed.');
      }
    }
  }
};


/**
 * definitely delete files after object is destroyed
 * mainly used in afterDelete trigger
 * @param parseObj parse object (ex: Article, etc)
 * @param fields list of fields to delete files from
 * @returns
 */
export const destroyFilesAfterObjectDestroyed = async (
  parseObj: Parse.Object,
  fields = PAGE_FILES_FIELDS
): Promise<undefined | string> => {
  const publicIdsToDelete = [];

  // ----------- multiple files fields deletion ----------- //
  for (const field of fields) {
    if (parseObj.has(field)) {
      if (Array.isArray(parseObj.get(field))) {
        publicIdsToDelete.push(...parseObj.get(field).map((file: IUploadedFile): string => file.publicId));
      }
      else {
        publicIdsToDelete.push(parseObj.get(field).publicId);
      }
    }
  }

  if (publicIdsToDelete.length === 0) return;
  // delete all files in a single request
  const result = await destroyFiles(publicIdsToDelete);

  return result;
};
