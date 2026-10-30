import i18n from '@/config/i18n';
import {
  clearImpersonationSessionSlice, setImpersonationSessionSlice,
} from '@/redux/reducers/_core/impersonation.reducer';
import { AppDispatch } from '@/redux/store';
import {
  endImpersonationSessionInCloud, impersonateUserInCloud,
} from '@/services/_core/impersonation.service';
import { UIRoleEnum } from '@/types/_core/role.type';

import { actionWithLoader } from './util.action';

export const impersonateUserById = (userId: string, reason: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const session = await impersonateUserInCloud(userId, reason);

    dispatch(setImpersonationSessionSlice(session));
  },
  // rights
  {
    uiRight: UIRoleEnum.IMPERSONATION,
    hasNoRightErrorMessage: i18n.t('user:errors.canNotImpersonate'),
  });
};

export const endImpersonationSessionById = (sessionId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await endImpersonationSessionInCloud(sessionId);

    dispatch(clearImpersonationSessionSlice());
  },
  // rights
  {
    uiRight: UIRoleEnum.IMPERSONATION,
  });
};
