import { enum as zEnum, object } from 'zod';

import { objectIdFieldSchema, paginationQuerySchema } from './util.validations';

export const contentVersionEntityTypeSchema = zEnum(['Article', 'Page']);

export const getContentVersionsSchema = paginationQuerySchema.extend({
  entityType: contentVersionEntityTypeSchema,
  entityId: objectIdFieldSchema,
});

export const getContentVersionSnapshotSchema = object({
  entityType: contentVersionEntityTypeSchema,
  entityId: objectIdFieldSchema,
  versionId: objectIdFieldSchema,
});
