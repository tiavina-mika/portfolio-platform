import { z } from 'zod';

import type { Locale } from './app.type';

import { clientFileValidationSchema } from '@/validations/file.validation';


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
