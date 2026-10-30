import { PaymentServiceEnum } from '@shared/types';
import { z } from 'zod';

import type { LanguageCode } from '@shared/constants';

import { uploadBodyRequestSchema } from '@/validations/_core/file.validations';
import { downloadFileInputSchema } from '@/validations/_core/util.validations';

export type Locale = LanguageCode;

export interface IUploadedFile {
  publicId: string;
  url: string;
}

export type IUploadInput = z.infer<typeof uploadBodyRequestSchema>;

export type DownloadFileInput = z.infer<typeof downloadFileInputSchema>;
export class HttpException extends Error {
  public status: number;

  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export type DBRights = 'create' | 'update' | 'get' | 'find' | 'delete' | 'destroy';

export type Phone = {
  code: string;
  number: string;
};

export type PaymentService = `${PaymentServiceEnum}`;

export enum EnvEnum {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
  PREPROD = 'preProduction'
}
