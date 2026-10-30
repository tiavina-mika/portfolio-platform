import { PaymentServiceEnum, PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';
import { z } from 'zod';

import { phoneFieldSchema } from './user.validations';
import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, objectIdFieldSchema,
} from './util.validations';

/**
 * Highest `rowsPerPageOptions` entry in the BO payments list is 75 — 200 leaves headroom for
 * legitimate BO use while still rejecting an arbitrarily large `limit`.
 */
const MAX_PAYMENTS_LIMIT = 200;

const paymentsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  status: z.enum(PaymentStatusEnum).optional(),
  // the two direction tabs of the ledger (collections / payouts)
  type: z.enum(PaymentTypeEnum).optional(),
  /*
   * narrows the ledger to one account, on whichever side of the movement it stands — the
   * back-office links here from that account's page
   */
  user: objectIdFieldSchema.optional(),
}).optional();

/*
 * `search` also matches arbitrary key/value pairs against Payment fields
 * (see `Object.keys(search).forEach` in getPayments) — `.catchall()` accepts those
 * dynamic keys on top of the well-known ones below
 */
const paymentsSearchSchema = z.object({
  text: z.string().optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
  payer: z.string().optional(),
  receiver: z.string().optional(),
  status: z.array(z.enum(PaymentStatusEnum)).optional(),
  type: z.array(z.enum(PaymentTypeEnum)).optional(),
  service: z.array(z.enum(PaymentServiceEnum)).optional(),
  countries: z.array(z.string()).optional(),
  failureReason: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
}).catchall(z.union([z.string(), z.boolean()])).optional();

export const getPaymentsSchema = paginationQuerySchema.extend({
  limit: paginationQuerySchema.shape.limit.max(MAX_PAYMENTS_LIMIT),
  filters: paymentsFiltersSchema,
  search: paymentsSearchSchema,
  include: includeFieldSchema,
});

export const getPaymentSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});

/** What the back-office sends to ask the operator again about a payment stuck in PENDING */
export const recheckPendingPaymentSchema = z.object({
  id: objectIdFieldSchema,
});

/**
 * `reason` is why the operator is sending this payment again, and it is required: a retry moves
 * real money out of the merchant account, and the row it mutates is the only record of who decided
 * to and why. An automatic retry calls `retryPaymentAPI` directly and carries no reason — this
 * schema only guards the back-office function.
 */
export const retryPaymentSchema = z.object({
  id: objectIdFieldSchema,
  reason: z.string().nonempty(),
});

/**
 * `amount` is what to give back, for a journey cut short or a seat dropped. Omitted, the refund is
 * whatever is left of the collection — which is the whole of it the first time. Zero is rejected
 * rather than accepted as a no-op: a refund of nothing is a mistake, not an instruction.
 *
 * `reason` is required for the same reason as on a retry: a manual refund cannot be reconstructed
 * afterwards from the amounts alone.
 */
export const refundPaymentSchema = z.object({
  id: objectIdFieldSchema,
  amount: z.number().positive().optional(),
  reason: z.string().nonempty(),
});

const paymentRelatedEntitySchema = z.object({
  key: z.string().nonempty(),
  type: z.string().nonempty(),
  id: objectIdFieldSchema,
});

/**
 * Validates the input of `processAndCreatePayment` (internal — called from every payment flow,
 * never a direct Cloud Function param) so a negative/NaN amount or a malformed phone is rejected
 * before a `Payment` row is even created, instead of reaching the mock gateway silently.
 * `amount` allows 0 — a passenger cancelling < 2h before departure legitimately gets a
 * `APP_TO_PASSENGER` payment of 0 (see `getCancelledRequestRefund`'s tier 3), kept for an
 * accurate audit trail of the cancellation.
 */
export const paymentInputSchema = z.object({
  payerId: objectIdFieldSchema.optional(),
  receiverId: objectIdFieldSchema.optional(),
  amount: z.number().nonnegative(),
  relatedEntities: z.array(paymentRelatedEntitySchema).optional(),
  paymentType: z.enum(PaymentTypeEnum),
  description: z.string().nonempty(),
  source: phoneFieldSchema,
  destination: phoneFieldSchema,
  commission: z.number().nonnegative().optional(),
  commissionRate: z.number().nonnegative().optional(),
});
