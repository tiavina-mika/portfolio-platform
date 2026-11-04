import {
  v2 as cloudinary,
  type AdminAndResourceOptions,
  type DeliveryType,
  type ResourceType,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/file.type';

import { formatBufferTo64 } from '@/utils/_core/file.utils';
import { isBoolean } from '@/utils/_core/utils';

type UploadFileArgs = {
  file: Record<string, any>;
  folder: string;
  config?: UploadApiOptions;
};

export const getFile = async (publicId: string): Promise<IUploadedFile> => {
  const response = await cloudinary.api.resource(publicId);

  return {
    publicId: response.public_id,
    url: response.secure_url,
  };
};

/**
 * upload file to cloudinary
 * @param {*} file
 * @param {*} folder
 * @returns
 */
export const uploadFile = async ({ file, folder, config }: UploadFileArgs): Promise<UploadApiResponse> => {
  const defaultConfig = {
    ...config,
    folder,
    unique_filename: config && isBoolean(config.unique_filename) ? config.unique_filename : true,
    use_filename: config && isBoolean(config.use_filename) ? config.use_filename : true,
  };

  // format buffer to base64 string
  const file64 = formatBufferTo64(file);

  const response = await cloudinary.uploader.upload(
    file64.content,
    defaultConfig
  );

  return response;
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

export const destroyFile = async (publicId: string): Promise<any> => {
  const fileResponse = await cloudinary.uploader.destroy(publicId);

  if (fileResponse.result !== 'ok') {
    throw new Error('Error while deleting file ' + publicId);
  }

  return fileResponse;
};

export const destroyFiles = async (publicIds: string[]): Promise<any> => {
  if (!Array.isArray(publicIds)) {
    return;
  }

  const fileResponse = await cloudinary.api.delete_resources(publicIds);

  return fileResponse;
};

export const destroyFilesByFolder = async (
  folder: string,
  options?: AdminAndResourceOptions
): Promise<void> => {
  const fileResponse = await cloudinary.api.delete_resources_by_prefix(folder, options);

  if (fileResponse.result !== 'ok') {
    throw new Error('Error while deleting files in folder ' + folder);
  }

  return fileResponse;
};

export type ICloudinaryFile = IUploadedFile & { createdAt: string };

type ListFilesByFolderResult = {
  files: ICloudinaryFile[];
  nextCursor?: string;
};

/**
 * list uploaded files under a folder (prefix), paginated via `next_cursor`
 * used by purge jobs to find candidate files that are no longer referenced anywhere
 * @param folder
 * @param options
 * @returns
 */
export const listFilesByFolder = async (
  folder: string,
  options?: { maxResults?: number; nextCursor?: string }
): Promise<ListFilesByFolderResult> => {
  const response = await cloudinary.api.resources({
    type: 'upload',
    prefix: folder,
    max_results: options?.maxResults ?? 500,
    next_cursor: options?.nextCursor,
  });

  return {
    files: response.resources.map((resource: Record<string, any>): ICloudinaryFile => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      createdAt: resource.created_at,
    })),
    nextCursor: response.next_cursor,
  };
};

const moveFile = async (
  newFolder: string,
  publicId: string
): Promise<UploadApiResponse> => {
  const response = await cloudinary.uploader.rename(
    publicId,
    newFolder + '/' + publicId
  );

  return response;
};

export const moveFileToRecycleBin = async (publicId: string): Promise<IUploadedFile> => {
  const result = await moveFile('recycleBin', publicId);

  return {
    publicId: result.public_id,
    url: result.secure_url,
  };
};

/**
 * generate a temporary download link
 * @param publicId
 * @param format
 * @param options
 * @returns
 */
type PrivateDownloadArgs = Partial<{
  resource_type: ResourceType;
  type: DeliveryType;
  expires_at: number;
  attachment: boolean;
}>;

export const generatePrivateDownloadUrl = (
  publicId: string,
  format: string,
  options: PrivateDownloadArgs = {
    attachment: true,
    // the link will expire in 1 minute
    expires_at: dayjs().add(1, 'minute').unix(),
    // the link will be available for public
    type: 'upload',
  }
): string => {
  const response = cloudinary.utils.private_download_url(publicId, format, options);

  return response;
};
