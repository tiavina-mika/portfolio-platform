import { z } from 'zod';

import { SESSION_SUSPENSION_DURATION_HOURS } from '@/constants/_core/user.constants';

// the suspension support applies from the sessions block of a user file
export const suspendUserFormSchema = z.object({
  durationHours: z.enum(SESSION_SUSPENSION_DURATION_HOURS),
  // kept in the account's ban history, next to who suspended it
  reason: z.string().trim().min(3).max(500),
});
