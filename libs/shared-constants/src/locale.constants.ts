import type { Locale } from '@shared/types';

export const LOCALES = ['fr', 'mg', 'en'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'fr';
