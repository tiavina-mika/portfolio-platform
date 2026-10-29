import Parse from 'parse';

import i18n from '@/config/i18n';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import {
  setErrorSlice,
  loadCurrentUserSlice,
  setMessageSlice,
  clearErrorSlice,
  getAppAccountEmailSelector,
  setAccountEmailSlice,
  clearAccountEmailSlice,
  setAlertSlice,
  clearAlertSlice,
  getAppCurrentUserSelector,
  clearCurrentUserSlice,
} from '@/redux/reducers/app.reducer';
import { getSettingsLocaleSelector, toggleIsAuthenticatedSlice } from '@/redux/reducers/settings.reducer';
import { setUserLoadingSlice, clearUsersSlice } from '@/redux/reducers/user.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import { INavigate } from '@/types/app.type';
import {
  IChangePasswordInput, ILoginInput, ResetPasswordInput, ISignUpInput,
} from '@/types/auth.type';
import { IPlatformType, IUser, PlatformEnum } from '@/types/user.type';
import { DISABLE_USER_ACCOUNT_CONFIRMATION, Errors } from '@/utils/constants';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { clearUserIntoLocalStorage, retrieveUserFromLocalStorage, updateUserIntoLocalStorage } from '@/utils/user.utils';

// NOTE: platform is just used temporary for the user creation, it will be unset in after save trigger
export const SIGNUP_PROPERTIES = new Set([
  'firstName',
  'lastName',
  'email',
  'password',
  'username',
  'platform',
]);

export const logout = (): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await Parse.User.logOut();
    // clear local storage
    clearUserIntoLocalStorage();

    // clear store
    dispatch(toggleIsAuthenticatedSlice(false));
    dispatch(clearUsersSlice());
    dispatch(clearCurrentUserSlice());

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
  fromBO?: boolean;
}

/**
 * create user account
 * @param values
 * @returns
 */
export const signUp = (values: ISignUpInput, navigate: INavigate): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.();

    if ((state as any)?.app.error) {
      dispatch(clearErrorSlice());
    }

    const newValues: ISignUp = { ...values, username: values.email, platform: PlatformEnum.BO, fromBO: true };

    delete newValues.passwordConfirmation; // passwordConfirmation should not be saved to db

    // create the new user with corresponding fields
    const user = new Parse.User();

    setValues(user, newValues, SIGNUP_PROPERTIES);

    try {
      const newUser = await user.signUp();

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
        await navigate(logout());

        // eslint-disable-next-line no-use-before-define
        navigate(goToLogin());
        return;
      }

      /*
       * instead of redirecting to the login page,
       * redirect to the email confirmation page.
       * And pass the email to the the ConfirmEmail Page Component
       */
      await Parse.User.logOut();

      if (newUser.get('verified')) {
        // eslint-disable-next-line no-use-before-define
        navigate(goToLogin());
        return;
      }


      // eslint-disable-next-line no-use-before-define
      navigate(goToAccountVerificationCode());
    }
    catch (error) {
      let errorMessage = i18n.t('common:errors.somethingWentWrong');

      const {
        code,
      } = error as any;

      if (code === 202) {
        errorMessage = i18n.t('user:errors.usernameTaken');
      }
      else if (code === 142) {
        errorMessage = (error as any).message;
      }

      throw new Error(errorMessage);
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * check connected user
 * @returns {function(*=, *=): Promise<void>}
 */
export const loginSuccess = (redirectToHome?: boolean, navigate?: INavigate): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    // current user from parse or from store (not persisted)
    const currentUser = (await Parse.User.currentAsync()) ?? getAppCurrentUserSelector(state);

    dispatch(clearAccountEmailSlice());

    /*
     * ------------------------------------------//
     * ------------- login success --------------//
     * ------------------------------------------//
     */
    if ((currentUser)?.getSessionToken()) {
    // it may be a parse type (so need to transform it to json)
      dispatch(loadCurrentUserSlice(currentUser));
      dispatch(toggleIsAuthenticatedSlice(true));

      // update user into localStorage
      updateUserIntoLocalStorage(currentUser as IUser);

      // navigate is only available in a component (from hooks)
      if (redirectToHome && navigate) {
      // redirection after login
        navigate({ to: PATH_NAMES.home } as any);
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
    navigate({ to: PATH_NAMES.login } as any);
  });
};

/**
 * login with email and password
 * @param values
 * @returns
 */
