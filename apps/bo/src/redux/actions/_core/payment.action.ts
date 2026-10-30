import { PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';

import i18n from '@/config/i18n';
import { ALL_TAB_COUNT_KEY, DEFAULT_PAGINATION, Errors } from '@/constants/_core/app.constants';
import { paymentsTabOptions } from '@/constants/_core/payment.constants';
import { markAsSeen } from '@/redux/actions/_core/app.action';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearChargedPendingBookingsSlice,
  clearPaymentSlice,
  clearPaymentCountSlice,
  clearPaymentsSlice,
  loadChargedPendingBookingsSlice,
  loadPaymentLedgerSummarySlice,
  loadPaymentSlice,
  loadPaymentsSlice,
  setPaymentsCountSlice,
  setPaymentTabCountsSlice,
  removeChargedPendingBookingSlice,
  replacePaymentInListSlice,
  updatePaymentFieldInListSlice,
  updatePaymentFieldOnOneSlice,
} from '@/redux/reducers/_core/payment.reducer';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsMoneyCountrySelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  fetchChargedPendingBookings, fetchPayment, fetchPaymentLedgerSummary, refundPayment, resendReceipt,
  retryPayment, settleChargedPendingBooking,
} from '@/services/_core/payment.service';
import { IExportColumn, IListTabCounts } from '@/types/_core/app.type';
import { ChargedPendingDecision, IPayment, IPaymentLedgerSummary } from '@/types/_core/payment.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { getPaymentIncludes, getPaymentStatusLabel, getPaymentTypeLabel } from '@/utils/_core/payment.utils';
import { canAccessTo } from '@/utils/_core/role.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';


const collection = 'Payment';

/*
 * @NOTE covers the fixed columns only — the extra columns dynamically contributed via
 * `registerPaymentListColumn` (ex: requestId, rideId, see Payments.tsx) are not included
 */
const paymentExportColumns: IExportColumn<IPayment>[] = [
  {
    header: i18n.t('user:payments.payer'),
    getValue: (payment) => getUserFullName(payment.payer),
  },
  {
    header: i18n.t('user:payments.receiver'),
    getValue: (payment) => getUserFullName(payment.receiver),
  },
  {
    header: i18n.t('user:payments.amount'),
    getValue: (payment) => formatPriceWithCurrency(payment.amount, payment.currency),
  },
  {
    header: i18n.t('user:payments.type'),
    getValue: (payment) => getPaymentTypeLabel(payment.type),
  },
  {
    header: i18n.t('user:payments.source'),
    getValue: (payment) => getFullPhoneNumber(payment.source),
  },
  {
    header: i18n.t('user:payments.destination'),
    getValue: (payment) => getFullPhoneNumber(payment.destination),
  },
  {
    header: i18n.t('common:status'),
    getValue: (payment) => getPaymentStatusLabel(payment.status),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (payment) => displayDate(payment.createdAt, true, true),
  },
];

export const getPayment = fetchPayment;

/*
 * generic loadList/onListLeave/exportList thunks.
 * `onPaymentsEnter` intentionally does NOT use the factory's `onListEnter`: the payments list has
 * tabs the generic ones do not cover (the two directions money moves in, plus `status: failed`) and
 * it loads the ledger summary alongside the rows. There is no single/bulk delete or toggle for
 * payments either, so only the purely mechanical thunks are extracted.
 */
const paymentCrud = createCrudThunks<IPayment>({
  collection,
  listCloudFunction: 'getPayments',
  slice: {
    loadListSlice: loadPaymentsSlice,
    setCountSlice: setPaymentsCountSlice,
    clearOneSlice: clearPaymentSlice,
    clearListSlice: clearPaymentsSlice,
    clearCountSlice: clearPaymentCountSlice,
  },
  getExportColumns: () => paymentExportColumns,
  exportFileNamePrefix: 'payments',
});

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
export const loadPayments: any = paymentCrud.loadList;
export const exportPayments: any = paymentCrud.exportList;

/**
 * Which figure of the ledger summary each tab of the list is counting. The two direction tabs
 * scope the same `type` field, so they are keyed by the direction they filter to rather than by
 * the field — see `paymentDirectionTabOptions`.
 *
 * `seen` and `deleted` are deliberately absent: the summary counts the visible ledger, and a tab
 * whose figure has not landed is drawn as pending rather than as an empty scope nobody can open.
 */
const toPaymentTabCounts = (summary: IPaymentLedgerSummary): IListTabCounts => ({
  [ALL_TAB_COUNT_KEY]: summary.total,
  [PaymentTypeEnum.PASSENGER_TO_APP]: summary.byType[PaymentTypeEnum.PASSENGER_TO_APP],
  [PaymentTypeEnum.APP_TO_DRIVER]: summary.byType[PaymentTypeEnum.APP_TO_DRIVER],
  status: summary.byStatus[PaymentStatusEnum.FAILED],
});

/**
 * The whole-ledger figures the list opens on — the totals band, the operator health strip and the
 * tab counts all come from this one read. Fetched apart from the page of rows so it keeps
 * describing the entire ledger while the rows under it are filtered.
 */
export const loadPaymentLedgerSummary = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const summary = await fetchPaymentLedgerSummary(getSettingsMoneyCountrySelector(getState?.()!));

    dispatch(loadPaymentLedgerSummarySlice(summary));
    dispatch(setPaymentTabCountsSlice(toPaymentTabCounts(summary)));
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * Reads the charged bookings left pending for the "to settle" band. Quiet on purpose: a role that
 * cannot settle bookings simply gets no band, rather than an error banner on the payments list it
 * is otherwise allowed to read.
 */
