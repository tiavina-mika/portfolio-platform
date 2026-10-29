import dayjs from 'dayjs';

import { actionWithLoader } from '@/redux/actions/_core/util.action';
import {
  loadDashboardAlertsSlice,
  loadDashboardKpisSlice,
  loadDashboardRecentSlice,
  setDashboardErrorSlice,
  setDashboardLoadingSlice,
  setDashboardUpdatedAtSlice,
} from '@/redux/reducers/_core/dashboard.reducer';
import { getSettingsMoneyCountrySelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  fetchDashboardAlerts, fetchDashboardKpis, fetchDashboardRecent,
} from '@/services/_core/dashboard.service';

/*
 * the three parts are read in parallel and each one is written as soon as it lands, so a band is
 * drawn without waiting for the slowest part. They share one loader: one loading flag for the
 * refresh button, and one snackbar when a part fails instead of one per failed call.
 */
export const loadDashboardStats = (): any => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const country = getSettingsMoneyCountrySelector(getState?.()!);
    const error = await dispatch(actionWithLoader(
      async (dispatch: AppDispatch): Promise<void> => {
        const loadKpis = async () => dispatch(loadDashboardKpisSlice(await fetchDashboardKpis(country)));
        const loadAlerts = async () => dispatch(loadDashboardAlertsSlice(await fetchDashboardAlerts()));
        const loadRecent = async () => dispatch(loadDashboardRecentSlice(await fetchDashboardRecent()));

        await Promise.all([loadKpis(), loadAlerts(), loadRecent()]);

        dispatch(setDashboardUpdatedAtSlice(dayjs().toISOString()));
      },
      { localLoadingAction: setDashboardLoadingSlice }
    ));

    // the loader already raised the snackbar; this flag is what swaps the page for its retry card
    dispatch(setDashboardErrorSlice(!!error));
  };
};

/*
 * the figures of the previous visit are not cleared on leaving: they stay on screen, with the time
 * they were read at, while this read replaces them
 */
export const onDashboardEnter = (): any => loadDashboardStats();
