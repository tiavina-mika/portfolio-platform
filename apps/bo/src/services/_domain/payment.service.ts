import Parse from 'parse';

import type { TargetEnum } from '@shared/types';

import { Locale } from '@/types/_core/setting.type';
import { IPayment, IPaymentPaidInput } from '@/types/_domain/payment.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

/*
 * Every payment call goes through a Cloud Function: the server checks the Aldaron workspace there, which
 * a direct query could not, and writes the amounts. The workspace and the language travel with each call.
 */
type RequestContext = { locale: Locale; workspace: TargetEnum };

// `toJSON` writes a stored date as a `{ __type, iso }` object: the dates are read off the object instead
const toISODate = (payment: Parse.Object, field: string): string | undefined => (
  (payment.get(field) as Date | undefined)?.toISOString()
);

const toPayment = (payment: Parse.Object): IPayment => ({
  ...toJSONWithId<IPayment>(payment),
  quoteId: payment.get('quote')?.id ?? '',
  dueDate: toISODate(payment, 'dueDate'),
  paidAt: toISODate(payment, 'paidAt'),
});

/** the payments of one accepted quote, in the order they were written; none for any other quote */
export const fetchQuotePayments = async (quoteId: string, context: RequestContext): Promise<IPayment[]> => {
  const payments: Parse.Object[] = await Parse.Cloud.run('getQuotePayments', { quote: quoteId, ...context });

  return payments.map(toPayment);
};

/** writes the 30 / 40 / 30 schedule of an accepted quote that has no payment yet */
export const createQuotePayments = async (quoteId: string, context: RequestContext): Promise<IPayment[]> => {
  const payments: Parse.Object[] = await Parse.Cloud.run('createQuotePayments', { quote: quoteId, ...context });

  return payments.map(toPayment);
};

export const markPaymentAsPaid = async (
  id: string, values: IPaymentPaidInput, context: RequestContext
): Promise<IPayment> => {
  const payment = await Parse.Cloud.run('markPaymentAsPaid', { id, ...values, ...context });

  return toPayment(payment);
};

export const setPaymentDueDate = async (
  id: string, dueDate: Date | null, context: RequestContext
): Promise<IPayment> => {
  const payment = await Parse.Cloud.run('setPaymentDueDate', { id, dueDate, ...context });

  return toPayment(payment);
};

/** cancels a payment: the server writes a new unpaid one of the same part in its place */
export const cancelPayment = async (
  id: string, context: RequestContext
): Promise<{ cancelled: IPayment; replacement: IPayment }> => {
  const { cancelled, replacement } = await Parse.Cloud.run('cancelPayment', { id, ...context });

  return { cancelled: toPayment(cancelled), replacement: toPayment(replacement) };
};
