/* eslint-disable @cspell/spellchecker */
import Parse from 'parse';

import { IFileCloud } from '@/types/app.type';

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

export const isUpdatedFileChanged = (prevField: IFileCloud, formField: File): boolean => {
  const fileName = formField.name.split('.')[0];
  const hasTheName = prevField?.publicId.includes(fileName);

  return hasTheName;
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
  const serverUrl = Parse.serverURL as string;
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
