/* eslint-disable @cspell/spellchecker */
import Parse from 'parse';

import { http, protectRequest } from '@/config/http';
import { UploadApiResponse } from '@/types/cloudinary.type';
import { IFileCloud, IUploadFile, IUploadFilesAPI } from '@/types/file.type';
import { Locale } from '@/types/setting.type';
import { PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

import { DEFAULT_LOCALE } from './constants';

/**
 * get the original filename from the url
 * instead of define manually a new name
 */
const getFilenameFromContentDisposition = (res: Record<string, any>): string | null => {
  let filename = null;

  const disposition = res.headers.get('content-disposition');

  if (disposition?.includes('attachment')) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);

    if (matches?.[1]) {
      filename = matches[1].replace(/['"]/g, '');
      // Sometimes the filename comes in a URI encoded format so decode it
      filename = decodeURIComponent(filename);
      // Sometimes the filename starts with UTF-8, remove that
      filename = filename.replace(/^UTF-8/i, '').trim();
    }
  }

  return filename;
};

/**
 * transform a file url to input file
 */
export const getFileFromUrl = async (url: string): Promise<File> => {
  const fileRes = await fetch(url);
  const blob = await fileRes.blob();

  let fileName = getFilenameFromContentDisposition(fileRes);

  if (!fileName) {
    fileName = url.split('/').pop()!;
  }

  const file = new File([blob], fileName, { type: blob.type });

  return file;
};

/**
 * convert bytes to file sizes
 */
export const convertBytesToFileSize = (
  bytes: number,
  unit: 'mb' | 'kb' | 'gb' = 'mb',
  withUnit = false
): number | string => {
  let size = 1;

  switch (unit) {
    case 'kb':
      size = 1;
      break;
    case 'mb':
      size = 2;
      break;
    case 'gb':
      size = 3;
      break;
    default:
      size = 2;
  }

  const transformedSize = bytes / (1024 ** size);
  const fixedSize = +transformedSize.toFixed(3);

  if (withUnit) {
    return fixedSize + unit;
  }
  return fixedSize;
};

/**
 * convert kb, mb, gb to bytes
 * E.g: 5, 'mb' => 5242880 bytes, 'kb' => 5120 bytes, 'gb' => 5368709120 bytes, 0.000002 mb => 2 bytes
 */
export const convertFileSizeToBytes = (size: number, type = 'mb'): number => {
  const types = ['B', 'KB', 'MB', 'GB', 'TB'];

  const key = types.indexOf(type.toUpperCase());

  if (typeof key !== 'boolean') {
    return size * (1024 ** key);
  }

  return 0;
};

/**
 * convert upload response to IFileCloud
 * so we can use it in the app and save it in the database
 * @param res
 * @returns
 */
export const formatUploadResponse = (saveExtraField = false) => (res: UploadApiResponse): IFileCloud => {
  const data: IFileCloud = {
    url: res.secure_url,
    publicId: res.public_id,
  };

  if (saveExtraField) {
    data.size = convertBytesToFileSize(res.bytes, 'mb', true) as string;
    data.createdAt = new Date(res.created_at);
    data.height = res.height;
    data.width = res.width;
  }

  if (res.responsive_breakpoints?.length > 0) {
    data.responsiveBreakpoints = res.responsive_breakpoints?.map(
      (breakpoint: UploadApiResponse['responsive_breakpoints']) => {
        return breakpoint?.breakpoints.map((bp: any) => ({
          url: bp.secure_url,
          width: bp.width,
          height: bp.height,
          size: convertBytesToFileSize(bp.bytes, 'mb', true) as string,
        }));
      });
  }

  return data;
};

/**
 * upload multiple files
 * @param files list of input file
 * @param folder folder to save the files (in cloud)
 * @param userId id of the current user
 * @param sessionToken token of the current user
 * @param endpoint url of the endpoint
 * @returns
 */
export const uploadFilesAPI = async ({
  files,
  folder,
  userId,
  sessionToken,
  endpoint = '/files',
  config,
  validation,
  locale = DEFAULT_LOCALE,
  saveExtraFields = false,
}: IUploadFilesAPI): Promise<IFileCloud[]> => {
  if (!sessionToken) {
    throw new Error('Session token is required for file upload');
  }
  const formData = new FormData();

  files.forEach((file: File) => {
    formData.append('files', file);
  });

  formData.append('folder', folder);

  if (userId) {
    formData.append('userId', userId);
  }

  if (config) {
    formData.append('config', JSON.stringify(config));
  }
  if (validation) {
    formData.append('validation', JSON.stringify(validation));
  }

  formData.append('locale', locale);

  const response = await http.post<FormData, UploadApiResponse[]>(
    endpoint,
    formData,
    protectRequest(sessionToken, true)
  );

  return response.map(formatUploadResponse(saveExtraFields));
};

interface ISyncUploadFilesToDatabase {
  fields: string[];
  entity: Parse.Object;
  formValues: Record<string, any>;
  uploadInput: Omit<IUploadFile, 'endpoint'>;
  locale?: Locale;
}

/**
 * upload the new files to the api
 * add the new upload files url to database with the old ones
 * remove the unused old files from the list
 * in the server, remove these removed files from the cloud
 * @param fields list of field name, ex: ['images']
 * @param entity parse entity, ex: Page
 * @param formValues values from form
 * @param uploadInput data to send to the upload api
 * @returns
 */
export const updateUploadedMultipleFilesToSave = async ({
  fields,
  entity,
  formValues,
  uploadInput,
}: ISyncUploadFilesToDatabase): Promise<Record<string, any>> => {
  const newValues: Record<string, any> = {};

  for (const field of fields) {
    const oldFieldValue = entity.get(field);

    // input values
    if (formValues[field] && Array.isArray(formValues[field])) {
      const inputFiles = formValues[field];
      const newInputFilesToUpload = [];
      const oldSavedFilesToKeep = [];

      for (const inputFile of inputFiles) {
        // get the input file name
        const inputFileName = inputFile.name.split('.')[0];
        // check if the file name exist in data base file list
        const oldSavedFileToKeep = oldFieldValue?.find((oldFile: IFileCloud) =>
          oldFile.publicId.includes(inputFileName)
        );

        if (oldSavedFileToKeep) {
          oldSavedFilesToKeep.push(oldSavedFileToKeep);
        }
        else {
          newInputFilesToUpload.push(inputFile);
        }
      }

      // upload the new files
      const fileUploadInput = { ...uploadInput, files: newInputFilesToUpload };
      const uploadedFilesUrls = await uploadFilesAPI(fileUploadInput);

      // will save the new files and the not-removed old ones
      newValues[field] = [...uploadedFilesUrls, ...oldSavedFilesToKeep];
    }
  }

  return newValues;
};

/**
 * upload all single file and multiple files fields files
 * ex: bannerImage, previewImage, images, ...
 */
interface IUploadInput<T> {
  folder: string;
  userId?: string;
  sessionToken: string | null;
  values: T;
  singleUploadFields?: string[];
  multipleUploadFields?: string[];
  locale?: Locale;
}

export const uploadFormFiles = async <T extends Record<string, any>>({
  folder,
  sessionToken,
  userId,
  values,
  singleUploadFields = PAGE_SINGLE_IMAGE_FIELDS,
  multipleUploadFields,
  locale = DEFAULT_LOCALE,
}: IUploadInput<T>): Promise<Record<string, IFileCloud | IFileCloud[]>> => {
  if (!sessionToken) {
    throw new Error('Session token is required for file upload');
  }
  const uploadInput = {
    folder,
    userId,
    sessionToken,
  };

  const newValues: Record<string, any> = {};

  // --------- single file fields --------- //
  for (const field of singleUploadFields) {
    if (values[field]) {
      const options: IUploadFilesAPI = {
        ...uploadInput,
        locale,
        files: [values[field]],
      };

      // resize preview image because it always has a fixed size
      if (field.includes('preview')) {
        options.config = {
          responsive_breakpoints: [
            {
              create_derived: false,
              min_width: 600,
              max_width: 600,
              max_images: 1,
            },
          ],
        };
      }

      const files = await uploadFilesAPI(options);

      [newValues[field]] = files;
    }
  }

  // --------- multiple files fields --------- //
  if (multipleUploadFields) {
    for (const field of multipleUploadFields) {
      if (values[field] && Array.isArray(values[field])) {
        const fileUploadInput = { ...uploadInput, files: values[field] };
        const uploadedFilesUrls = await uploadFilesAPI(fileUploadInput);

        newValues[field] = uploadedFilesUrls;
      }
    }
  }

  return newValues;
};

export const isUpdatedFileChanged = (prevField: IFileCloud, formField: File): boolean => {
  const fileName = formField.name.split('.')[0];
  const hasTheName = prevField?.publicId.includes(fileName);

  return hasTheName;
};

/**
 * upload all single file and multiple files fields files
 * ex: bannerImage, previewImage, images, ...
 */
type UpdatedUploadInput<T> = {
  parseObj: Parse.Object;
} & IUploadInput<T>;

export const uploadUpdatedFormFiles = async <T extends Record<string, any>>({
  parseObj,
  folder,
  sessionToken,
  userId,
  values,
  singleUploadFields = PAGE_SINGLE_IMAGE_FIELDS,
  multipleUploadFields = PAGE_IMAGES_FIELDS,
  locale,
}: UpdatedUploadInput<T>): Promise<any> => {
  if (!sessionToken) {
    throw new Error('Session token is required for file upload');
  }
  const uploadInput = {
    folder,
    userId,
    sessionToken,
    locale,
  };

  const newValues: Record<string, any> = {};

  // --------- single file fields --------- //
  for (const field of singleUploadFields) {
    if (values[field]) {
      const oldFieldValue = parseObj.get(field);
      const isNew = isUpdatedFileChanged(oldFieldValue, values[field]);

      // new uploaded file
      if (!isNew) {
        const options = { ...uploadInput, files: [values[field]] };
        const files = await uploadFilesAPI(options);

        [newValues[field]] = files;
      }
      else {
        newValues[field] = oldFieldValue;
      }
    }
  }

  if (multipleUploadFields) {
    for (const field of multipleUploadFields) {
      const oldSavedFiles = parseObj.get(field);

      // input values
      if (values[field] && Array.isArray(values[field])) {
        const inputFiles = values[field];
        const newInputFilesToUpload = [];
        const oldSavedFilesToKeep = [];

        for (const inputFile of inputFiles) {
        // get the input file name
          const inputFileName = inputFile.name.split('.')[0];
          // check if the file name exist in database file list
          const oldSavedFileToKeep = oldSavedFiles?.find((oldFile: IFileCloud) =>
            oldFile.publicId.includes(inputFileName)
          );

          if (oldSavedFileToKeep) {
            oldSavedFilesToKeep.push(oldSavedFileToKeep);
          }
          else {
            newInputFilesToUpload.push(inputFile);
          }
        }

        // upload the new files
        const fileUploadInput = { ...uploadInput, files: newInputFilesToUpload };
        const uploadedFilesUrls = await uploadFilesAPI(fileUploadInput);

        // will save the new files and the remove old ones
        newValues[field] = [...uploadedFilesUrls, ...oldSavedFilesToKeep];
      }
    }
  }

  return newValues;
};

/**
 * download a file from the server
 * this function will open a new tab to download the file
 * we do not use fetch or axios here for calling the API
 * instead we use the window.location (browser url) to call the API
 * NOTE: this function is available only in the browser (client side)
 */
interface IDownloadFileParams {
  // endpoint path, ex: my-file.pdf for api app.get('my-file.pdf', { ... })
  pathName: string;
  // data passed to the endpoint as query params
  data?: Record<string, any>;
  // the current user to get the session token for the download
  currentUser?: Parse.User;
  openInNewTab?: boolean;
}
export const downloadFile = ({
  pathName, data = {}, currentUser, openInNewTab = false,
}: IDownloadFileParams) => {
  if (currentUser) {
    data.sessionToken = currentUser.getSessionToken();
  }

  // e.g: http://localhost:1337/parse
  const serverUrl = Parse.serverURL;
  const lastSlash = serverUrl.lastIndexOf('/');
  // convert the data object to query params
  const queryParams = Object
    .keys(data)
    .map(value => `${value}=${encodeURIComponent(data[value])}`)
    .join('&');

  // remove /parse in the url
  const hostname = serverUrl.substring(0, lastSlash);
  // e.g http://localhost:1337/download/my-file.pdf?publicId=123
  const location = `${hostname}/download/${pathName}?${queryParams}`;

  if (!openInNewTab) {
    window.location.href = location;
    return;
  }

  return window.open(location, '_blank');
};

export const isMimeType = (type: string): boolean => {
  if (!type || typeof type !== 'string') {
    return false;
  }
  const array = type.split('/');

  return array.length === 2 && array[0] !== '' && array[1] !== '';
};

/**
 * get mime name from mime type
 * ex: image/png => image
 *     application/pdf => pdf
 *    application/msword => word
 */
export const getMimeNameFromType = (mimeType: string): string => {
  if (!isMimeType(mimeType)) {
    return '';
  }
  const array = mimeType.split('/');
  const type = array[0];
  const extension = array[1];

  if (['image', 'video', 'audio'].includes(type)) {
    return type;
  }

  if (['pdf', 'zip', 'json', 'xml', 'csv', 'txt', 'html', 'css', 'javascript', 'markdown'].includes(extension)) {
    return extension;
  }

  if (extension === 'plain') return 'text';

  if (['msword', 'officedocument', 'document'].includes(extension)) {
    return 'word';
  }

  if (['mspowerpoint', 'officedocument.presentation'].includes(extension)) {
    return 'powerpoint';
  }

  if (['msexcel', 'officedocument.spreadsheet'].includes(extension)) {
    return 'excel';
  }

  if (extension.includes('7z')) return '7z';
  if (extension.includes('rar')) return 'rar';

  return '';
};

/**
 * Get file extension from mime type
 * e.g: image/jpg => jpg, text/plain => txt
 * @param mimeType e.g: image/jpg, text/plain
 * @returns
 */
export const convertMimeTypeToFileExtension = (mimeType: string): string => {
  if (!isMimeType(mimeType)) {
    return '';
  }
  const array = mimeType.split('/');
  const extension = array[1];

  switch (extension) {
    case 'jpeg':
    case 'jpg':
      return 'jpg';
    case 'plain':
      return 'txt';
    case 'vnd.ms-powerpoint':
    case 'vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'pptx';
    case 'vnd.ms-excel':
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    case 'vnd.ms-word':
    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'vnd.rar':
      return 'rar';
    case 'x-7z-compressed':
      return '7z';
    case 'x-msvideo':
      return 'avi';
    case '3gpp':
      return '3gp';
    case 'svg+xml':
      return 'svg';
    case 'javascript':
      return 'js';
    case 'markdown':
      return 'md';
    case 'x-yaml':
      return 'yaml';
    default:
      return extension;
  }
};

/**
 * convert file extension to mime type
 * e.g: jpg => image/jpg, txt => text/plain
 * @param extension e.g: jpg, .jpg, txt, pdf, ...
 * @returns
 */
export const convertFileExtensionToMimeType = (extension: string): string => {
  let formattedExtension = extension.toLowerCase();

  if (formattedExtension.startsWith('.')) {
    formattedExtension = formattedExtension.substring(1);
  }

  switch (formattedExtension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'zip':
      return 'application/zip';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    case 'csv':
      return 'text/csv';
    case 'txt':
      return 'text/plain';
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'javascript':
    case 'typescript':
    case 'js':
    case 'ts':
      return 'application/javascript';
    case 'markdown':
    case 'md':
      return 'text/markdown';
    case 'yaml':
    case 'yml':
      return 'application/x-yaml';
    case 'doc':
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'rar':
      return 'application/vnd.rar';
    case '7z':
      return 'application/x-7z-compressed';
    case 'avi':
      return 'video/x-msvideo';
    case '3gp':
      return 'video/3gpp';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      return '';
  }
};
