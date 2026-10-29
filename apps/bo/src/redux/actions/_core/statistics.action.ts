import isEmpty from 'lodash/isEmpty';

import i18n from '@/config/i18n';
import { COLLECTIONS } from '@/constants/_core/app.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsMoneyCountrySelector } from '@/redux/reducers/_core/settings.reducer';
import {
  loadCancellationReasonsSlice,
  loadCancellationStatisticsSlice,
  loadOverviewStatisticsSlice,
  loadPaymentsStatisticsSlice,
  loadReportsStatisticsSlice,
  loadRidesHeatmapSlice,
  loadRidesStatisticsSlice,
  loadSuspendedUsersSlice,
  loadUsersStatisticsSlice,
  loadVehiclesStatisticsSlice,
  setRidesHeatmapLoadingSlice,
  setStatisticsLoadingSlice,
  setSuspendedUsersLoadingSlice,
} from '@/redux/reducers/_core/statistics.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  clearUserSuspensionInCloud,
  fetchCancellationReasonBreakdown,
  fetchCancellationStatistics,
  fetchOverviewStatistics,
  fetchPaymentsStatistics,
  fetchReportsStatistics,
  fetchRidesActivityHeatmap,
  fetchRidesStatistics,
  fetchSuspendedUsers,
  fetchUsersStatistics,
  fetchVehiclesStatistics,
} from '@/services/_core/statistics.service';
import { UIRoleEnum } from '@/types/_core/role.type';
import { StatisticsPeriod, StatisticsViewEnum } from '@/types/_core/statistics.type';
import { getStatisticsViewPath } from '@/utils/_core/statistics.utils';

/**
 * The period goes along with the view, except to the overview, which has no period of its own and
 * always reads the last twelve months. The comparison with the previous period goes along too: a
 * reader who switched it on keeps it while moving from one view to the next.
 */
export const goToStatisticsView = (
  view: StatisticsViewEnum,
  period?: StatisticsPeriod,
  isComparing?: boolean
): any => {
  const search = {
    ...(period && view !== StatisticsViewEnum.OVERVIEW ? { period } : {}),
    ...(isComparing ? { isComparing } : {}),
  };

  return { to: getStatisticsViewPath(view), search: isEmpty(search) ? undefined : search };
};

export const goToStatisticsOverview = (): any => goToStatisticsView(StatisticsViewEnum.OVERVIEW);

export const onOverviewStatisticsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { uiRight: UIRoleEnum.STATISTICS });
};

export const onUsersStatisticsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { collection: COLLECTIONS.user, action: 'find' });
};

export const onPaymentsStatisticsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { collection: COLLECTIONS.payment, action: 'find' });
};

export const onReportsStatisticsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { collection: COLLECTIONS.report, action: 'find' });
};

export const onCancellationsStatisticsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { uiRight: UIRoleEnum.STATISTICS });
};

export const loadOverviewStatistics = (): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const overview = await fetchOverviewStatistics(getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadOverviewStatisticsSlice(overview));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

export const loadUsersStatistics = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const users = await fetchUsersStatistics(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadUsersStatisticsSlice(users));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

/**
 * the activity heatmap of the rides view, under its own flag: it is the slowest read of the view,
 * and the figures and trend charts above it must not wait for it
 */
const loadRidesHeatmap = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const heatmap = await fetchRidesActivityHeatmap(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadRidesHeatmapSlice(heatmap));
    },
    { localLoadingAction: setRidesHeatmapLoadingSlice }
  );
};

// the figures and trend charts of the rides view, under the view's own flag
const loadRidesFigures = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const rides = await fetchRidesStatistics(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadRidesStatisticsSlice(rides));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

export const loadRidesStatistics = (period?: StatisticsPeriod): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    // both thunks report their own errors and never reject, so neither can take the other down
    await Promise.all([
      dispatch(loadRidesFigures(period)),
      dispatch(loadRidesHeatmap(period)),
    ]);
  };
};

export const loadPaymentsStatistics = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const payments = await fetchPaymentsStatistics(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadPaymentsStatisticsSlice(payments));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

export const loadVehiclesStatistics = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const vehicles = await fetchVehiclesStatistics(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadVehiclesStatisticsSlice(vehicles));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

export const loadReportsStatistics = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const reports = await fetchReportsStatistics(period, getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadReportsStatisticsSlice(reports));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

/**
 * the accounts the cancellation policy suspended, under their own flag: the list does not depend on
 * the period, and the view's figures must not wait for it
 */
const loadSuspendedUsers = (): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const suspendedUsers = await fetchSuspendedUsers(getSettingsMoneyCountrySelector(getState?.()!));

      dispatch(loadSuspendedUsersSlice(suspendedUsers));
    },
    { localLoadingAction: setSuspendedUsersLoadingSlice }
  );
};

// the figures, trend charts and reasons of the cancellations view, under the view's own flag
const loadCancellationFigures = (period?: StatisticsPeriod): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      const country = getSettingsMoneyCountrySelector(getState?.()!);
      const [cancellations, reasons] = await Promise.all([
        fetchCancellationStatistics(period, country),
        fetchCancellationReasonBreakdown(period, country),
      ]);

      dispatch(loadCancellationStatisticsSlice(cancellations));
      dispatch(loadCancellationReasonsSlice(reasons));
    },
    { localLoadingAction: setStatisticsLoadingSlice }
  );
};

export const loadCancellationStatistics = (period?: StatisticsPeriod): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    // both thunks report their own errors and never reject, so neither can take the other down
    await Promise.all([
      dispatch(loadCancellationFigures(period)),
      dispatch(loadSuspendedUsers()),
    ]);
  };
};

/**
 * Lifts a suspension the cancellation policy applied automatically. The policy decides from
 * counters alone, so it cannot know a cancellation was justified — this is the only way to undo
 * one, and the list is reloaded so the row disappears the moment it is no longer suspended.
 */
export const clearUserSuspension = (
  userId: string,
  withPenalty: boolean,
  period?: StatisticsPeriod,
  /** why support is lifting it — required by the server when the fine goes with it */
  reason?: string
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    await clearUserSuspensionInCloud(userId, withPenalty, reason);

    const suspendedUsers = await fetchSuspendedUsers(getSettingsMoneyCountrySelector(getState?.()!));

    dispatch(loadSuspendedUsersSlice(suspendedUsers));
    dispatch(setMessageSlice(i18n.t('statistics:suspensionLifted')));
    // the counters above the list move with it — the list itself was just re-read above
    dispatch(loadCancellationFigures(period));
  },
  {
    collection: COLLECTIONS.user,
    action: 'update',
  });
};
