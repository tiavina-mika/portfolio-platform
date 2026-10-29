import path from 'path';

import { v2 as cloudinary } from 'cloudinary';
import DatauriParser from 'datauri/parser.js';

import type { IImageHttpResponse } from '@/types/utils.type';

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
 * upload file to cloudinary
 * @param {*} file
 * @param {*} folder
 * @returns
 */
export const uploadFile = async (file: Record<string, any>, folder: string): Promise<IImageHttpResponse> => {
  const config = {
    unique_filename: true,
    folder,
    use_filename: true,
  };

  // format buffer to base64 string
  const file64 = formatBufferTo64(file);

  const savedFile = await cloudinary.uploader.upload(file64.content, config);

  return {
    url: savedFile.secure_url,
    publicId: savedFile.public_id,
  };
};

/**
 * upload the files from the api to cloudinary
 * @param {*} files
 * @param {string} folder
 * @returns
 */
export const destroyFileHooks = async (publicId: string): Promise<any> => {
  const fileResponse = await cloudinary.uploader.destroy(publicId);

  return fileResponse;
};

/**
 * delete file from db
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
