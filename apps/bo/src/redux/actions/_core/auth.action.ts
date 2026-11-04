import { PlatformEnum } from '@shared/types';
import Parse from 'parse';

import i18n from '@/config/i18n';
import { Errors } from '@/constants/_core/app.constants';
import { DISABLE_USER_ACCOUNT_CONFIRMATION } from '@/constants/_core/user.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import {
  setErrorSlice,
  loadCurrentUserSlice,
  setMessageSlice,
  clearErrorSlice,
  setAccountEmailSlice,
  clearAccountEmailSlice,
  setMfaChallengeTokenSlice,
  clearMfaChallengeTokenSlice,
  setMfaOtpauthUrlSlice,
  setMfaBackupCodesSlice,
  clearMfaEnrollmentSlice,
  setAlertSlice,
  clearAlertSlice,
  getAppAccountEmailSelector,
  getAppMfaChallengeTokenSelector,
  clearCurrentUserSlice,
  clearSessionDataSlice,
} from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, toggleIsAuthenticatedSlice } from '@/redux/reducers/_core/settings.reducer';
import { setUserLoadingSlice } from '@/redux/reducers/_core/user.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  becomeUserFromSessionToken,
  changeCurrentUserPassword,
  confirmMfaEnrollmentInCloud,
  disableMfaInCloud,
  fetchCurrentUserJson,
  generateMfaSecretInCloud,
  logInUser,
  logOutCurrentUser,
  regenerateMfaBackupCodesInCloud,
  resetPasswordInCloud,
  sendEmailVerificationCodeInCloud,
  sendResetPasswordVerificationCodeInCloud,
  signUpUser,
  verifyAccountCode,
  verifyMfaLoginInCloud,
} from '@/services/_core/auth.service';
import { getParseErrorMessage } from '@/services/_core/parseError.service';
import {
  IChangePasswordInput, ILoginInput, ResetPasswordInput, ISignUpInput,
} from '@/types/_core/auth.type';
import { IPlatformType } from '@/types/_core/user.type';
import { parseBeforeLoginPayload } from '@/utils/_core/auth.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { clearUserIntoLocalStorage, updateUserIntoLocalStorage } from '@/utils/_core/user.utils';

// NOTE: platform is just used temporary for the user creation, it will be unset in after save trigger
export const SIGNUP_PROPERTIES = new Set([
  'firstName',
  'lastName',
  'email',
  'password',
  'username',
  'platform',
  'invitationToken',
]);

export const logout = (): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await logOutCurrentUser();

    // clear local storage
    clearUserIntoLocalStorage();

    // clear store
    dispatch(toggleIsAuthenticatedSlice(false));
    dispatch(clearCurrentUserSlice());
    dispatch(clearSessionDataSlice());

    /*
     * redirect to login
     * this will be catch by onEnterActionWithLoader error handler
     */
    throw new Error(Errors.redirect);
  },
  // redirect to login
  { redirectTo: PATH_NAMES.login });
};

interface ISignUp extends Partial<ISignUpInput> {
  username: string;
  platform: IPlatformType;
  invitationToken?: string;
}

/**
 * create user account
 * @param values
 * @returns
 */
