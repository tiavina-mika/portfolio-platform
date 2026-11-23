import i18n from '@/config/i18n';
import { PAYMENT_COLLECTION } from '@/constants/_domain/payment.constants';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  addPaymentToPaymentsSlice, clearPaymentsSlice, loadPaymentsSlice, updatePaymentInPaymentsSlice,
} from '@/redux/reducers/_domain/payment.reducer';
import { updateQuoteInQuotesSlice } from '@/redux/reducers/_domain/quote.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  cancelPayment, createQuotePayments, fetchQuotePayments, markPaymentAsPaid, setPaymentDueDate,
} from '@/services/_domain/payment.service';
import { fetchQuote } from '@/services/_domain/quote.service';
import { IPayment } from '@/types/_domain/payment.type';
import { IQuote } from '@/types/_domain/quote.type';
import { PaymentPaidFormValues } from '@/validations/_domain/payment.validation';

const collection = PAYMENT_COLLECTION;

// the language of the server's refusals and the workspace the call is made from
const getRequestContext = (state: RootState) => ({
  locale: getSettingsLocaleSelector(state),
  workspace: getSettingsWorkspaceSelector(state),
});

const rightsError = (action: 'create' | 'update') => i18n.t(
  action === 'create' ? 'common:errors.hasNoRightToCreate' : 'common:errors.hasNoRightToUpdate',
  { value: i18n.t('project:payment.thisPayment') }
);

// the name of a payment in a message: its part of the schedule
const getPaymentLabel = (payment: IPayment): string => i18n.t(`project:payment.kinds.${payment.kind}`);

/*
 * the quote's paid amount is the server's, summed from the paid payments: the row of the quote list is read
 * again so it shows the new amount. Silent: the payment is recorded whatever happens to this refresh
 */
const refreshQuote = async (
  dispatch: AppDispatch, quoteId: string, context: ReturnType<typeof getRequestContext>
): Promise<void> => {
  try {
    const quote = await fetchQuote(quoteId, context);

    if (quote) dispatch(updateQuoteInQuotesSlice(quote));
  }
  // the payments dialog already shows what changed; the list catches up on its next load
  catch { /* nothing to show */ }
};

/** the payments of the quote whose dialog opens; the ones of the previous quote are cleared first */
export const loadQuotePayments = (quoteId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    dispatch(clearPaymentsSlice());
    dispatch(loadPaymentsSlice(await fetchQuotePayments(quoteId, getRequestContext(getState?.()!))));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/**
 * writes the schedule of an accepted quote that has no payment: one accepted before the payments
 * existed. Never a second one: the server refuses a quote that has payments
 */
export const createQuotePaymentSchedule = (quote: IQuote): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    dispatch(loadPaymentsSlice(await createQuotePayments(quote.id, getRequestContext(getState?.()!))));
    dispatch(setMessageSlice(i18n.t('project:payment.messages.scheduleCreated', { number: quote.number })));
  },
  // rights
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: rightsError('create'),
  });
};

/** records that the client paid; the quote's paid amount follows */
export const payQuotePayment = (payment: IPayment, values: PaymentPaidFormValues): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const updated = await markPaymentAsPaid(
      payment.id,
      { method: values.method, reference: values.reference || null, paidAt: values.paidAt ?? null },
      context
    );

    dispatch(updatePaymentInPaymentsSlice(updated));
    dispatch(setMessageSlice(i18n.t('project:payment.messages.paid', { kind: getPaymentLabel(payment) })));
    await refreshQuote(dispatch, payment.quoteId, context);
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: rightsError('update'),
  });
};

/** dates the milestone or the balance, or takes its date away */
export const setQuotePaymentDueDate = (payment: IPayment, dueDate: Date | null): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const updated = await setPaymentDueDate(payment.id, dueDate, getRequestContext(getState?.()!));

    dispatch(updatePaymentInPaymentsSlice(updated));
    dispatch(setMessageSlice(i18n.t('project:payment.messages.dueDateSet', { kind: getPaymentLabel(payment) })));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: rightsError('update'),
  });
};

/**
 * corrects a payment: it stays in the list, cancelled, and the new unpaid payment written in its place
 * shows under it; the quote's paid amount follows when the payment was paid
 */
export const cancelQuotePayment = (payment: IPayment): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const { cancelled, replacement } = await cancelPayment(payment.id, context);

    dispatch(updatePaymentInPaymentsSlice(cancelled));
    dispatch(addPaymentToPaymentsSlice(replacement));
    dispatch(setMessageSlice(i18n.t('project:payment.messages.cancelled', { kind: getPaymentLabel(payment) })));
    await refreshQuote(dispatch, payment.quoteId, context);
  },
  // rights: a correction cancels a payment and writes the one that replaces it
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: rightsError('create'),
  });
};