export const loadChargedPendingBookings = (): AppThunkAction => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const roles = getRoleCurrentUserRolesSelector(getState?.()!);

    if (!canAccessTo(roles, 'Request', 'update')) {
      dispatch(clearChargedPendingBookingsSlice());
      return;
    }

    try {
      dispatch(loadChargedPendingBookingsSlice(await fetchChargedPendingBookings()));
    }
    catch {
      // the band is a shortcut to work the payments list already allows: never block the page on it
      dispatch(clearChargedPendingBookingsSlice());
    }
  };
};

/**
 * load categories data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onPaymentsEnter = (route?: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      tabs: paymentsTabOptions,
      searchParams: route.search,
      filters,
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    dispatch(clearListUnlessLoadedWith(
      loadPaymentsSlice, values, [clearPaymentsSlice(), clearPaymentCountSlice()]
    ));
    dispatch(loadPayments(values));
    dispatch(loadPaymentLedgerSummary());
    dispatch(loadChargedPendingBookings());
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onPaymentEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;
    const payment = await getPayment(route.params?.id, getPaymentIncludes());

    if (!payment) {
      throw new Error(Errors.notFound);
    }

    /*
     * every visit is recorded, not only the first: the server keeps `seenAt`/`seenBy` on
     * whoever opened the row first and stamps this one under `lastSeenAt`/`seenCount`, which
     * is what makes "opened 4 times, last by Marie" answerable. Silent background update, no
     * need to await — and the badge only moves when the row was still in the queue.
     */
    const hasBeenSeen = !!payment.seen;
    const seenAt = new Date();

    payment.seen = true;
    payment.lastSeenAt = seenAt;
    if (!hasBeenSeen) payment.seenAt = seenAt;
    dispatch(markAsSeen(collection, payment.id, hasBeenSeen)).catch(() => undefined);

    dispatch(loadPaymentSlice(payment));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

/**
 * Re-attempts a payment against the gateway (operator-triggered) — updates the same Payment record
 * in place so both the preview page and the row it was triggered from state the outcome straight
 * away. The list row is rewritten rather than the whole page re-fetched: an operator working
 * through a run of failures would otherwise lose their place after every retry.
 */
export const retryPaymentById = (id: string, reason: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedPayment = await retryPayment(id, reason);

    dispatch(loadPaymentSlice(updatedPayment));
    dispatch(replacePaymentInListSlice(updatedPayment));
    dispatch(setMessageSlice(
      updatedPayment.status === PaymentStatusEnum.SUCCESS
        ? i18n.t('user:payments.retrySuccess')
        : i18n.t('user:payments.retryFailed')
    ));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdatePayment'),
  });
};

/**
 * Gives part or all of a settled passenger collection back to the account it was taken from.
 *
 * The collection itself is left exactly as it stands — it did happen, and the ledger has to keep
 * saying so; what changes is how much of it is still owed. The refund is a new payment and only
 * appears in the list on the next fetch: the page is not reloaded here, because an operator
 * working down a run of rows would lose their place in it.
 *
 * The ledger band is reloaded, though — a refund is money leaving the merchant account, so the net
 * figure above the list is wrong the moment this returns.
 */
export const refundPaymentById = (payment: IPayment, amount: number, reason: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { id } = payment;
    const refund = await refundPayment(id, amount, reason);

    /*
     * a failed refund left the money where it was, so the collection is still owed exactly what it
     * was owed before — writing the new total then would take an amount off a screen that never
     * went anywhere, and the operator would stop being offered a refund they can still make
     */
    if (refund.status === PaymentStatusEnum.FAILED) {
      dispatch(setMessageSlice(i18n.t('user:payments.refundFailed')));
      return;
    }

    /*
     * both screens, because the action is offered on both: the ledger row it was triggered from
     * and the payment's own page. The server states the figure on every read — this only keeps
     * what is on screen honest until the next one.
     */
    const refundedAmount = (payment.refundedAmount ?? 0) + amount;

    dispatch(updatePaymentFieldInListSlice({ ids: [id], field: 'refundedAmount', value: refundedAmount }));
    dispatch(updatePaymentFieldOnOneSlice({ id, field: 'refundedAmount', value: refundedAmount }));
    dispatch(loadPaymentLedgerSummary());
    dispatch(setMessageSlice(i18n.t('user:payments.refundSuccess')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdatePayment'),
  });
};

/**
 * Settles a charged booking left pending — confirms the seat, or refunds the passenger and closes
 * the booking. The row leaves the band at once; the ledger summary is read again on a refund, since
 * money left the merchant account.
 */
export const settleChargedPendingBookingById = (
  id: string,
  decision: ChargedPendingDecision,
  reason: string
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    try {
      await settleChargedPendingBooking(id, decision, reason);
    }
    catch (error) {
      // settled by another agent meanwhile: read the band again so the row does not linger
      dispatch(loadChargedPendingBookings());
      throw error;
    }

    dispatch(removeChargedPendingBookingSlice(id));
    if (decision === 'refund') dispatch(loadPaymentLedgerSummary());
    dispatch(setMessageSlice(i18n.t(decision === 'confirm'
      ? 'user:payments.chargedPending.confirmSuccess'
      : 'user:payments.chargedPending.refundSuccess')));
  },
  // rights
  {
    collection: 'Request',
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdatePayment'),
  });
};

/**
 * Support-triggered resend of a SUCCESS payment's receipt by email (see Payment.tsx) — the
 * receipt itself is unchanged, so unlike `retryPaymentById` there is no Payment slice to reload.
 */
export const resendReceiptById = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await resendReceipt(id);

    dispatch(setMessageSlice(i18n.t('user:payments.resendReceiptSuccess')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdatePayment'),
  });
};