export const signUp = (values: ISignUpInput & { invitationToken?: string }, navigate: any): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;

    if ((state as any).app.error) {
      dispatch(clearErrorSlice());
    }

    const newValues: ISignUp = { ...values, username: values.email, platform: PlatformEnum.BO };

    delete newValues.passwordConfirmation; // passwordConfirmation should not be saved to db

    try {
      const { emailVerified: isEmailVerified } = await signUpUser(newValues, SIGNUP_PROPERTIES);

      /*
       * * This should be placed elsewhere:
       * * I moved it in the ConfirmEmail component
       */

      /*
       * accountCreatedSuccessfully
       * by default, it logged in automatically after the user is created
       * we need to login manually after the user is created
       * so we logged out the newly created user and redirect to the login page
       */
      if (DISABLE_USER_ACCOUNT_CONFIRMATION) {

        // eslint-disable-next-line no-use-before-define
        await navigate(goToLogout());

        // eslint-disable-next-line no-use-before-define
        navigate(goToLogin());
        return;
      }

      /*
       * instead of redirecting to the login page,
       * redirect to the email confirmation page.
       * And pass the email to the the ConfirmEmail Page Component
       */
      await logOutCurrentUser();

      if (isEmailVerified) {
        // eslint-disable-next-line no-use-before-define
        navigate(goToLogin());
        return;
      }

      dispatch(setAccountEmailSlice(values.email));
      // eslint-disable-next-line no-use-before-define
      navigate(goToAccountVerificationCode());
    }
    catch (error) {
      throw new Error(getParseErrorMessage(error));
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * check connected user
 * @returns {function(*=, *=): Promise<void>}
 */
export const loginSuccess = (redirectToHome?: boolean, navigate?: any): any => {
  return actionWithLoader(async (dispatch: AppDispatch) => {
    // Parse SDK is the source of truth for session validity, not the Redux store
    const currentUser = await fetchCurrentUserJson();

    dispatch(clearAccountEmailSlice());

    /*
     * ------------------------------------------//
     * ------------- login success --------------//
     * ------------------------------------------//
     */
    if (currentUser) {
      dispatch(loadCurrentUserSlice(currentUser));
      dispatch(toggleIsAuthenticatedSlice(true));

      // update user into localStorage
      updateUserIntoLocalStorage(currentUser);

      // navigate is only available in a component (from hooks)
      if (redirectToHome && navigate) {
      // redirection after login
        navigate({ to: PATH_NAMES.home });
      }

      return;
    }

    /*
     * ------------------------------------------//
     * ------------- login failed ---------------//
     * ------------------------------------------//
     */
    dispatch(setErrorSlice(i18n.t('user:errors.sessionTokenExpired')));
    if (!navigate) return;

    /*
     * retry login
     * navigate is only available in a component (from hooks)
     */
    navigate({ to: PATH_NAMES.login });
  });
};

/**
 * login with email and password
 * @param values
 * @returns
 */
export const login = (values: ILoginInput, navigate: any): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;

    if ((state as any).app.error) {
      dispatch(clearErrorSlice());
    }

    try {
      await logInUser(values.email, values.password);

      dispatch(loginSuccess(true, navigate)); // redirect
    }
    catch (error) {
      console.log('login error: ', error);
      /*
       * what `beforeLogin` refused the sign-in with is decided on the payload it wrote, not on the
       * Parse error number: a failure of the trigger itself comes back with the same one
       */
      const payload = parseBeforeLoginPayload(error);

      /*
       * if the user account is not verified yet
       * the confirmation code is send automatically in the beforeLogin trigger
       */
      if (!DISABLE_USER_ACCOUNT_CONFIRMATION && payload?.code === 'ACCOUNT_NOT_VERIFIED') {
        dispatch(setErrorSlice(i18n.t('user:errors.userNotVerified')));

        // eslint-disable-next-line no-use-before-define
        navigate(goToAccountVerificationCode());
        dispatch(setAccountEmailSlice(values.email));
        return;
      }

      /*
       * beforeLogin blocks the login outright (no session created) when MFA is enabled — see
       * auth.triggers.ts. The password step already succeeded; redirect to the TOTP/backup-code
       * entry screen with the one-time challenge token it returned.
       */
      if (payload?.code === 'MFA_REQUIRED') {
        dispatch(setMfaChallengeTokenSlice(payload.mfaChallengeToken!));
        // eslint-disable-next-line no-use-before-define
        navigate(goToMfaVerify());
        return;
      }

      if (payload?.code === 'ACCOUNT_BANNED') {
        dispatch(setErrorSlice(payload.reason
          ? i18n.t('user:errors.accountBannedWithReason', { reason: payload.reason })
          : i18n.t('user:errors.accountBanned')));
        return;
      }

      // the trigger itself failed (not a refusal of the account): nothing to tell about the account
      if ((error as Parse.Error).code === Parse.Error.SCRIPT_FAILED) {
        dispatch(setErrorSlice(i18n.t('user:errors.loginUnavailable')));
        return;
      }

      // code 101 (OBJECT_NOT_FOUND) is reused by Parse Server to mean "invalid credentials" here
      dispatch(setErrorSlice(getParseErrorMessage(error, { 101: 'user:errors.invalidUsername' })));
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * Confirms the second factor after a password-only login was blocked with MFA_REQUIRED — exchanges
 * the challenge token for a real session (verifyMfaLoginInCloud), hydrates the client SDK with it
 * (becomeUserFromSessionToken), then completes login the same way a normal one would.
 */
export const verifyMfaLogin = (code: string, navigate: any): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const mfaChallengeToken = getAppMfaChallengeTokenSelector(state);

    try {
      const { sessionToken } = await verifyMfaLoginInCloud(mfaChallengeToken, code);

      await becomeUserFromSessionToken(sessionToken);
      dispatch(clearMfaChallengeTokenSlice());
      dispatch(loginSuccess(true, navigate));
    }
    catch (error) {
      dispatch(setErrorSlice(getParseErrorMessage(error)));
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * Refreshes the redux-held currentUser from the Parse SDK — used after enabling/disabling MFA so
 * `currentUser.mfa.enabled` (and therefore MfaRequiredBanner/ProfileEditMfa) reflects the change
 * immediately, without a full page reload.
 */
const refreshCurrentUser = async (dispatch: AppDispatch): Promise<void> => {
  const currentUser = await fetchCurrentUserJson(true);

  if (currentUser) dispatch(loadCurrentUserSlice(currentUser));
};

/**
 * Starts MFA enrollment for the currently authenticated user, once they typed their password again
 * (a stolen session alone must not be enough to attach an authenticator app) — stores the otpauth:// URI
 * (getAppMfaOtpauthUrlSelector) for MfaSetupForm to render as a QR code.
 */
export const enrollMfa = (password: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { otpauthUrl } = await generateMfaSecretInCloud(password);

    dispatch(setMfaOtpauthUrlSlice(otpauthUrl));
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * Confirms the first TOTP code and activates MFA — stores the backup codes
 * (getAppMfaBackupCodesSelector) for MfaBackupCodesDisplay to show exactly once.
 */
export const confirmMfaEnrollment = (code: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { backupCodes } = await confirmMfaEnrollmentInCloud(code);

    dispatch(setMfaBackupCodesSlice(backupCodes));
    dispatch(setMessageSlice(i18n.t('user:mfa.enabledSuccess')));
    await refreshCurrentUser(dispatch);
  }, { localLoadingAction: setUserLoadingSlice });
};

export const disableMfa = (code: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await disableMfaInCloud(code);
    dispatch(setMessageSlice(i18n.t('user:mfa.disabledSuccess')));
    await refreshCurrentUser(dispatch);
  }, { localLoadingAction: setUserLoadingSlice });
};

