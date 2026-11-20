import { CONTACT_MESSAGE_MAX_LENGTH } from '@shared/constants';

import { IQuoteRequestInput } from '@/types/contact.type';

import {
  QUOTE_ALLOWED_FILE_EXTENSIONS,
  QUOTE_BRING_LABELS,
  QUOTE_FILE_NAMES_MAX_LENGTH,
  QUOTE_MAX_FILE_SIZE,
  QUOTE_MAX_FILES,
  QUOTE_SUPPORT_KEYS,
  QUOTE_SUPPORT_LABELS,
} from './contact.constants';

const ELLIPSIS = '…';

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, Math.max(0, maxLength - ELLIPSIS.length))}${ELLIPSIS}`;

/**
 * The quote request as the one text the `Contact` of the back-office stores: the form has more fields than
 * a contact has columns, so each answer takes a line of the message. The estimate comes last and is the
 * one to be cut when the message is too long for a contact.
 */
export const composeQuoteMessage = (input: IQuoteRequestInput): string => {
  const supports = QUOTE_SUPPORT_KEYS
    .filter(key => input.supports[key])
    .map(key => QUOTE_SUPPORT_LABELS[key])
    .join(', ');

  const lines = [
    `Product: ${input.product}`,
    `Platforms: ${supports}`,
    input.bring && `Brings: ${QUOTE_BRING_LABELS[input.bring]}`,
    input.needs && `Needs:\n${input.needs}`,
    input.fileNames.length > 0 &&
      `Attachments (names only, the files were not received): ${
        truncate(input.fileNames.join(', '), QUOTE_FILE_NAMES_MAX_LENGTH)
      }`,
  ].filter(Boolean);

  const head = lines.join('\n');
  const estimatePrefix = '\nEstimate:\n';
  const estimateRoom = CONTACT_MESSAGE_MAX_LENGTH - head.length - estimatePrefix.length;

  if (!input.estimate || estimateRoom <= ELLIPSIS.length) return truncate(head, CONTACT_MESSAGE_MAX_LENGTH);

  return `${head}${estimatePrefix}${truncate(input.estimate, estimateRoom)}`;
};

const getExtension = (fileName: string): string => (fileName.split('.').pop() ?? '').toLowerCase();

const isAllowedFile = (file: File): boolean => {
  const extension = getExtension(file.name);
  const hasAllowedType = QUOTE_ALLOWED_FILE_EXTENSIONS.some(allowed => allowed === extension) ||
    file.type.startsWith('image/');

  return hasAllowedType && file.size <= QUOTE_MAX_FILE_SIZE;
};

/**
 * The attachments after a visitor picked more: the files of a format or a size that is refused are left
 * out and named, a file already in the list (same name, same size) is not added twice, and the list never
 * grows past the limit.
 */
export const addQuoteFiles = (
  current: File[],
  incoming: File[]
): { files: File[]; rejectedNames: string[] } => {
  const files = [...current];
  const rejectedNames: string[] = [];

  incoming.forEach(file => {
    const isDuplicate = files.some(({ name, size }) => name === file.name && size === file.size);

    if (!isAllowedFile(file) || (!isDuplicate && files.length >= QUOTE_MAX_FILES)) {
      rejectedNames.push(file.name);
      return;
    }

    if (!isDuplicate) files.push(file);
  });

  return { files, rejectedNames };
};

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

/**
 * The size of a file as written in the list: whole kilobytes under a megabyte, one decimal above
 */
export const formatFileSize = (bytes: number, units: { kb: string; mb: string }): string =>
  bytes < BYTES_PER_MB
    ? `${Math.max(1, Math.round(bytes / BYTES_PER_KB))} ${units.kb}`
    : `${(bytes / BYTES_PER_MB).toFixed(1)} ${units.mb}`;
