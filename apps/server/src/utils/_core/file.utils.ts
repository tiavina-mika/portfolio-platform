/* eslint-disable @cspell/spellchecker */
import path from 'path';

import DatauriParser from 'datauri/parser.js';

const parser = new DatauriParser();

/**
 * format buffer to base64
 * @param {*} file
 * @returns
 */
export const formatBufferTo64 = (file: Record<string, any>): Record<string, any> => {
  const file64 = parser.format(path.extname(file.originalname).toString(), file.buffer);

  return file64;
};

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


export const isMimeType = (type: string): boolean => {
  if (!type || typeof type !== 'string') {
    return false;
  }
  const array = type.split('/');

  return array.length === 2 && array[0] !== '' && array[1] !== '';
};

/**
 * Get file extension from mime type
 * e.g: image/jpg => jpg, text/plain => txt
 * @param mimeType e.g: image/jpg, text/plain
 * @returns
 */
export const convertMimeTypeToFileExtension = (mimeType: string): string => {
  if (!isMimeType(mimeType)) {
    return '';
  }
  const array = mimeType.split('/');
  const extension = array[1];

  if (!extension) {
    return '';
  }

  switch (extension) {
    case 'jpeg':
    case 'jpg':
      return 'jpg';
    case 'plain':
      return 'txt';
    case 'vnd.ms-powerpoint':
    case 'vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'pptx';
    case 'vnd.ms-excel':
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    case 'vnd.ms-word':
    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'vnd.rar':
      return 'rar';
    case 'x-7z-compressed':
      return '7z';
    case 'x-msvideo':
      return 'avi';
    case '3gpp':
      return '3gp';
    case 'svg+xml':
      return 'svg';
    case 'javascript':
      return 'js';
    case 'markdown':
      return 'md';
    case 'x-yaml':
      return 'yaml';
    default:
      return extension;
  }
};
