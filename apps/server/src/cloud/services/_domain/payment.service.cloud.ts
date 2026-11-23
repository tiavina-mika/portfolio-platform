import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { PaymentStatusEnum } from '@shared/domain-types';
import { getOpenPaymentStatus, splitQuotePayments, sumPaidPayments } from '@shared/domain-utils';

import type { Locale } from '@/types/app.type';
import type { PaymentPaidInput } from '@/types/payment.type';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  PAID_AMOUNT_UPKEEP_CONTEXT_KEY, PAYMENT_LIST_FIELDS, QUOTE_PAYMENTS_LIMIT,
} from '@/constants/_domain/payment.constants';

import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';

const buildPaymentQuery = () => new Parse.Query(DOMAIN_COLLECTIONS.payment);

const toQuotePointer = (quoteId: string) => convertIdToPointer(DOMAIN_COLLECTIONS.quote, quoteId);

/*
 * a master-key save carries no session: the `beforeSave` trigger reads the author and the language of
 * its refusals from the context instead
 */
const buildSaveContext = (userId: string | undefined, locale?: Locale) => ({ userId, locale });

/**
 * The payments of one quote, in the order they were written: the schedule first, then the replacements
 * of the corrections.
 */
export const getQuotePaymentsService = async (quoteId: string): Promise<Parse.Object[]> => (
  buildPaymentQuery()
    .select(PAYMENT_LIST_FIELDS)
    .equalTo('quote', toQuotePointer(quoteId))
    .ascending('createdAt')
    .limit(QUOTE_PAYMENTS_LIMIT)
    .find(USE_MASTER_KEY)
);

/**
 * One payment, whatever its status.
 * @returns the payment, or `false` when there is none: `false` rather than `undefined`, which the Parse
 * client would read as a successful empty answer
 */
export const getPaymentByIdService = async (id: string): Promise<Parse.Object | false> => {
  const payment = await buildPaymentQuery()
    .select(PAYMENT_LIST_FIELDS)
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY);

  return payment ?? false;
};

/** whether a quote already has payments, whatever their status: its schedule is then never written again */
export const hasQuotePaymentsService = async (quoteId: string): Promise<boolean> => {
  const payment = await buildPaymentQuery()
    .select([])
    .equalTo('quote', toQuotePointer(quoteId))
    .first(USE_MASTER_KEY);

  return !!payment;
};

/**
 * Writes the three payments of a quote just accepted, from its total: the deposit falls due today, the
 * milestone and the balance wait for a date typed by hand. The client of each is the trigger's, read from
 * the quote.
 * @param userId the back-office user who accepted the quote
 */
export const createQuotePaymentsService = async (
  quote: Parse.Object, userId: string | undefined, locale: Locale | undefined
): Promise<Parse.Object[]> => {
  const today = new Date();
  const payments = splitQuotePayments(quote.get('totalAmount') ?? 0).map(({ kind, percent, amount }, index) => {
    const payment = new Parse.Object(DOMAIN_COLLECTIONS.payment);
    const isDeposit = index === 0;

    payment.set('quote', toQuotePointer(quote.id));
    payment.set('kind', kind);
    payment.set('percent', percent);
    payment.set('amount', amount);
    payment.set('status', isDeposit ? PaymentStatusEnum.DUE : PaymentStatusEnum.PLANNED);
    if (isDeposit) payment.set('dueDate', today);

    return payment;
  });

  /*
   * one after the other, not in a batch: each save carries the context its trigger reads (author,
   * language), and the payments are listed in the order they were written, deposit first
   */
  const saved: Parse.Object[] = [];

  for (const payment of payments) {
    saved.push(await payment.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(userId, locale) }));
  }

  return saved;
};

/**
 * Records that the client paid. That only an unpaid payment is paid, and the date, are the trigger's.
 */
export const markPaymentAsPaidService = async (
  payment: Parse.Object, { method, reference, paidAt }: PaymentPaidInput, user: Parse.User, locale?: Locale
): Promise<Parse.Object> => {
  payment.set('status', PaymentStatusEnum.PAID);
  payment.set('method', method);
  if (reference) payment.set('reference', reference);
  else payment.unset('reference');
  if (paidAt) payment.set('paidAt', paidAt);

  return payment.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user.id, locale) });
};

/**
 * Dates an unpaid payment, or takes its date away: a dated payment is due, an undated one planned.
 */
export const setPaymentDueDateService = async (
  payment: Parse.Object, dueDate: Date | null, user: Parse.User, locale?: Locale
): Promise<Parse.Object> => {
  if (dueDate) payment.set('dueDate', dueDate);
  else payment.unset('dueDate');
  payment.set('status', getOpenPaymentStatus(dueDate));

  return payment.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user.id, locale) });
};

/** the payment cancelled by a correction, and the one written in its place */
export type PaymentCorrection = {
  cancelled: Parse.Object;
  replacement: Parse.Object;
};

/**
 * Corrects a payment: it is cancelled and kept as history, and a new unpaid payment of the same part,
 * same amount and same due date takes its place, so the open and paid payments of the quote still add up
 * to its total. The replacement is written first: if the cancellation fails, the quote has one payment
 * too many, visible and cancellable, rather than one missing.
 */
export const cancelPaymentService = async (
  payment: Parse.Object, user: Parse.User, locale?: Locale
): Promise<PaymentCorrection> => {
  const context = buildSaveContext(user.id, locale);
  const replacement = new Parse.Object(DOMAIN_COLLECTIONS.payment);
  const dueDate: Date | undefined = payment.get('dueDate');

  replacement.set('quote', toQuotePointer(payment.get('quote').id));
  ['kind', 'percent', 'amount'].forEach((field) => replacement.set(field, payment.get(field)));
  if (dueDate) replacement.set('dueDate', dueDate);
  replacement.set('status', getOpenPaymentStatus(dueDate));

  await replacement.save(null, { ...USE_MASTER_KEY, context });

  payment.set('status', PaymentStatusEnum.CANCELLED);

  const cancelled = await payment.save(null, { ...USE_MASTER_KEY, context });

  return { cancelled, replacement };
};

/**
 * Brings the paid amount of a quote up to date from its paid payments. The quote is saved with a context
 * flag: any other save of a quote puts `paidAmount` back as it was.
 * @returns the paid amount written
 */
export const syncQuotePaidAmountService = async (
  quoteId: string, userId: string | undefined, locale?: Locale
): Promise<number> => {
  const payments = await buildPaymentQuery()
    .select(['status', 'amount'])
    .equalTo('quote', toQuotePointer(quoteId))
    .equalTo('status', PaymentStatusEnum.PAID)
    .limit(QUOTE_PAYMENTS_LIMIT)
    .find(USE_MASTER_KEY);

  const paidAmount = sumPaidPayments(payments.map((payment) => ({
    status: payment.get('status'), amount: payment.get('amount') ?? 0,
  })));

  const quote = new Parse.Object(DOMAIN_COLLECTIONS.quote);

  quote.id = quoteId;
  quote.set('paidAmount', paidAmount);
  await quote.save(null, {
    ...USE_MASTER_KEY,
    context: { ...buildSaveContext(userId, locale), [PAID_AMOUNT_UPKEEP_CONTEXT_KEY]: true },
  });

  return paidAmount;
};
