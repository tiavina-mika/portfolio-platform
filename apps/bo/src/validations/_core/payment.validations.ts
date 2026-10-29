import { z } from 'zod';

import { dateForAdvancedSearchSchema, tabRouteSearchParams } from '@/validations/_core/app.validations';

/**
 * What the ledger reads off its own address. Beyond the tab, it accepts the id of an account: that
 * account's page sends the operator here to work through every movement of money it was on either
 * side of, with the columns and the row detail the ledger has and a profile page does not.
 */
export const paymentsRouteSearchParams = tabRouteSearchParams.extend({ user: z.string().optional() });

export type PaymentsRouteSearchParams = z.infer<typeof paymentsRouteSearchParams>;

/**
 * What the payments list can be narrowed by. Every field here has a column on `Payment` behind it —
 * a filter the ledger cannot actually apply is worse than one it does not offer, because the reader
 * has no way of telling the empty result from a filter that silently did nothing.
 */
export const paymentFilterSchema = z.object({
  createdAt: dateForAdvancedSearchSchema,
  payer: z.string().optional(),
  receiver: z.string().optional(),
  status: z.array(z.string().optional()).optional(),
  type: z.array(z.string().optional()).optional(),
  service: z.array(z.string().optional()).optional(),
  countries: z.array(z.string().optional()).optional(),
  /*
   * one exact message rather than free text: the choices are the messages the gateway has actually
   * produced, read back from the ledger, so typing into it could only ever miss
   */
  failureReason: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
});
