import { ContactChangeTypeEnum } from '@shared/types';
import { getCountry } from '@shared/utils';

import i18n from '@/config/i18n';
import {
  COLLECTIONS, defaultUserPointerFields,
  DEFAULT_PAGINATION, Errors, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import { usersTabOptions } from '@/constants/_core/user.constants';
import { loadAuditLogs } from '@/redux/actions/_core/auditLog.action';
import { loadRolesDelegation, loadUserRoles } from '@/redux/actions/_core/role.action';
import { loadUserBlock } from '@/redux/actions/_core/userBlock.action';
import { loadUserSessions } from '@/redux/actions/_core/userSession.action';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import {
  loadCurrentUserSlice,
  loadCurrentUserImageSlice,
  setMessageSlice,
  getAppNotificationsSelector,
  setNotificationsSlice,
  setErrorSlice,
  setInfoMessageSlice,
} from '@/redux/reducers/_core/app.reducer';
import {
  clearRolesDelegationSlice, clearRolesSlice, clearUserRolesSlice,
} from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  clearUserCountSlice,
  clearUserSlice,
  clearUsersSlice,
  deleteUsersSlice,
  getUserUserSelector,
  getUserUsersSelector,
  loadUserSlice,
  loadUsersSlice,
  setUsersCountSlice,
  updateUsersByUserSlice,
  updateUsersByUsersSlice,
} from '@/redux/reducers/_core/user.reducer';
import { clearUserBlocksSlice } from '@/redux/reducers/_core/userBlock.reducer';
import { clearUserSessionsSlice } from '@/redux/reducers/_core/userSession.reducer';
import { AppDispatch, AppThunkAction } from '@/redux/store';
import { clearUserSuspensionInCloud } from '@/services/_core/statistics.service';
import {
  banUserInCloud,
  changeMemberContactInCloud,
  changeMemberCountryInCloud,
  deleteUserByIdInCloud,
  deleteUsersByIdsInCloud,
  destroyUsersInCloud,
  fetchCurrentAuthUserJson,
  fetchUsers,
  fetchUsersForExport,
  fetchUser,
  liftUserBanInCloud,
  resendMemberPhoneVerificationCodeInCloud,
  searchUserPointerQuery,
  sendMemberPasswordResetCodeInCloud,
  sendMessageToUserInCloud,
  toggleUsersSeenInCloud,
  updateCurrentUserProfile,
  updateCurrentUserProfileImage,
} from '@/services/_core/user.service';
import { fetchUserAuditTrail } from '@/services/_core/userBlock.service';
import {
  ExportFormat, IExportColumn, IQueriesInput, ITabSearchParams,
} from '@/types/_core/app.type';
import {
  ProfileUserInfoInput, IUser, SendMessageInput, IUserCloudInput,
  AccountHelpReasonInput, BanUserInput, ChangeMemberContactFormInput, ChangeMemberCountryFormInput,
} from '@/types/_core/user.type';
import {
  applySeenToItems, convertSearchParamsToFilters, isCurrentTab,
} from '@/utils/_core/app.utils';
import { getCountryName } from '@/utils/_core/country.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import {
  formatPhoneNumber, getFullPhoneNumber, getUserFullName, isUserFromBO,
} from '@/utils/_core/user.utils';


import { RootState } from '../../store';

export { searchUserPointerQuery };

const collection = '_User';

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * get current connected user from database
 * @returns
 */
export const getCurrentUser = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const currentUser = await fetchCurrentAuthUserJson();

    if (!currentUser) {
      dispatch(clearUserSlice());
      return;
    }

    dispatch(loadCurrentUserSlice(currentUser));
  });
};

const userExportColumns: IExportColumn<IUser>[] = [
  {
    header: i18n.t('user:fullName'),
    getValue: (user) => getUserFullName(user),
  },
  {
    // the email and nothing else: a phone member has none, and their number has its own column
    header: i18n.t('user:email'),
    getValue: (user) => user.email ?? '',
  },
  {
    header: i18n.t('user:contactPhone'),
    getValue: (user) => getFullPhoneNumber(user.phone),
  },
  {
    header: i18n.t('user:emailVerified'),
    getValue: (user) => (user.emailVerified
      ? i18n.t('common:yes')
      : i18n.t('common:no')),
  },
  {
    header: i18n.t('user:phoneVerified'),
    getValue: (user) => (user.phoneVerified
      ? i18n.t('common:yes')
      : i18n.t('common:no')),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (user) => displayDate(user.createdAt, false, true),
  },
];

