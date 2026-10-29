import { z } from 'zod';

import { clientFileValidationSchema } from '@/validations/file.validation';

import { Locale } from './app.type';

export interface IUploadedFile {
  publicId: string;
  url: string;
  /**
   * language used for the file alt text and legend
   */
  locale?: Locale;
}

export interface IPdfOutput {
  buffer: Buffer;
  filename: string;
}

export type IClientFileValidationSchemaInput = z.infer<typeof clientFileValidationSchema>;
