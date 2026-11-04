import { z } from 'zod';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, localesFieldSchema, objectIdFieldSchema,
  countryCodeFieldSchema,
} from './util.validations';

export const articleForClientSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  defaultLocale: z.string(),
  // the country whose website asks; the default country's content when left out
  country: countryCodeFieldSchema.optional(),
});

const articlesFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  category: z.string().optional(),
  // everything one author wrote — the back-office links here from an article's page
  user: objectIdFieldSchema.optional(),
}).optional();

const articlesSearchSchema = z.object({
  text: z.string().optional(),
  title: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  user: z.string().optional(),
  countries: z.array(z.string()).optional(),
  active: z.array(z.boolean()).optional(),
  minShares: z.number().optional(),
  maxShares: z.number().optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getArticlesSchema = paginationQuerySchema.extend({
  filters: articlesFiltersSchema,
  search: articlesSearchSchema,
  locales: localesFieldSchema,
  include: includeFieldSchema,
});

export const getArticleSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});

/**
 * called by the public website with no session at all — only the article id travels, the counter
 * itself is bumped server-side, so a visitor can never choose by how much it grows
 */
export const incrementArticleViewCountSchema = z.object({
  id: objectIdFieldSchema,
});
