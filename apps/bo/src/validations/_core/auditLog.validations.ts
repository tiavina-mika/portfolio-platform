import { z } from 'zod';

import { dateForAdvancedSearchSchema } from '@/validations/_core/app.validations';

export const auditLogFilterSchema = z.object({
  timestamp: dateForAdvancedSearchSchema,
  deletionInitiatedBy: z.array(z.string().optional()).optional(),
});
