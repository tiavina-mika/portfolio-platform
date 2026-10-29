import path from 'path';

import { v2 as cloudinary } from 'cloudinary';
import DatauriParser from 'datauri/parser.js';
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/app.type';
import type {
  AdminAndResourceOptions, DeliveryType, ResourceType, UploadApiOptions, UploadApiResponse,
} from 'cloudinary';

import { logger } from '@/utils/logger';
import { isBoolean } from '@/utils/util';

type UploadFileArgs = {
  file: Record<string, any>;
  folder: string;
  config?: UploadApiOptions;
};

type PrivateDownloadArgs = Partial<{
  resource_type: ResourceType;
  type: DeliveryType;
  expires_at: number;
  attachment: boolean;
}>;

class FileService {
  private formatBufferTo64 = (file: any) => {
    const parser = new DatauriParser();

    return parser.format(
      path.extname(file.originalname).toString(),
      file.buffer
    );
  };

  public uploadFile = async ({ file, folder, config }: UploadFileArgs): Promise<UploadApiResponse> => {
    const defaultConfig = {
      ...config,
      folder,
      unique_filename: config && isBoolean(config.unique_filename) ? config.unique_filename : true,
      use_filename: config && isBoolean(config.use_filename) ? config.use_filename : true,
    };

    // format buffer to base64 string
    const file64 = this.formatBufferTo64(file);

    const response = await cloudinary.uploader.upload(
      file64.content as any,
      defaultConfig
    );

    return response;
  };

  /**
   * generate a temporary download link
   * @param publicId
   * @param format
   * @param options
   * @returns
   */
  public generatePrivateDownloadUrl = async (
    publicId: string,
    format: string,
    options: PrivateDownloadArgs = {
      attachment: true,
      // the link will expire in 1 minute
      expires_at: dayjs().add(1, 'minute').unix(),
      // the link will be available for public
      type: 'upload',
    }
  ): Promise<string> => {
    const response = await cloudinary.utils.private_download_url(publicId, format, options);

    return response;
  };


  public moveFile = async (
    newFolder: string,
    publicId: string
  ): Promise<UploadApiResponse> => {
    const response = await cloudinary.uploader.rename(
      publicId,
      newFolder + '/' + publicId
    );

    return response;
  };

  /**
   * @see https://cloudinary.com/documentation/admin_api#get_details_of_a_single_resource_by_public_id
   * @param publicId
   * @returns
   */
  public getFile = async (publicId: string): Promise<IUploadedFile> => {
    const response = await cloudinary.api.resource(publicId);

    return {
      publicId: response.public_id,
      url: response.secure_url,
    };
  };

  /**
   * move file to recycle bin
   * the original folder path is preserved
   * @example /app/cover.jpg => /recycleBin/app/cover.jpg
   * @param publicId
   * @returns
   */
  public moveFileToRecycleBin = async (publicId: string): Promise<IUploadedFile> => {
    const result = await this.moveFile('recycleBin', publicId);

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  };

  public destroyFile = async (publicId: string): Promise<any> => {
    try {
      const fileResponse = await cloudinary.uploader.destroy(publicId);

      if (fileResponse.result !== 'ok') {
        throw new Error('Error while deleting file ' + publicId);
      }

      return fileResponse;
    }
    catch (error) {
      logger.error(`[src/services/files.service.ts:destroyFile] error: ${(error as Error).message}`);
    }
  };

  /**
   * delete list files from cloud
   * @param {*} publicIds
   * @returns
   */
  public destroyFiles = async (publicIds: string[] = []): Promise<undefined | void | string> => {
    try {
      if (!Array.isArray(publicIds)) {
        return;
      }

      const fileResponse = await cloudinary.api.delete_resources(publicIds);

      return fileResponse;
    }
    catch (error) {
      logger.error(`[src/services/files.service.ts:destroyFiles] error: ${(error as Error).message}`);
    }
  };

  /**
   * delete all files in a folder
   * @doc https://support.cloudinary.com/hc/en-us/articles/202521092-How-to-delete-all-images-within-a-folder
   * @param folder
   * @returns
   */
  public destroyFilesByFolder = async (
    folder: string,
    options?: AdminAndResourceOptions
  ): Promise<undefined | void> => {
    try {
      const fileResponse = await cloudinary.api.delete_resources_by_prefix(folder, options);

      if (fileResponse.result !== 'ok') {
        throw new Error('Error while deleting files in folder ' + folder);
      }

      return fileResponse;
    }
    catch (error) {
      logger.error(`[src/services/files.service.ts:deleteFilesByFolder] error: ${(error as Error).message}`);
    }
  };
}

export default FileService;
