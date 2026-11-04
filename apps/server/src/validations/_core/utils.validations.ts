import { z } from 'zod';

import { collections } from '@/constants/_core/constants';

/**
 * whitelist of Parse class names that may be targeted by generic admin tooling
 * (destroyObjects, getObjectsCount) — prevents an arbitrary/internal Parse class
 * (e.g. `_Session`, `_Role`) from being queried or destroyed via a free-text param
 */
export const collectionNameFieldSchema = z.enum(
  Object.values(collections) as [string, ...string[]]
);

export const destroyObjectsSchema = z.object({
  ids: z.array(z.string()).nonempty(),
  collection: collectionNameFieldSchema,
});

export const bulkToggleEntitiesSeenSchema = z.object({
  ids: z.array(z.string()).nonempty(),
  collection: collectionNameFieldSchema,
  value: z.boolean(),
});

export const markAllEntitiesSeenSchema = z.object({
  collection: collectionNameFieldSchema,
});
