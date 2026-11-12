import type { Accept } from 'react-dropzone';

export const ACCEPTED_IMAGE_TYPES: Accept = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

export const ACCEPTED_PDF_TYPES: Accept = { 'application/pdf': ['.pdf'] };

export const MAX_CV_SIZE_MB = 5;
export const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
