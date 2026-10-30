import { z } from 'zod';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, localesFieldSchema,
  objectIdFieldSchema,
} from './util.validations';

const pagesFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  category: z.string().optional(),
}).optional();

const pagesSearchSchema = z.object({
  user: z.string().optional(),
  countries: z.array(z.string()).optional(),
  text: z.string().optional(),
  category: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
  active: z.array(z.boolean()).optional(),
  linkLocation: z.enum(['menu', 'footer']).optional(),
  minBlocks: z.number().optional(),
  maxBlocks: z.number().optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getPagesSchema = paginationQuerySchema.extend({
  filters: pagesFiltersSchema,
  search: pagesSearchSchema,
  locales: localesFieldSchema,
  include: includeFieldSchema,
});

export const getPageSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});

const pageSectionsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
}).optional();

const pageSectionsSearchSchema = z.object({
  text: z.string().optional(),
  active: z.array(z.boolean()).optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getPageSectionsSchema = paginationQuerySchema.extend({
  filters: pageSectionsFiltersSchema,
  search: pageSectionsSearchSchema,
  locales: localesFieldSchema,
  include: includeFieldSchema,
});
