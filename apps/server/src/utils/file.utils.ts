import type { IUploadedFile } from '@/types/file.type';

import FileService from '@/services/files.service';

import { PAGE_FILES_FIELDS } from './cms.utils';

/**
 * convert bytes to file sizes
 */
export const convertBytesToFileSize = (
  bytes: number,
  unit: 'mb' | 'kb' | 'gb' = 'mb',
  withUnit = false
): number | string => {
  let size = 1;

  switch (unit) {
    case 'kb':
      size = 1;
      break;
    case 'mb':
      size = 2;
      break;
    case 'gb':
      size = 3;
      break;
    default:
      size = 2;
  }

  const transformedSize = bytes / (1024 ** size);
  const fixedSize = +transformedSize.toFixed(3);

  if (withUnit) {
    return fixedSize + unit;
  }
  return fixedSize;
};

export const extensionsToMimeType = (extensions: string[]): Record<string, any> => {
  const mimeTypes: Record<string, any> = {};

  extensions.forEach((extension) => {
    mimeTypes['image/' + extension] = [];
  });

  return mimeTypes;
};

/**
 * convert kb, mb, gb to bytes
 */
export const convertFileSizeToBytes = (size: number, type = 'mb'): number => {
  const types = ['B', 'KB', 'MB', 'GB', 'TB'];

  const key = types.indexOf(type.toUpperCase());

  if (typeof key !== 'boolean') {
    return size * (1024 ** key);
  }

  return 0;
};

/**
 * check for file's max size limit to upload
 */
export const hasFilesMaxSize = (files: File[], maxSize: number): boolean => {
  const sizes = files.map((file: File): number => file.size);
  const hasMaxSize = sizes.some((size: number) => {
    const byte = convertFileSizeToBytes(maxSize);

    if (byte === 0) return false;
    return size > convertFileSizeToBytes(maxSize);
  });

  return hasMaxSize;
};

/**
 * check for accepted file's type to upload
 */
export const hasAcceptedFileTypes = (files: File[], acceptedTypes: string[]): boolean => {
  const types = files.map((file: File): string => (file as any).mimetype);
  const hasAcceptedFileTypes = types.some(
    (type: string) => !!acceptedTypes.find((acceptedType: string): boolean => type.includes(acceptedType))
  );

  return hasAcceptedFileTypes;
};

/**
 * definitely delete files after object is destroyed
 * mainly used in afterDelete trigger
 * @param parseObj parse object (ex: Article, Project, etc)
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
  const file = new FileService();
  // delete all files in a single request
  const result = await file.destroyFiles(publicIdsToDelete);

  return result as string;
};

/**
 * rename folder
 * if userId is provided, the folder will be created in the user's folder (id)
 * @param folder
 * @param userId
 * @returns
 */
export const getFolderName = (folder: string, userId: string | undefined): string => {
  const folderName = userId ? `users/${userId}/${folder}` : folder;

  return folderName;
};

/**
 * the API body pass stringified object (using JSON.stringify) from the client
 * so we need to convert it to an object
 * and send it to the cloudinary API
 * @param stringifiedBody
 * @returns
 */
export const convertUploadStringifiedBodyToObject = <O extends Record<string, any>>(
  stringifiedBody: string
): O => {
  if (!stringifiedBody) return {} as O;
  return JSON.parse(stringifiedBody);
};
