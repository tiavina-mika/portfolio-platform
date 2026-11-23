import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { PaymentStatusEnum, QuoteStatusEnum } from '@shared/domain-types';
import { canChangePaymentStatus, isPaymentOpen } from '@shared/domain-utils';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { PAYMENT_FIXED_FIELDS, PAYMENT_PAID_FIELDS } from '@/constants/_domain/payment.constants';
import { logger } from '@/utils/_core/logger';
import { changesPaidAmount, isPaidInTheFuture } from '@/utils/_domain/payment.utils';

import { syncQuotePaidAmountService } from '../../services/_domain/payment.service.cloud';
import { getQuoteByIdService } from '../../services/_domain/quote.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

const translateStatus = (status: PaymentStatusEnum, locale: Locale): string => (
  translate(`payment.statuses.${status}`, locale)
);

const restoreOriginalValue = (payment: Parse.Object, original: Parse.Object, field: string): void => {
  const value = original.get(field);

  if (value === undefined) payment.unset(field);
  else payment.set(field, value);
};

/*
 * a payment belongs to an accepted quote, and to that quote's client: whatever was sent, the client is
 * read from the quote. An unpaid payment is the only kind written: what is paid is recorded afterwards
 */
const checkNewPayment = async (payment: Parse.Object, locale: Locale): Promise<void> => {
  const quoteId: string | undefined = payment.get('quote')?.id;
  const quote = quoteId ? await getQuoteByIdService(quoteId) : false;

  if (!quote || quote.get('status') !== QuoteStatusEnum.ACCEPTED) {
    throw new Error(translate('payment.quoteNotAccepted', locale));
  }
  if (!isPaymentOpen(payment.get('status'))) {
    throw new Error(translate('payment.notOpenOnCreation', locale));
  }

  payment.set('client', convertIdToPointer(DOMAIN_COLLECTIONS.client, quote.get('client').id));
};

/**
 * A payment's part (quote, client, kind, percent, amount) never changes once written. Its status only
 * makes the moves of the shared rules: a paid payment is history, its only way out is `cancelled`, and a
 * cancelled payment stays as it is.
 */
const checkUpdatedPayment = (payment: Parse.Object, original: Parse.Object, locale: Locale): void => {
  PAYMENT_FIXED_FIELDS.forEach((field) => {
    if (payment.dirty(field)) restoreOriginalValue(payment, original, field);
  });

  const from: PaymentStatusEnum = original.get('status');
  const to: PaymentStatusEnum = payment.get('status');

  if (from === PaymentStatusEnum.CANCELLED) {
    throw new Error(translate('payment.cancelledNotEditable', locale));
  }
  if (from === PaymentStatusEnum.PAID && (to !== PaymentStatusEnum.CANCELLED ||
    PAYMENT_PAID_FIELDS.some((field) => payment.dirty(field)))) {
    throw new Error(translate('payment.paidNotEditable', locale));
  }
  if (from !== to && !canChangePaymentStatus(from, to)) {
    throw new Error(translate('payment.statusChangeNotAllowed', locale, {
      from: translateStatus(from, locale),
      to: translateStatus(to, locale),
    }));
  }
};

// recording a payment as paid says how the client paid, and when: today unless a past day is typed
const checkPaidPayment = (payment: Parse.Object, locale: Locale): void => {
  if (!payment.get('method')) throw new Error(translate('payment.methodRequired', locale));

  const now = new Date();

  if (!payment.get('paidAt')) payment.set('paidAt', now);
  if (isPaidInTheFuture(payment.get('paidAt'), now)) {
    throw new Error(translate('payment.paidInTheFuture', locale));
  }
};

/*
 * A payment is saved by its Cloud Functions and by the quote trigger with the master key, so the session
 * is not on the request: they hand the user and the language over through the save's context.
 */
Parse.Cloud.beforeSave(
  DOMAIN_COLLECTIONS.payment,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const payment = request.object;
    const locale = (request.context?.locale as Locale | undefined) ?? DEFAULT_LANGUAGE;
    const userId = (request.context?.userId as string | undefined) ?? request.user?.id;
    const author = userId ? convertIdToPointer<Parse.User>(collections.User, userId) : undefined;
    const isNew = !payment.existed();

    if (isNew) {
      await checkNewPayment(payment, locale);
      if (author) payment.set('createdBy', author);
    } else if (request.original) {
      checkUpdatedPayment(payment, request.original, locale);
    }

    const status: PaymentStatusEnum = payment.get('status');
    const isAlreadyPaid = request.original?.get('status') === PaymentStatusEnum.PAID;

    if (status === PaymentStatusEnum.PAID && !isAlreadyPaid) checkPaidPayment(payment, locale);
    // the method and the date belong to a payment that is paid: an unpaid one carries neither
    if (isPaymentOpen(status)) ['paidAt', 'method', 'reference'].forEach((field) => payment.unset(field));

    if (author) payment.set('updatedBy', author);
  })
);

/*
 * the quote's paid amount follows its paid payments: summed again each time a payment becomes paid or a
 * paid one is cancelled. The payment is already saved: a failure here is logged, and the next payment
 * recorded sums everything again
 */
Parse.Cloud.afterSave(
  DOMAIN_COLLECTIONS.payment,
  async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const payment = request.object;
    const previousStatus = request.original?.get('status') as PaymentStatusEnum | undefined;

    if (!changesPaidAmount(payment.get('status'), previousStatus)) return;

    const quoteId: string | undefined = payment.get('quote')?.id;

    if (!quoteId) return;

    try {
      await syncQuotePaidAmountService(
        quoteId,
        request.context?.userId as string | undefined,
        request.context?.locale as Locale | undefined
      );
    } catch (error) {
      logger.error(`Payment ${payment.id}: the paid amount of quote ${quoteId} was not updated`, error);
    }
  }
);
