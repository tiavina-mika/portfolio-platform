import { z } from 'zod';

export const impersonateUserFormSchema = z.object({
  reason: z.string().min(5).max(500),
});
