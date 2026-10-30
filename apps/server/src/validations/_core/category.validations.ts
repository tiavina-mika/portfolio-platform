import { z } from 'zod';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, localesFieldSchema, objectIdFieldSchema,
} from './util.validations';

const categoriesFiltersSchema = z.object({
  deleted: z.boolean().optional(),
}).optional();

const categoriesSearchSchema = z.object({
  user: z.string().optional(),
  text: z.string().optional(),
  name: z.string().optional(),
  entity: z.string().optional(),
  active: z.array(z.boolean()).optional(),
  parentCategory: z.string().optional(),
  rootOnly: z.boolean().optional(),
  // where the category sits in the tree: 'root' has no parent, 'subcategory' has one
  level: z.enum(['root', 'subcategory']).optional(),
  minItems: z.number().optional(),
  maxItems: z.number().optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getCategoriesSchema = paginationQuerySchema.extend({
  filters: categoriesFiltersSchema,
  search: categoriesSearchSchema,
  locales: localesFieldSchema,
  include: includeFieldSchema,
});

export const getCategorySchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});
