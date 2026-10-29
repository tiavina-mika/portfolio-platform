import { z } from 'zod';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, localesFieldSchema, objectIdFieldSchema,
} from '../_core/util.validations';

export const projectForClientSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  defaultLocale: z.string(),
});

const projectsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  types: z.array(z.string()).optional(),
}).optional();

const projectsSearchSchema = z.object({
  text: z.string().optional(),
  title: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
  societyDescription: z.string().optional(),
  types: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  active: z.array(z.boolean()).optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getProjectsSchema = paginationQuerySchema.extend({
  filters: projectsFiltersSchema,
  search: projectsSearchSchema,
  locales: localesFieldSchema,
  include: includeFieldSchema,
});

export const getProjectSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});
