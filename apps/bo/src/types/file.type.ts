import { UploadApiOptions } from './cloudinary.type';
import { Locale } from './setting.type';

interface IResponsiveBreakpoints {
  width: number;
  height: number;
  url: string;
  size: number;
}
export interface IFileCloud {
  url: string;
  publicId: string;
  size?: string;
  createdAt?: Date;
  height?: number;
  width?: number;
  responsiveBreakpoints?: IResponsiveBreakpoints;
}

interface IClientAPIValidation {
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

export interface IUploadFile {
  folder: string;
  userId?: string;
  sessionToken: string | null;
  endpoint?: string;
  config?: UploadApiOptions;
  validation?: IClientAPIValidation;
  locale?: Locale;
}

export interface IUploadFilesAPI extends IUploadFile {
  files: File[];
  saveExtraFields?: boolean;
}

export interface IMultipleUploadResponse {
  uploadedFiles: IFileCloud[];
}

export interface ITranslatedFileCloud {
  locale: Locale;
}
