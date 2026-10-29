import i18n from '@/config/i18n';
import { defaultUserPointerFields } from '@/constants/_core/app.constants';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { loadUserSlice } from '@/redux/reducers/_core/user.reducer';
import { AppDispatch } from '@/redux/store';
import { resetUserMfaInCloud } from '@/services/_core/auth.service';
import { fetchUser } from '@/services/_core/user.service';

const collection = '_User';

/**
 * An OWNER clears the second factor of an admin who lost their authenticator app and backup codes —
 * the user page is then read again, so the account shows what the server holds.
 */
export const resetUserMfaById = (userId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await resetUserMfaInCloud(userId);

    const user = await fetchUser(userId, defaultUserPointerFields);

    if (user) dispatch(loadUserSlice(user));

    dispatch(setMessageSlice(i18n.t('user:mfa.adminReset.success')));
  },
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};
