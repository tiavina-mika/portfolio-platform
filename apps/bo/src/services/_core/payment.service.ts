import Parse from 'parse';

import { CHARGED_PENDING_BOOKINGS_LIMIT } from '@/constants/_core/payment.constants';
import {
  ChargedPendingDecision, IChargedPendingBooking, IPayment, IPaymentLedgerSummary,
} from '@/types/_core/payment.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchPayment = async (
  id: string,
  include: string[] = []
): Promise<IPayment | undefined> => {
  const payment = await Parse.Cloud.run('getPayment', { id, include });

  return (payment ? toJSONWithId(payment) : undefined);
};

/**
 * Sends a failed payment to the operator again. `reason` is required by the server: the row this
 * mutates is the only record of who decided to move the money again and why.
 */
export const retryPayment = async (id: string, reason: string): Promise<IPayment> => {
  const result = await Parse.Cloud.run('retryPayment', { id, reason });

  return toJSONWithId(result.payment);
};

export const resendReceipt = async (id: string): Promise<void> => {
  await Parse.Cloud.run('resendReceipt', { id });
};

/**
 * Gives a settled passenger collection back, in whole or in part. Returns the refund — a payment of
 * its own, in the opposite direction — not the collection it reverses, which is left as it stands.
 */
export const refundPayment = async (
  id: string,
  amount: number | undefined,
  // required by the server: a manual refund cannot be reconstructed from the amounts alone
  reason: string
): Promise<IPayment> => {
  const result = await Parse.Cloud.run('refundPayment', { id, amount, reason });

  return toJSONWithId(result.payment);
};

/** The bookings that were charged and stayed PENDING, oldest first. */
export const fetchChargedPendingBookings = async (): Promise<IChargedPendingBooking[]> => {
  const { results } = await Parse.Cloud.run('getChargedPendingRequests', {
    limit: CHARGED_PENDING_BOOKINGS_LIMIT, skip: 0,
  });

  return results;
};

/**
 * Settles one of them: the seat is confirmed, or the money goes back and the booking is closed.
 * `reason` is required by the server — it is the only record of why support decided so.
 */
export const settleChargedPendingBooking = async (
  id: string,
  decision: ChargedPendingDecision,
  reason: string
): Promise<void> => {
  await Parse.Cloud.run('settleChargedPendingRequest', { id, decision, reason });
};

/**
 * The whole-ledger figures the payments list opens on. Read apart from `getPayments` so they
 * describe the entire ledger rather than the page the operator has currently filtered down to.
 */
export const fetchPaymentLedgerSummary = async (country?: string): Promise<IPaymentLedgerSummary> => {
  return Parse.Cloud.run('getPaymentLedgerSummary', { country });
};