export const regenerateMfaBackupCodes = (code: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { backupCodes } = await regenerateMfaBackupCodesInCloud(code);

    dispatch(setMfaBackupCodesSlice(backupCodes));
    dispatch(setMessageSlice(i18n.t('user:mfa.backupCodesRegeneratedSuccess')));
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * change password
 * @param values
 * @returns
 */
export const changePassword = (values: IChangePasswordInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const locale = getSettingsLocaleSelector(getState?.()!);

    await changeCurrentUserPassword(values.currentPassword, values.newPassword, locale);

    dispatch(setMessageSlice(i18n.t('user:passwordWordChangedSuccess')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const verifyCodeSentByEmail = (code: string, navigate: any): any => {
  return actionWithLoader(async (_: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const email = getAppAccountEmailSelector(state);
    const result = await verifyAccountCode({
      code,
      type: 'resetPassword',
      toVerify: 'email',
      locale,
      email,
    });

    // eslint-disable-next-line no-use-before-define
    navigate(goToResetPassword(result.resetToken));
  });
};

export const verifyAccountEmail = (code: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const email = getAppAccountEmailSelector(state);

    await verifyAccountCode({
      code, type: 'accountVerification', toVerify: 'email', locale, email,
    });

    dispatch(
      setAlertSlice({
        type: 'accountVerification',
        severity: 'success',
        duration: 'permanent',
        message: i18n.t('user:messages.emailVerifiedSuccess'),
        title: i18n.t('user:messages.accountCreatedSuccessfully'),
      })
    );

    dispatch(clearErrorSlice());
  });
};

export const sendEmailVerificationCode = (email: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);

    await sendEmailVerificationCodeInCloud(email, locale);

    dispatch(setMessageSlice(i18n.t('user:emailWithCodeSent')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const sendResetPasswordVerificationCode = (email: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const isSent = await sendResetPasswordVerificationCodeInCloud(email, locale);

    if (!isSent) {
      throw new Error(i18n.t('user:errors.emailNotSent'));
    }
    // store plain email so verifyCodeSentByEmail can pass it for lockout tracking
    dispatch(setAccountEmailSlice(email));
    dispatch(setMessageSlice(i18n.t('user:emailWithCodeSent')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const resetPassword = (
  resetToken: string,
  newPassword: ResetPasswordInput['newPassword']
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await resetPasswordInCloud(resetToken, newPassword);

    if (!result.success) {
      dispatch(setAlertSlice({
        severity: 'error',
        message: i18n.t(`user:serverErrors.${result.clientMessageKey}`),
      }));
      return;
    }

    dispatch(
      setAlertSlice({
        severity: 'success',
        duration: 'permanent',
        title: i18n.t('user:messages.passwordResetSuccess'),
        message: i18n.t('user:messages.passwordResetSuccessfully'),
      })
    );
  }, { localLoadingAction: setUserLoadingSlice });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/*
 * The page is reached with a single-use reset token in the URL, and the token is what the server
 * validates when the new password is submitted. Probing whether an account exists before showing
 * the form would only add an enumeration oracle without gating anything.
 */
export const onEnterResetPassword = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearErrorSlice());
  });
};

export const onEnterSendResetPasswordEmail = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearErrorSlice());
  });
};

export const onEnterConfirmationCode = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearErrorSlice());
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onLeaveResetPassword = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearAccountEmailSlice());
  });
};

export const onCodeConfirmationLeave = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearAlertSlice());
  });
};

export const clearMfaEnrollment = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearMfaEnrollmentSlice());
  });
};

export const onSignUpLeave = (): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearAccountEmailSlice());
  });
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToLogin = () => ({ to: PATH_NAMES.login });
export const goToLogout = () => ({ to: PATH_NAMES.logout });

/*
 * export const goToSignUp = (): UpdateLocationActions => push('/' + PATH_NAMES.signUp);
 * export const goToChangePassword = (): UpdateLocationActions => push('/' + PATH_NAMES.changePassword);
 * export const goToProfile = (): UpdateLocationActions => push('/' + PATH_NAMES.profile);
 */
export const goToSendEmailResetPassword = () => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword });
export const goToResetPasswordConfirmCode = () => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.confirmResetPasswordCode });
export const goToResetPassword = (resetToken: string) => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword + '/$resetToken', params: { resetToken } });
//   push('/' + PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword + '/' + email);

export const goToAccountVerificationCode = () => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.verifyAccount });
export const goToMfaVerify = () => ({ to: PATH_NAMES.mfaVerify });
