import { PAYMENT_REFERENCE_MAX_LENGTH } from '@shared/domain-constants';
import { PaymentMethodEnum } from '@shared/domain-types';
import { z } from 'zod';

import { localeFieldSchema, objectIdFieldSchema, workspaceFieldSchema } from '../_core/util.validations';

/*
 * a date the Parse SDK sends as a `Date`, or a call made by hand as an ISO string; an empty value comes
 * back as `null`
 */
const optionalDateSchema = z.union([z.date(), z.iso.datetime().transform((value) => new Date(value))])
  .nullish()
  .transform((value) => value ?? null);

// sent by every back-office call: the language of the error messages and the workspace worked in
const requestFieldsSchema = {
  locale: localeFieldSchema.optional(),
  workspace: workspaceFieldSchema,
};

/*
 * Every schema is strict: the amount, the percent, the kind, the status, the quote and the client of a
 * payment are the server's, so a faulty or forged call that sends one is refused rather than obeyed.
 */

// the payments of one accepted quote
export const getQuotePaymentsSchema = z.strictObject({
  quote: objectIdFieldSchema,
  ...requestFieldsSchema,
});

// the schedule of an accepted quote that has none yet
export const createQuotePaymentsSchema = getQuotePaymentsSchema;

const paidFieldsSchema = {
  method: z.enum(PaymentMethodEnum),
  reference: z.string().trim().max(PAYMENT_REFERENCE_MAX_LENGTH)
    .nullish()
    .transform((value) => value || null),
  // the day the money came in; left out, today
  paidAt: optionalDateSchema,
};

/** what was paid, read off an already validated request: the other params are dropped */
export const paymentPaidInputSchema = z.object(paidFieldsSchema);

export const markPaymentAsPaidSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...paidFieldsSchema,
  ...requestFieldsSchema,
});

// the day a payment falls due; an empty one takes it back to planned
const dueDateFieldsSchema = {
  dueDate: optionalDateSchema,
};

/** the due date, read off an already validated request */
export const paymentDueDateInputSchema = z.object(dueDateFieldsSchema);

export const setPaymentDueDateSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...dueDateFieldsSchema,
  ...requestFieldsSchema,
});

// a mistake is corrected by cancelling the payment: a new one of the same part takes its place
export const cancelPaymentSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...requestFieldsSchema,
});
