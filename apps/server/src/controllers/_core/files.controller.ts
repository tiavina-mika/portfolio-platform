import type { Request, Response } from 'express';

import type { IUploadInput, Locale } from '@/types/app.type';
import type { IClientFileValidationSchemaInput, IUploadedFile } from '@/types/file.type';
import type { UploadApiOptions } from 'cloudinary';

import { uploadFile } from '@/api/_core/cloudinary.api';
import { throwTranslatedErrorMessage } from '@/config/i18n/zod-i18n';
import { convertUploadStringifiedBodyToObject, getFolderName } from '@/utils/_core/file.utils';
import { logger } from '@/utils/_core/logger';

import { getFilesUploadInputSchema } from '../../validations/_core/file.validations';


type Body = {
  config: string;
  locale: Locale | undefined;
  validation: string;
} & IUploadInput;

/**
 * upload multiple files (always be an array even for single file)
 * if the user id is defined, the files will be stored in that user folder
 * @param req
 * @param res
 * @param next
 */
export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { files }: any = req;
    const {
      folder, userId, config, locale, validation: clientValidation,
    }: Body = req.body;

    logger.info({
      message: 'Upload multiple files started',
      payload: {
        folder,
        userId,
        fileCount: files?.length ?? 0,
        fileNames: (files ?? []).map((file: any) => file.originalname),
      },
    });

    /*
     * ---------- convert stringified object to object ---------- //
     * the client send the body as stringified object using JSON.stringify
     * so we need to convert it to an object
     */
    const configObj = convertUploadStringifiedBodyToObject<UploadApiOptions>(config);
    /*
     * convert client validation stringified object to object
     * e.g: { maxFileSize: 5, acceptedFileTypes: ['jpg'] }
     */
    const clientValidationObject =
      convertUploadStringifiedBodyToObject<IClientFileValidationSchemaInput>(clientValidation);

    /*
     * ---------- validate the input ---------- //
     * request body and files validation
     */
    const validation = getFilesUploadInputSchema({ locale, ...clientValidationObject })
      .safeParse({
        folder,
        userId,
        files,
        config: configObj,
        locale,
        clientValidation: clientValidationObject,
      });

    /*
     * ---------- handle validation errors ---------- //
     * if locale is part of the request body, we need to translate the error messages (to send them to the client)
     */
    await throwTranslatedErrorMessage(validation, locale as string);

    if (!files) {
      throw new Error('common:errorsFromServer.missingFiles');
    }

    // ---------- upload files ---------- //
    const responses = files.map((file: any) => {
      return uploadFile({
        file,
        folder: getFolderName(folder, userId),
        config: configObj,
      });
    });

    const rawFiles = await Promise.all(responses);

    const uploadedFiles: IUploadedFile[] = rawFiles.map((f) => ({
      publicId: f.public_id,
      url: f.secure_url,
    }));

    logger.info({
      message: 'Upload multiple files end with success',
      output: uploadedFiles.length,
    });

    res.status(201).json(uploadedFiles);
  }
  catch (error) {
    logger.error(`[src/controllers/files.controllers.ts:uploadFiles] error: ${(error as Error).message}`);
    res.status(400).json((error as Error).message);
  }
};
