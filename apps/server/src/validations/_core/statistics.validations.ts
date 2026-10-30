import { z } from 'zod';

import { STATISTICS_PERIODS } from '@/utils/_core/period.utils';

/**
 * `withPenalty` also writes off the fine the suspension came with. Two decisions, so two answers:
 * a suspension lifted because the cancellation was justified clears the fine, one lifted as a
 * goodwill gesture does not.
 *
 * `reason` is what the operator types before confirming. It is only required when the fine goes
 * with the lifting — that is the branch that gives up revenue, and `clearUserSuspension` refuses it
 * without one — but it is recorded either way.
 */
export const clearUserSuspensionSchema = z.object({
  userId: z.string().nonempty(),
  withPenalty: z.boolean().optional(),
  reason: z.string().nonempty().optional(),
});

export const overviewStatisticsSchema = z.object({
  months: z.number().min(1).max(24).optional(),
  // the country whose currency the money figures are summed in, the default country's when absent
  country: z.string().optional(),
});

export const periodStatisticsSchema = z.object({
  period: z.enum(STATISTICS_PERIODS).optional(),
  country: z.string().optional(),
});
