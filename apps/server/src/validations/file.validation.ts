import { type ZodType, z } from 'zod';

import type { Locale } from '@/types/app.type';
import type { IClientFileValidationSchemaInput } from '@/types/file.type';

import { translate } from '@/config/i18next';
import { hasAcceptedFileTypes, hasFilesMaxSize } from '@/utils/file.utils';

const ACCEPTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'svg', 'pdf', 'webp', 'csv'];
const MAX_FILE_SIZE = 5; // in MB
const fileSizeMaxErrorMessage = 'common:errorsFromServer.fileSizeTooLarge';
const acceptedFileTypeErrorMessage = 'common:errorsFromServer.invalidFileType';

type Options = {
  locale?: Locale | undefined;
} & IClientFileValidationSchemaInput;

/**
 * multiple files upload schema
 * and the file size is limited to 5Mo
 * @param options
 * @returns
 */
export const getFilesFieldSchema = (options?: Options): ZodType<any, any, any> => {
  const locale = options?.locale;
  const maxFileSize = options?.maxFileSize || MAX_FILE_SIZE;
  const acceptedFileTypes = options?.acceptedFileTypes || ACCEPTED_IMAGE_TYPES;

  const maxFileSizeError = locale
    ? translate('error.fileSizeTooBig', locale, { size: maxFileSize.toString() })
    : fileSizeMaxErrorMessage;
  const acceptedFileTypesError = locale ? translate('error.invalidFileType', locale, { fileTypes: acceptedFileTypes.join(', ') }) : acceptedFileTypeErrorMessage;

  return z
    .any()
    .refine((files: File[]) => {
      if (!files?.length) return true;
      return !hasFilesMaxSize(files, maxFileSize);
    }, maxFileSizeError)
    // file types validation
    .refine((files: File[]): boolean => {
      if (!files?.length) return true;
      return hasAcceptedFileTypes(files, acceptedFileTypes || ACCEPTED_IMAGE_TYPES);
    }, acceptedFileTypesError);
};

/*
 * --------------------------------------- //
 * ------------- CLOUDINARY -------------- //
 * --------------------------------------- //
 */
/**
 * generated using ts-to-zod library (https://github.com/fabien0102/ts-to-zod)
 * the types are copied from /node_modules/cloudinary/index.d.ts
 */

export const resourceOptionsSchema = z.object({
  type: z.string().optional(),
  resource_type: z.string().optional(),
});

export const updateApiOptionsSchema = resourceOptionsSchema.extend({
  access_control: z.array(z.string()).optional(),
  auto_tagging: z.number().optional(),
  background_removal: z.string().optional(),
  categorization: z.string().optional(),
  context: z.union([z.boolean(), z.string()]).optional(),
  custom_coordinates: z.string().optional(),
  detection: z.string().optional(),
  face_coordinates: z.string().optional(),
  headers: z.string().optional(),
  notification_url: z.string().optional(),
  ocr: z.string().optional(),
  raw_convert: z.string().optional(),
  similarity_search: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  moderation_status: z.string().optional(),
  unsafe_update: z.record(z.any(), z.any()).optional(),
  allowed_for_strict: z.boolean().optional(),
  asset_folder: z.string().optional(),
  unique_display_name: z.boolean().optional(),
  display_name: z.string().optional(),
});

// --------------------------------------- //
export const clientFileValidationSchema = z.object({
  maxFileSize: z.number().optional(),
  acceptedFileTypes: z.array(z.string()).optional(),
});

export const getUploadBodyRequestSchema = (locale: Locale | undefined) => z.object({
  folder: z.string().nonempty({
    message: locale ? translate('missingFolder', locale) : 'common:errorsFromServer.missingFolderParameter',
  }),
  userId: z.string({
    error: locale ? translate('error.invalidStringType', locale) : 'common:form.error.invalidStringType',
  }).optional(),
  config: updateApiOptionsSchema.optional(),
  locale: z.string().optional(),
});

/**
 * schema for the files upload request
 * to validate the request body and files of the API
 * this will check the max file size and the accepted file types
 * and can be returned a localized error message
 */
export const getFilesUploadInputSchema = (options?: Options) => getUploadBodyRequestSchema(options?.locale)
  .extend({
    files: getFilesFieldSchema(options),
    clientValidation: clientFileValidationSchema.optional(),
  });
