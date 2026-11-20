import { IEstimate } from '@/types/estimate.type';

import { ESTIMATE_STORAGE_KEY } from './constants';
import { QUOTE_FIELD_MAX_LENGTHS } from './contact.constants';

const isEstimate = (value: unknown): value is IEstimate => {
  if (typeof value !== 'object' || value === null) return false;

  const { text, sup, bring } = value as Record<string, unknown>;

  return typeof text === 'string' && typeof bring === 'string' && typeof sup === 'object' && sup !== null;
};

/**
 * The estimate the simulator left in the browser, or `null` when there is none (or when the storage is
 * blocked, or holds something else). The text is cut to what the form accepts.
 */
export const readStoredEstimate = (): IEstimate | null => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ESTIMATE_STORAGE_KEY) || 'null');

    if (!isEstimate(stored)) return null;

    return { ...stored, text: stored.text.slice(0, QUOTE_FIELD_MAX_LENGTHS.estimate) };
  } catch {
    return null;
  }
};

/**
 * Forgets the estimate: it has been sent with the request, and the privacy policy promises it is deleted then
 */
export const clearStoredEstimate = (): void => {
  try {
    localStorage.removeItem(ESTIMATE_STORAGE_KEY);
  } catch { /* storage is blocked: there is nothing kept to forget */ }
};