export const login = (values: ILoginInput, navigate: INavigate): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.();

    if ((state as any)?.app.error) {
      dispatch(clearErrorSlice());
    }

    try {
      await Parse.User.logIn(values.email, values.password);

      dispatch(loginSuccess(true, navigate)); // redirect
    }
    catch (error) {
      console.log('login error: ', error);
      if (!DISABLE_USER_ACCOUNT_CONFIRMATION) {
        /*
         * if the user account is not verified yet
         * the confirmation code is send automatically in the beforeLogin trigger
         */
        if ((error as any).code === 141) {
          dispatch(setErrorSlice(i18n.t('user:errors.userNotVerified')));

          // eslint-disable-next-line no-use-before-define
          navigate(goToAccountVerificationCode());
          dispatch(setAccountEmailSlice(values.email));
        }
      }
      // invalid username / email error
      if ((error as any).code === 101) {
        dispatch(setErrorSlice(i18n.t('user:errors.invalidUsername')));
      }
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * check if user is logged in and if a session is valid
 * this should be used
 * @returns
 */
export const checkSession = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch) => {
    let currentUser;

    /*
     * retrieve store user from local storage
     * it should be before await Parse.User.currentAsync()
     */
    const userFromLocalStorage = retrieveUserFromLocalStorage();

    try {
      currentUser = await Parse.User.currentAsync(); // it can throw (rarely)
      if (currentUser) {
      // is the session valid ? (some issues might happen)
        try {
          await Parse.Session.current();
        }
        catch (error) {
          console.log(
            'Error retrieving the session object => 400 but, in fact, invalid token => logout',
            error
          );
          currentUser = null;

          throw new Error('Bad session');
        }
      }
    }
    catch (error) {
      const isInvalidSession = (error as any).message === 'Bad session';

      if (isInvalidSession) {
        /*
         * ---- bad session ----//
         * clean up user into localStorage
         */
        clearUserIntoLocalStorage();
        dispatch(toggleIsAuthenticatedSlice(false));
        dispatch(setErrorSlice(i18n.t('common:errors.badSession')));
      }

      if ((currentUser && !currentUser.equals(userFromLocalStorage as any)) || isInvalidSession) {
        try {
          await Parse.User.logOut();
        }
        catch (err2) {
          console.log('err2: ', err2);
          // might happen, but swallowed
        }
      }
    }

    if (currentUser) {
      await dispatch(loginSuccess()); // no redirection if successful
    }
    else {
      /*
       * redirect to login if in dashboard
       * remain in the same page if in auth pages (login, signUp, ...)
       */
      await dispatch(logout());
    }
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * change password
 * @param values
 * @returns
 */
export const changePassword = (values: IChangePasswordInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const user = await Parse.User.currentAsync();

    if (!user) {
      dispatch(setErrorSlice(i18n.t('user:errors.noUserFound')));
      return;
    }

    user.set('password', values.newPassword);
    const updatedUser = await user.save();

    if (!updatedUser) return;

    dispatch(setMessageSlice(i18n.t('user:passwordWordChangedSuccess')));
  }, { localLoadingAction: setUserLoadingSlice });
};

/**
 * delete the current user account
 * @returns
 */
export const deleteAccount = (): any => {
  return actionWithLoader((): any => {
    console.log('delete account');
  }, { localLoadingAction: setUserLoadingSlice });
};

export const verifyCodeSentByEmail = (code: string, navigate: INavigate): any => {
  return actionWithLoader(async (_: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const result = await Parse.Cloud.run('verifyAccountEmail', { code, type: 'resetPassword', locale });


    // eslint-disable-next-line no-use-before-define
    navigate(goToResetPassword(result.email));
  });
};

export const verifyAccountEmail = (code: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState) => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);

    await Parse.Cloud.run('verifyAccountEmail', { code, type: 'accountVerification', locale });

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

    await Parse.Cloud.run('sendVerificationCode', { email, locale });

    dispatch(setMessageSlice(i18n.t('user:emailWithCodeSent')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const sendResetPasswordVerificationCode = (email: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const sent = await Parse.Cloud.run('sendResetPasswordVerificationCode', { email, locale });

    if (!sent) {
      throw new Error(i18n.t('user:errors.emailNotSent'));
    }
    dispatch(setMessageSlice(i18n.t('user:emailWithCodeSent')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const resetPassword = (values: ResetPasswordInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const accountEmail = getAppAccountEmailSelector(state);

    await Parse.Cloud.run('resetPassword', { email: accountEmail, password: values.newPassword });

    dispatch(
      setAlertSlice({
        severity: 'success',
        duration: 'permanent',
        title: i18n.t('user:messages.passwordResetSuccess'),
      })
    );
  }, { localLoadingAction: setUserLoadingSlice });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onEnterResetPassword = ({
  params,
}: any): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const isUserExists = await Parse.Cloud.run('isUserExistsByEmail', { encryptedEmail: params.email, locale });

    if (!isUserExists) {
      throw new Error(i18n.t('user:errors.userNotFound'));
    }

    dispatch(setAccountEmailSlice(params.email));
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
export const goToLogin = (): any => ({ to: PATH_NAMES.login });
export const goToLogout = (): any => ({ to: PATH_NAMES.logout });

/*
 * export const goToSignUp = (): UpdateLocationActions => push('/' + PATH_NAMES.signUp);
 * export const goToChangePassword = (): UpdateLocationActions => push('/' + PATH_NAMES.changePassword);
 * export const goToProfile = (): UpdateLocationActions => push('/' + PATH_NAMES.profile);
 */
export const goToSendEmailResetPassword = (): any => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword });
export const goToResetPasswordConfirmCode = (): any => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.confirmResetPasswordCode });
export const goToResetPassword = (email: string): any => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword + '/$email', params: { email } });
//   push('/' + PATH_NAMES.account.root + '/' + PATH_NAMES.account.resetPassword + '/' + email);

export const goToAccountVerificationCode = (): any => ({ to: PATH_NAMES.account.root + '/' + PATH_NAMES.account.verifyAccount });
