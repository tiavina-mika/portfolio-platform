import { createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  IAlert, IApp, IAppState, IDownloadAlert,
} from '@/types/_core/app.type';
import { IFileCloud } from '@/types/_core/file.type';
import { IUser } from '@/types/_core/user.type';

/*
 * wipes what was read under a session that is ending — handled by the root reducer in store.ts,
 * since it spans every slice rather than this one
 */
export const clearSessionDataSlice = createAction('app/clearSessionData');

const initialState: IAppState = {
  app: null,
  notifications: {},
  loading: false,
  pendingLoadCount: 0,
  currentUser: null,
  accountEmail: '',
  mfaChallengeToken: '',
  mfaOtpauthUrl: null,
  mfaBackupCodes: null,
  error: '',
  message: '',
  infoMessage: '',
  pageTitle: '',
  pageTitlePathname: '',
  alert: null,
  downloadAlerts: [],
  appSnackBar: { open: false, type: '', message: '', duration: 0 },
};

export const app: any = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /*
     * several loads run side by side (a list and its tab counts, a page and its secondary blocks),
     * so `loading` follows a count of the ones still pending: with a plain flag, the first load to
     * finish turned it off while the others were still running, and a list showed "no data" for
     * the moment before its rows arrived
     */
    startLoadingSlice: (state: IAppState) => {
      state.pendingLoadCount += 1;
      state.loading = true;
    },
    endLoadingSlice: (state: IAppState) => {
      state.pendingLoadCount = Math.max(state.pendingLoadCount - 1, 0);
      state.loading = state.pendingLoadCount > 0;
    },
    // for a context that starts from a clean slate (a Storybook story), whatever was left pending
    resetLoadingSlice: (state: IAppState) => {
      state.pendingLoadCount = 0;
      state.loading = false;
    },
    loadCurrentUserSlice: (state: IAppState, action: PayloadAction<IUser>) => {
      state.currentUser = action.payload;
    },
    /*
     * the picture is the one field of the current user that is written on its own: uploading it
     * saves the file against the Parse user directly rather than going through a profile update, so
     * there is no refreshed user to reload — only the new file to drop onto the one in the store
     */
    loadCurrentUserImageSlice: (state: IAppState, action: PayloadAction<IFileCloud>) => {
      if (!state.currentUser) return;

      state.currentUser.image = action.payload;
    },
    setAppPageTitleSlice: (state: IAppState, action: PayloadAction<{ title: string; pathname: string }>) => {
      state.pageTitle = action.payload.title;
      state.pageTitlePathname = action.payload.pathname;
    },
    setDownloadAlerts: (state: IAppState, action: PayloadAction<IDownloadAlert>) => {
      state.downloadAlerts = [...state.downloadAlerts, action.payload];
    },
    clearDownloadAlerts: (state: IAppState) => {
      state.downloadAlerts = [];
    },
    loadAppSlice: (state: IAppState, action: PayloadAction<IApp>) => {
      state.app = action.payload;
    },
    clearAppSlice: (state: IAppState) => {
      state.app = null;
    },
    removeDownloadAlertSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.downloadAlerts = state.downloadAlerts.filter(
        (alert: IDownloadAlert) => alert.id !== action.payload
      );
    },
    clearCurrentUserSlice: (state: IAppState) => {
      state.currentUser = null;
    },
    setNotificationsSlice: (state: IAppState, action: PayloadAction<Record<string, number>>) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },
    setAccountEmailSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.accountEmail = action.payload;
    },
    clearAccountEmailSlice: (state: IAppState) => {
      state.accountEmail = '';
    },
    setMfaChallengeTokenSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.mfaChallengeToken = action.payload;
    },
    clearMfaChallengeTokenSlice: (state: IAppState) => {
      state.mfaChallengeToken = '';
    },
    setMfaOtpauthUrlSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.mfaOtpauthUrl = action.payload;
    },
    setMfaBackupCodesSlice: (state: IAppState, action: PayloadAction<string[]>) => {
      state.mfaBackupCodes = action.payload;
    },
    clearMfaEnrollmentSlice: (state: IAppState) => {
      state.mfaOtpauthUrl = null;
      state.mfaBackupCodes = null;
    },
    setAlertSlice: (state: IAppState, action: PayloadAction<IAlert>) => {
      state.alert = action.payload;
    },
    clearAlertSlice: (state: IAppState) => {
      state.alert = null;
    },
    // the loading state is left to the load that failed, which always ends it — others may still run
    setErrorSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setMessageSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setInfoMessageSlice: (state: IAppState, action: PayloadAction<string>) => {
      state.infoMessage = action.payload;
    },
    clearErrorSlice: (state: IAppState) => {
      state.error = '';
    },
    closeMessageSlice: (state: IAppState) => {
      state.message = '';
    },
    clearInfoMessageSlice: (state: IAppState) => {
      state.infoMessage = '';
    },
  },
});

export const {
  startLoadingSlice,
  endLoadingSlice,
  resetLoadingSlice,
  setErrorSlice,
  clearErrorSlice,
  closeMessageSlice,
  setMessageSlice,
  clearCurrentUserSlice,
  loadCurrentUserSlice,
  loadCurrentUserImageSlice,
  setAppPageTitleSlice,
  setNotificationsSlice,
  setAccountEmailSlice,
  clearAccountEmailSlice,
  setMfaChallengeTokenSlice,
  clearMfaChallengeTokenSlice,
  setMfaOtpauthUrlSlice,
  setMfaBackupCodesSlice,
  clearMfaEnrollmentSlice,
  setAlertSlice,
  clearAlertSlice,
  setInfoMessageSlice,
  clearInfoMessageSlice,
  setDownloadAlerts,
  clearDownloadAlerts,
  removeDownloadAlertSlice,
  loadAppSlice,
  clearAppSlice,
} = app.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getAppSelector = (state: Record<string, any>): IAppState => state.app;
export const getAppLoadingSelector = (state: Record<string, any>): boolean => state.app.loading;
export const getAppErrorSelector = (state: Record<string, any>): string => state.app.error;
export const getAppMessageSelector = (state: Record<string, any>): string => state.app.message;
export const getAppInfoMessageSelector = (state: Record<string, any>): string => state.app.infoMessage;
export const getAppCurrentUserSelector = (state: Record<string, any>): IUser => state.app.currentUser;
export const getAppPageTitleSelector = (state: Record<string, any>): string => state.app.pageTitle;
export const getAppPageTitlePathnameSelector = (state: Record<string, any>): string =>
  state.app.pageTitlePathname;
export const getAppAccountEmailSelector = (state: Record<string, any>): string => state.app.accountEmail;
export const getAppMfaChallengeTokenSelector = (state: Record<string, any>): string =>
  state.app.mfaChallengeToken;
export const getAppMfaOtpauthUrlSelector = (state: Record<string, any>): string | null | undefined =>
  state.app.mfaOtpauthUrl;
export const getAppMfaBackupCodesSelector = (state: Record<string, any>): string[] | null | undefined =>
  state.app.mfaBackupCodes;
export const getAppNotificationsSelector = (state: Record<string, any>): Record<string, number> =>
  state.app.notifications;
export const getAppAlertSelector = (state: Record<string, any>): IAlert => state.app.alert;
export const getAppDownloadAlertsSelector = (
  state: Record<string, any>
): IDownloadAlert[] => state.app.downloadAlerts;
export const getAppAppSelector = (state: Record<string, any>): IApp => state.app.app;

export default app.reducer;