export const loadUsers = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const params: IUserCloudInput = {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
    };

    const result = await fetchUsers(params);

    dispatch(loadUsersSlice(result.results));
    dispatch(setUsersCountSlice(result.count));
    rememberListQuery(loadUsersSlice, queries);
  });
};

/**
 * exports every user matching the current filters/search (not just the current page) as CSV/Excel
 * @NOTE only covers the standard users list — the audit-log and recycle-bin tabs of the Users
 * page are out of scope, see apps/bo/src/pages/_core/users/Users.tsx
 * @param queries current filters/search/order from the list (bypasses pagination, bounded by EXPORT_MAX_ROWS)
 * @param format
 */
export const exportUsers = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchUsersForExport(queries, EXPORT_MAX_ROWS);

    await exportRows(result.results, userExportColumns, 'users', format);

    if (result.count > EXPORT_MAX_ROWS) {
      dispatch(setInfoMessageSlice(
        i18n.t('common:exportTruncatedWarning', { max: EXPORT_MAX_ROWS, total: result.count })
      ));
    }
  },
  // rights
  {
    collection,
    action: 'find',
  });
};


export const uploadCurrentUserProfileImage = (file: File): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);

    const image = await updateCurrentUserProfileImage({ file, folder: 'user', locale });

    // nothing came back from the upload: the picture already on the account is what still stands
    if (!image) return;

    dispatch(loadCurrentUserImageSlice(image));
  });
};

