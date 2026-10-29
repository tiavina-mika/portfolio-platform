import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/redux/store';


import { ROLES_REFRESH_MIN_INTERVAL_MS } from '@/constants/_core/auth.constants';
import { refreshCurrentUserRoles } from '@/redux/actions/_core/util.action';
import { shouldRefreshRoles } from '@/utils/_core/role.utils';

/**
 * re-reads the roles of the signed-in account when the tab becomes visible again, at most once per
 * interval: an administrator whose post was removed while the tab stayed open would otherwise keep
 * its menus, its buttons and its inactivity delay until a manual reload
 */
export const useRefreshRolesOnFocus = (): void => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let lastRefreshAt = Date.now();

    const refreshWhenVisible = (): void => {
      if (!shouldRefreshRoles(
        document.visibilityState, lastRefreshAt, Date.now(), ROLES_REFRESH_MIN_INTERVAL_MS
      )) {
        return;
      }


      lastRefreshAt = Date.now();
      dispatch(refreshCurrentUserRoles());
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [dispatch]);
};
