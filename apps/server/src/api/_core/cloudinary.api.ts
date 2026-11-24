import { TargetEnum } from '@shared/types';
import {
  v2 as cloudinary,
  type AdminAndResourceOptions,
  type DeliveryType,
  type ResourceType,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';
import dayjs from 'dayjs';
import groupBy from 'lodash/groupBy.js';

import type { IUploadedFile } from '@/types/file.type';

import {
  type CloudinaryCallOptions, type CloudinaryFileRef, getCloudinaryCallOptions, getFileCallOptions,
} from '@/utils/_core/cloudinary.utils';
import { formatBufferTo64 } from '@/utils/_core/file.utils';
import { isBoolean } from '@/utils/_core/utils';

/*
 * Every call goes to the account that holds the file (or, for an upload and a listing, the account of
 * the workspace asked for): the agency has an account of its own next to the portfolio's. The account
 * of a stored file is read from its address, so a file never has to say where it lives.
 */

/**
 * The SDK reads the credentials from the options of any call, but its typings list them on some calls only
 * (`destroy` and `rename` do not), so they are handed over as the options type the call expects.
 */
const toCallOptions = <T>(options: CloudinaryCallOptions): T => options as unknown as T;

type UploadFileArgs = {
  file: Record<string, any>;
  folder: string;
  config?: UploadApiOptions;
  /** whose account stores the file: the portfolio's when absent */
  workspace?: TargetEnum;
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
export const uploadFile = async ({
  file, folder, config, workspace,
}: UploadFileArgs): Promise<UploadApiResponse> => {
  const defaultConfig = {
    ...config,
    ...getCloudinaryCallOptions(workspace),
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
export const destroyFileHooks = async (file: CloudinaryFileRef): Promise<any> => {
  const fileResponse = await cloudinary.uploader.destroy(
    file.publicId,
    toCallOptions(getFileCallOptions(file))
  );

  return fileResponse;
};

export const destroyFile = async (file: CloudinaryFileRef): Promise<any> => {
  const fileResponse = await cloudinary.uploader.destroy(
    file.publicId,
    toCallOptions(getFileCallOptions(file))
  );

  if (fileResponse.result !== 'ok') {
    throw new Error('Error while deleting file ' + file.publicId);
  }

  return fileResponse;
};

/**
 * deletes files in one request per account: the files of a list can live in different accounts
 * @returns the response of the portfolio's account, or of the only account the files are in
 */
export const destroyFiles = async (files: CloudinaryFileRef[]): Promise<any> => {
  if (!Array.isArray(files)) {
    return;
  }

  const filesByWorkspace = groupBy(files, (file) => getFileCallOptions(file).cloud_name ?? '');
  const responses = await Promise.all(Object.values(filesByWorkspace).map((group) => (
    cloudinary.api.delete_resources(
      group.map((file) => file.publicId),
      getFileCallOptions(group[0])
    )
  )));

  return responses[0];
};

export const destroyFilesByFolder = async (
  folder: string,
  options?: AdminAndResourceOptions,
  workspace?: TargetEnum
): Promise<void> => {
  const fileResponse = await cloudinary.api.delete_resources_by_prefix(
    folder,
    { ...options, ...getCloudinaryCallOptions(workspace) }
  );

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
  options?: { maxResults?: number; nextCursor?: string; workspace?: TargetEnum }
): Promise<ListFilesByFolderResult> => {
  const response = await cloudinary.api.resources({
    type: 'upload',
    prefix: folder,
    max_results: options?.maxResults ?? 500,
    next_cursor: options?.nextCursor,
    ...getCloudinaryCallOptions(options?.workspace),
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
  file: CloudinaryFileRef
): Promise<UploadApiResponse> => {
  const response = await cloudinary.uploader.rename(
    file.publicId,
    newFolder + '/' + file.publicId,
    toCallOptions(getFileCallOptions(file))
  );

  return response;
};

export const moveFileToRecycleBin = async (file: CloudinaryFileRef): Promise<IUploadedFile> => {
  const result = await moveFile('recycleBin', file);

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
  file: CloudinaryFileRef,
  format: string,
  options: PrivateDownloadArgs = {
    attachment: true,
    // the link will expire in 1 minute
    expires_at: dayjs().add(1, 'minute').unix(),
    // the link will be available for public
    type: 'upload',
  }
): string => {
  const response = cloudinary.utils.private_download_url(
    file.publicId,
    format,
    { ...options, ...getFileCallOptions(file) }
  );

  return response;
};
