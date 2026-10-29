import { z } from 'zod';

export const clearRecycleBinInCloudSchema = z.object({
  limit: z.coerce.number().int().positive(),
});

export const purgeOrphanedEditorFilesInCloudSchema = z.object({
  olderThanHours: z.coerce.number().int().positive(),
});
