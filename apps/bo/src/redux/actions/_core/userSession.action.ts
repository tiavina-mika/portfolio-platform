import { BanReasonEnum, BanTypeEnum } from '@shared/types';
import dayjs from 'dayjs';

import i18n from '@/config/i18n';
import { STOLEN_DEVICE_SUSPENSION_HOURS } from '@/constants/_core/user.constants';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { updateUsersByUserSlice } from '@/redux/reducers/_core/user.reducer';
import {
  clearUserSessionsSlice, loadUserSessionsSlice, removeUserSessionSlice, setUserSessionsErrorSlice,
  setUserSessionsLoadingSlice,
} from '@/redux/reducers/_core/userSession.reducer';
import { AppDispatch } from '@/redux/store';
import { banUserInCloud } from '@/services/_core/user.service';
import {
  fetchUserSessions, revokeAllUserSessionsInCloud, revokeUserSessionInCloud,
} from '@/services/_core/userSession.service';
import { SuspendUserInput } from '@/types/_core/userSession.type';

const collection = '_User';

/*
 * a suspension is a temporary ban: the existing ban already records who suspended the account and
 * why, closes every session and tells the member — support must not grow a second mechanism
 */
const suspendUserForHours = async (
  dispatch: AppDispatch,
  userId: string,
  hours: number,
  reason: string
): Promise<void> => {
  const updatedUser = await banUserInCloud(userId, {
    type: BanTypeEnum.TEMPORARY,
    // not a sanction: the member gets a reassuring message instead of the ban one
    reason: BanReasonEnum.ACCOUNT_PROTECTION,
    reasonDetails: reason,
    until: dayjs().add(hours, 'hour').toDate(),
  });

  dispatch(updateUsersByUserSlice(updatedUser));
  // the ban closed every session on the server
  dispatch(clearUserSessionsSlice());
};

/*
 * read in the background of the user page: the block draws its own placeholder, and a failure turns
 * it into its retry box — the loader already raised the snackbar
 */
export const loadUserSessions = (userId: string): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    const error = await dispatch(actionWithLoader(
      async (dispatch: AppDispatch): Promise<void> => {
        dispatch(loadUserSessionsSlice(await fetchUserSessions(userId)));
      },
      { localLoadingAction: setUserSessionsLoadingSlice, collection, action: 'get' }
    ));

    dispatch(setUserSessionsErrorSlice(!!error));
  };
};

export const revokeUserSessionById = (userId: string, sessionId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await revokeUserSessionInCloud(userId, sessionId);

    dispatch(removeUserSessionSlice(sessionId));
    dispatch(setMessageSlice(i18n.t('user:sessions.messages.signedOut')));
  },
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

/**
 * "sign out all devices" — for a stolen phone, optionally with a suspension long enough for the
 * carrier to block the SIM, so a code sent to it cannot open a new session meanwhile
 */
export const revokeAllUserSessionsById = (userId: string, shouldSuspend: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await revokeAllUserSessionsInCloud(userId);

    dispatch(clearUserSessionsSlice());

    if (shouldSuspend) {
      await suspendUserForHours(
        dispatch,
        userId,
        STOLEN_DEVICE_SUSPENSION_HOURS,
        i18n.t('user:sessions.suspension.stolenDeviceReason')
      );
      dispatch(setMessageSlice(i18n.t('user:sessions.messages.allSignedOutAndSuspended')));
      return;
    }

    dispatch(setMessageSlice(i18n.t('user:sessions.messages.allSignedOut')));
  },
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

export const suspendUserById = (userId: string, values: SuspendUserInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await suspendUserForHours(dispatch, userId, Number(values.durationHours), values.reason);

    dispatch(setMessageSlice(i18n.t('user:sessions.messages.suspended')));
  },
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};