/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deleteUserById = (id: string, redirectToRecycleBin = false): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void | undefined> => {
    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const updatedUser = await deleteUserByIdInCloud(id);

    if (redirectToRecycleBin) {
    // dispatch(goToRecycleBin(RECYCLE_BIN_TAB_PATHNAMES.users));
      return;
    }

    dispatch(deleteUsersSlice(updatedUser.id));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

export const deleteUsersById = (ids: string[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const updatedUsers = await deleteUsersByIdsInCloud(ids);

    dispatch(updateUsersByUsersSlice(updatedUsers));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

/**
 * this will delete the data from database
 * be careful when using it,
 * only the highest level (ex: Admin) can do this
 * @param ids
 * @returns
 */
export const destroyUsers = (ids: string[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const error = await destroyUsersInCloud(ids);

    if (error?.code === 206) {
      throw new Error(i18n.t('user:errors.insufficientAuth'));
    }

    // display success message
    dispatch(
      setMessageSlice(
        i18n.t('common:infoMessages.successfullyDeletedFromDatabase', {
          count: ids.length,
          value: i18n.t('user:users'),
        })
      )
    );

    // reload the list of deleted requests
    const params = { filters: { deleted: true } };

    dispatch(loadUsers(params as any));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

export const banUserById = (userId: string, values: BanUserInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedUser = await banUserInCloud(userId, values);

    dispatch(updateUsersByUserSlice(updatedUser));
    dispatch(setMessageSlice(i18n.t('user:messages.banSuccess')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

export const liftUserBanById = (userId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedUser = await liftUserBanInCloud(userId);

    dispatch(updateUsersByUserSlice(updatedUser));
    dispatch(setMessageSlice(i18n.t('user:messages.liftUserBanSuccess')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

/**
 * Ends an automatic suspension a policy put on the account, from its own record. The fine that came
 * with it is kept: lifting it from the record is a decision on the suspension, not on the penalty —
 * the cancellations page is where both are written off together.
 * @param user the account on screen, updated in place once the suspension is gone
 */
export const clearUserPolicySuspension = (user: IUser): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await clearUserSuspensionInCloud(user.id, false);

    dispatch(loadUserSlice({ ...user, isSuspendedUntil: undefined }));
    dispatch(setMessageSlice(i18n.t('user:detail.suspension.lifted')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

/**
 * mark user notification as seen or not seen
 *
 * Serves both surfaces at once: the account currently open on its detail page, and the rows of
 * the list behind it. Which of the two is on screen is not something this has to decide — it
 * updates whichever the store actually holds, and does nothing for the other.
 *
 * The badge count is the figure the server recomputed after the write rather than one adjusted
 * here. It is also stored under the collection name, which is the key the sidebar and the bell
 * both read; the plain `user` key it used before matched neither, so nothing this action did ever
 * reached a badge.
 *
 * @param ids the accounts to flip
 * @param value true to mark them seen, false to put them back in the queue
 * @param isUnseenTab whether the list on screen is the "Nouveautés" tab, which a seen account
 *   no longer belongs to
 * @returns
 */
export const toggleUsersNotification = (
  ids: string[],
  value = true,
  isUnseenTab = false
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const storedUsers = getUserUsersSelector(state) || [];
    const storedUser = getUserUserSelector(state);

    const { toggledIds, count } = await toggleUsersSeenInCloud(ids, value);

    // update notification count — in sidebar
    dispatch(setNotificationsSlice({ [COLLECTIONS.user]: count }));

    // preview page — only when the account being viewed is one of the ones that changed
    if (storedUser?.id && toggledIds.includes(storedUser.id)) {
      dispatch(loadUserSlice({ ...storedUser, seen: value }));
    }

    if (storedUsers.length === 0) return;

    // list page
    dispatch(loadUsersSlice(applySeenToItems<IUser>(storedUsers, toggledIds, value, isUnseenTab)));
  });
};

export const updateProfileUserInfo = (values: ProfileUserInfoInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedUser = await updateCurrentUserProfile(values);

    if (!updatedUser) return;

    dispatch(loadCurrentUserSlice(updatedUser));
    dispatch(setMessageSlice(i18n.t('user:profileInfoUpdatedSuccess')));
  });
};

export const sendMessageToUser = (user: IUser, values: SendMessageInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const isSent = await sendMessageToUserInCloud(values);
    const name = getUserFullName(user);

    if (!isSent) {
      dispatch(setErrorSlice(i18n.t(`user:sendMessage.notSentBy.${values.channel}`, { name })));
      return;
    }

    dispatch(setMessageSlice(i18n.t(`user:sendMessage.sentBy.${values.channel}`, { name })));
  });
};

/*
 * ----------------------------------------------------- //
 * -------- helping a member back into their account ----- //
 * ----------------------------------------------------- //
 * Each one is an edit of someone else's account, so it asks for the right to update users, and
 * leaves a line in the member's history: the history block is read again so that line shows.
 */
const accountHelpRights = {
  collection,
  action: 'update',
  hasNoRightErrorMessage: i18n.t('user:errors.canNotUpdateUser'),
} as const;

/** Whether the text or the email went out is the whole result: an answer the operator must be told. */
const reportDelivery = (dispatch: AppDispatch, user: IUser, isSent: boolean, key: string): void => {
  const name = getUserFullName(user);

  if (isSent) {
    dispatch(setMessageSlice(i18n.t(`user:detail.accountHelp.messages.${key}Sent`, { name })));
    return;
  }

  dispatch(setErrorSlice(i18n.t(`user:detail.accountHelp.messages.${key}NotSent`, { name })));
};

/** A new sign-up code, by SMS, to the number the member has not confirmed yet. */
export const resendMemberPhoneVerificationCode = (user: IUser, values: AccountHelpReasonInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const isSent = await resendMemberPhoneVerificationCodeInCloud({
      userId: user.id,
      reason: values.reason,
      locale: getSettingsLocaleSelector(getState?.()!),
    });

    reportDelivery(dispatch, user, isSent, 'code');
    dispatch(loadUserBlock('auditTrail', user.id, fetchUserAuditTrail));
  }, accountHelpRights);
};

/** The usual "forgot my password" code, sent to the member by the team. */
export const sendMemberPasswordResetCode = (user: IUser, values: AccountHelpReasonInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const isSent = await sendMemberPasswordResetCodeInCloud({
      userId: user.id,
      reason: values.reason,
      locale: getSettingsLocaleSelector(getState?.()!),
    });

    reportDelivery(dispatch, user, isSent, 'reset');
    dispatch(loadUserBlock('auditTrail', user.id, fetchUserAuditTrail));
  }, accountHelpRights);
};

/**
 * A new phone number or email for the member, once their identity was checked. The account on screen
 * is read again (the contact it shows, the verified marks), and so are the devices signed in — the
 * server signed every one of them out — and the history.
 */
export const changeMemberContact = (user: IUser, values: ChangeMemberContactFormInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const isPhone = values.type === ContactChangeTypeEnum.PHONE;

    await changeMemberContactInCloud({
      userId: user.id,
      reason: values.reason,
      locale: getSettingsLocaleSelector(getState?.()!),
      type: values.type,
      ...(isPhone
        ? { phone: { code: getCountry(user.country).dialCode.replace('+', ''), number: formatPhoneNumber(values.phone ?? '') } }
        : { email: values.email }),
    });

    const updatedUser = await fetchUser(user.id, defaultUserPointerFields);

    if (updatedUser) dispatch(loadUserSlice(updatedUser));

    dispatch(loadUserSessions(user.id));
    dispatch(loadUserBlock('auditTrail', user.id, fetchUserAuditTrail));
    dispatch(setMessageSlice(i18n.t('user:detail.accountHelp.messages.contactChanged', {
      name: getUserFullName(updatedUser ?? user),
    })));
  }, accountHelpRights);
};

/**
 * Moves a member's account to another country, with the reason support gives. The page reads the
 * account again (the country it shows) and the history, which now holds the move.
 */
export const changeMemberCountry = (user: IUser, values: ChangeMemberCountryFormInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    await changeMemberCountryInCloud({
      userId: user.id,
      reason: values.reason,
      locale: getSettingsLocaleSelector(getState?.()!),
      country: values.country,
    });

    const updatedUser = await fetchUser(user.id, defaultUserPointerFields);

    if (updatedUser) dispatch(loadUserSlice(updatedUser));

    dispatch(loadUserBlock('auditTrail', user.id, fetchUserAuditTrail));
    dispatch(setMessageSlice(i18n.t('user:detail.accountHelp.messages.countryChanged', {
      name: getUserFullName(updatedUser ?? user),
      country: getCountryName(values.country),
    })));
  }, accountHelpRights);
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onUserLeave = (): AppThunkAction => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearUserRolesSlice());
    dispatch(clearRolesSlice());
    dispatch(clearRolesDelegationSlice());
    // the lists read for this account must not show, even for a render, on the next one opened
    dispatch(clearUserBlocksSlice());
  };
};


