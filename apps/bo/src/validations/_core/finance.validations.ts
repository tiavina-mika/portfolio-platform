import { z } from 'zod';

/**
 * What the driver wallet list can be narrowed by. Each field is one the server's list applies —
 * the date of the last payout is not here: it is derived from the payout ledger for the rows on
 * screen, so there is nothing to filter it on.
 */
export const driverWalletsFilterSchema = z.object({
  status: z.array(z.string().optional()).optional(),
  rating: z.string().optional(),
  minPenalty: z.string().optional(),
  maxPenalty: z.string().optional(),
});

export type DriverWalletsFiltersInput = z.infer<typeof driverWalletsFilterSchema>;
