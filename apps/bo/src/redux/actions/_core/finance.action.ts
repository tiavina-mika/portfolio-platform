import { PaymentStatusEnum } from '@shared/types';

import i18n from '@/config/i18n';
import { DEFAULT_PAGINATION, Errors, EXPORT_MAX_ROWS } from '@/constants/_core/app.constants';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { clearErrorSlice, setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearDriverWalletSlice,
  clearDriversWithPendingDebtSlice,
  loadDriverWalletSlice,
  loadDriversWithPendingDebtSlice,
  loadFinanceOverviewSlice,
  loadOverduePendingPaymentsSlice,
  setDriversWithPendingDebtCountSlice,
  setDriversWithPendingDebtTotalsSlice,
  setFinanceLoadingSlice,
} from '@/redux/reducers/_core/finance.reducer';
import { getSettingsMoneyCountrySelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  fetchDriverWallet, fetchDriversWithPendingDebt, fetchFinanceOverview, fetchOverduePendingPayments,
  recheckPendingPayment,
} from '@/services/_core/finance.service';
import { clearUserSuspensionInCloud } from '@/services/_core/statistics.service';
import { ExportFormat, IQueriesInput } from '@/types/_core/app.type';
import { UIRoleEnum } from '@/types/_core/role.type';
import { StatisticsPeriod } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getDriverWalletsExportColumns } from '@/utils/_core/finance.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';

export const goToFinanceOverview = (): any => ({ to: PATH_NAMES.finance.root });

export const onFinanceOverviewEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { uiRight: UIRoleEnum.FINANCE });
};

export const loadFinanceOverview = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      /*
       * the page reads the app error as "these figures failed to load", so it must only ever
       * describe this read — a leftover from another page would draw an error state over figures
       * that are perfectly fine
       */
      dispatch(clearErrorSlice());

      const [overview, overduePendingPayments] = await Promise.all([
        fetchFinanceOverview(period, getSettingsMoneyCountrySelector(getState?.()!)),
        fetchOverduePendingPayments(),
      ]);

      dispatch(loadFinanceOverviewSlice(overview));
      dispatch(loadOverduePendingPaymentsSlice(overduePendingPayments));
    },
    { localLoadingAction: setFinanceLoadingSlice }
  );
};

/**
 * Asks the operator again about a payment stuck in PENDING, then reads the overview again: a
 * payment the operator answered for is settled and leaves the list, and the count of the card — a
 * real count, not the length of the page of rows — follows it.
 */
export const recheckOverduePendingPayment = (id: string, period?: StatisticsPeriod): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { status } = await recheckPendingPayment(id);

    if (status === PaymentStatusEnum.PENDING) {
      dispatch(setInfoMessageSlice(i18n.t('finance:recheck.stillPending')));
    }
    else {
      dispatch(setMessageSlice(i18n.t('finance:recheck.settled')));
    }

    await dispatch(loadFinanceOverview(period));
  },
  // rights
  {
    collection: 'Payment',
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdatePayment'),
  });
};

/*
 * ---------------------------------------------------- //
 * ---------------- driver wallet (one) ---------------- //
 * ---------------------------------------------------- //
 */

export const goToDriverWallet = (driverId: string): any => (
  { to: `${PATH_NAMES.finance.root}/${PATH_NAMES.finance.drivers}/$id`, params: { id: driverId } }
);

export const onDriverWalletEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route?.params?.id) return;

    const wallet = await fetchDriverWallet(route.params.id);

    if (!wallet) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadDriverWalletSlice(wallet));
  }, { uiRight: UIRoleEnum.FINANCE });
};

export const onDriverWalletLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearDriverWalletSlice());
  };
};

/*
 * ------------------------------------------------------------- //
 * ---------------- drivers with pending debt (list) ----------- //
 * ------------------------------------------------------------- //
 */

export const goToDriverWallets = (): any => (
  { to: `${PATH_NAMES.finance.root}/${PATH_NAMES.finance.drivers}` }
);

export const loadDriversWithPendingDebt = (queries: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    // same reason as the overview: the list reads the app error as its own failure to load
    dispatch(clearErrorSlice());

    const result = await fetchDriversWithPendingDebt(queries, getSettingsMoneyCountrySelector(getState?.()!));

    dispatch(loadDriversWithPendingDebtSlice(result.results));
    dispatch(setDriversWithPendingDebtCountSlice(result.count));
    dispatch(setDriversWithPendingDebtTotalsSlice(result.totals));
    rememberListQuery(loadDriversWithPendingDebtSlice, queries);
  });
};

/**
 * Exports the drivers the list is currently narrowed to. `ids` is what the reader ticked — the
 * cloud function takes filters rather than a set of ids, so it is applied to what came back.
 */
export const exportDriversWithPendingDebt = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const { ids, ...listQueries } = queries;

    const result = await fetchDriversWithPendingDebt({
      ...listQueries,
      limit: listQueries.limit ?? EXPORT_MAX_ROWS,
      skip: listQueries.skip ?? 0,
    }, getSettingsMoneyCountrySelector(getState?.()!));

    const rows = ids?.length
      ? result.results.filter((driver) => ids.includes(driver.objectId))
      : result.results;

    await exportRows(rows, getDriverWalletsExportColumns(i18n.t), 'driver-wallets', format);

    // only an unpaginated export can hit the cap — a scoped one asked for a page it already sees
    if (!listQueries.limit && result.count > EXPORT_MAX_ROWS) {
      dispatch(setInfoMessageSlice(
        i18n.t('common:exportTruncatedWarning', { max: EXPORT_MAX_ROWS, total: result.count })
      ));
    }
  });
};

/**
 * Lifts a driver's suspension from the wallet list, writing off the fine too when `withPenalty` is
 * set. The list is read again with the query it was last shown under, so the row's status — and a
 * written-off driver's row, which leaves the list altogether — reflects the decision at once.
 * @param reason required by the server when the fine goes with the suspension
 */
export const liftDriverSuspension = (
  driverId: string,
  withPenalty: boolean,
  reason: string | undefined,
  queries: IQueriesInput
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await clearUserSuspensionInCloud(driverId, withPenalty, reason);

    dispatch(setMessageSlice(i18n.t('statistics:suspensionLifted')));
    await dispatch(loadDriversWithPendingDebt(queries));
  });
};

export const onDriverWalletsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: IQueriesInput = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: 'pendingPenalty',
      order: 'desc',
    };

    dispatch(clearListUnlessLoadedWith(
      loadDriversWithPendingDebtSlice, values, [clearDriversWithPendingDebtSlice()]
    ));
    dispatch(loadDriversWithPendingDebt(values));
  }, { uiRight: UIRoleEnum.FINANCE });
};