/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onUsersEnter = (route: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    /*
     * TODO: should have admin-only list page
     * if (params.location.search?.from === PlatformEnum.BO) {
     * filters.fromBO = true;
     *   filters.roles = [capitalizeFirstLetter(params.location.search.role)];
     * }
     */

    // in "All" tab, we fetch all users other than users from BO (admins)
    if (route.search.tab === undefined) {
      values.filters = {
        ...filters,
        fromBO: false,
      };
    }
    else {
      const newFilters = convertSearchParamsToFilters({
        tabs: usersTabOptions,
        searchParams: route.search,
        filters,
        acceptedFields: ['deleted'],
      });

      values.filters = newFilters;

      if (newFilters.auditLog || isCurrentTab(route.search.tab)) {
        dispatch(loadAuditLogs(values));
        return;
      }
    }

    dispatch(clearListUnlessLoadedWith(loadUsersSlice, values, [clearUsersSlice(), clearUserCountSlice()]));
    dispatch(loadUsers(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onUserEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const notification = getAppNotificationsSelector(state);
    const count = notification?.user ?? 0;

    if (!route.params?.id) return;

    dispatch(clearUserBlocksSlice());
    dispatch(clearUserSessionsSlice());

    const user = await fetchUser(route.params?.id, defaultUserPointerFields);

    if (!user) {
      throw new Error(Errors.notFound);
    }

    if (count > 0) {
      dispatch(setNotificationsSlice({ user: count - 1 })); // from sidebar
    }

    /*
     * only an account created from the back-office holds roles. They are read in the background:
     * the page is drawn once the account is in, the roles block shows its own placeholder, and
     * both thunks report their own errors rather than rejecting
     */
    if (isUserFromBO(user)) {
      dispatch(loadUserRoles(user.id));
      // the options of the "add a role" dialog, and what the signed-in account may do with them
      dispatch(loadRolesDelegation(user.id));
    }

    // the devices signed in to the account, read in the background too — a closed account has none
    if (!user.deleted) dispatch(loadUserSessions(user.id));

    dispatch(loadUserSlice(user));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToUsers: any = (search?: ITabSearchParams) => ({ to: PATH_NAMES.users, search });
export const goToUser: any = (id: string) => ({ to: PATH_NAMES.users + '/$id', params: { id } });
