import { z } from 'zod';

import { DEFAULT_LANGUAGE } from '@/config/i18next';
import { getUploadBodyRequestSchema } from '@/validations/file.validation';
import { DownloadFileInputSchema } from '@/validations/util.validation';

export type Locale = 'fr' | 'mg' | 'en';

export interface IUploadedFile {
  publicId: string;
  url: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schema = getUploadBodyRequestSchema(DEFAULT_LANGUAGE);

export type IUploadInput = z.infer<typeof schema>;

export type DownloadFileInput = z.infer<typeof DownloadFileInputSchema>;
export class HttpException extends Error {
  public status: number;

  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
