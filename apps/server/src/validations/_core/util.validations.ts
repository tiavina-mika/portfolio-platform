import { COUNTRIES, LANGUAGE_CODES } from '@shared/constants';
import {
  string, object, literal, union, array, coerce, enum as zEnum, date, number, null as zNull,
} from 'zod';

export const localeFieldSchema = zEnum(LANGUAGE_CODES);

/** the code of a country the platform runs in */
export const countryCodeFieldSchema = string().refine((code) => code in COUNTRIES);

export const downloadFileInputSchema = object({
  publicId: string().optional(),
  locale: localeFieldSchema.optional(),
  id: string().optional(),
  fileName: string().optional(),
  sessionToken: string().optional(),
});

/**
 * shared shape for BO list-query Cloud Functions (getUsers, getArticles, getRides, ...)
 * `search` and `filters` are validated per-domain (each function extends this base)
 */
export const paginationQuerySchema = object({
  limit: coerce.number().int().nonnegative(),
  skip: coerce.number().int().nonnegative(),
  orderBy: string().optional(),
  order: zEnum(['asc', 'desc']).optional(),
});

export const objectIdFieldSchema = string().nonempty();

export const includeFieldSchema = array(string()).optional();

export const localesFieldSchema = array(localeFieldSchema).nonempty();

/**
 * `search.createdAt` / `search.updatedAt` shape produced by `filtersDatesQuery` — a
 * [start, end] range where either side may be null for an open-ended range
 */
export const dateRangeFieldSchema = array(union([string(), number(), date(), zNull()])).length(2);

export const multiBooleanFieldSchema = array(union([literal(true), literal(false)]));
