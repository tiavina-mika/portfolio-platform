import { z } from 'zod';

import { dateForAdvancedSearchSchema } from '@/validations/_core/app.validations';

export const reportResolutionSchema = z.object({
  resolution: z.string().trim().min(1).max(500),
});

/**
 * The eight criteria the report queue can be narrowed by. Every one of them is optional: the panel
 * shows all of its fields at once, so an untouched field reaches the resolver empty and must not
 * turn into a validation error on a filter nobody set.
 */
export const reportFilterSchema = z.object({
  statuses: z.array(z.string()).optional(),
  targetTypes: z.array(z.string()).optional(),
  reasons: z.array(z.string()).optional(),
  target: z.string().optional(),
  reportedBy: z.string().optional(),
  countries: z.array(z.string().optional()).optional(),
  createdAt: dateForAdvancedSearchSchema,
  // the toggle carries its value as a string, since that is what a toggle button group holds
  minAgeDays: z.string().optional(),
});
