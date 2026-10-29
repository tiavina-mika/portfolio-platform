import Button from '@mui/material/Button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { createElement, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';


import { COLLECTIONS } from '@/constants/_core/app.constants';
import { getAppNotificationsSelector } from '@/redux/reducers/_core/app.reducer';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { canAccessTo } from '@/utils/_core/role.utils';

const CONTACT_MESSAGE_ALERT_KEY = 'contactMessageAlert';

/**
 * Tells the agent a member wrote on a request while they are on another page. The `Contact` badge
 * already counts every ticket with something new to read (`unreadByAdmin`, raised again by each
 * member reply), and it is polled rather than pushed, so the alert is derived from it: a count
 * that goes up between two refreshes means new activity. The first value read after the shell
 * mounts is the baseline, never an alert — it is the backlog, not something that just arrived.
 */
export const useContactMessageAlert = (): void => {
  const { t } = useTranslation(['user']);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const notifications = useSelector(getAppNotificationsSelector);
  const canReadContacts = canAccessTo(roles, COLLECTIONS.contact);
  const count = notifications[COLLECTIONS.contact];
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // the inbox already shows the new activity: an alert there would only point at the page itself
  const isOnInbox = pathname.startsWith(PATH_NAMES.contacts);
  const previousCountRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!canReadContacts || count === undefined) return;

    const previousCount = previousCountRef.current;

    previousCountRef.current = count;

    if (isOnInbox || previousCount === undefined || count <= previousCount) return;

    enqueueSnackbar(t('user:contacts.newActivityAlert', { count: count - previousCount }), {
      key: CONTACT_MESSAGE_ALERT_KEY,
      variant: 'info',
      preventDuplicate: true,
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      action: () => createElement(
        Button,
        {
          color: 'inherit',
          size: 'small',
          onClick: () => {
            closeSnackbar(CONTACT_MESSAGE_ALERT_KEY);
            navigate({ to: PATH_NAMES.contacts } as any);
          },
        },
        t('user:contacts.openInbox')
      ),
    });
  }, [count, canReadContacts, isOnInbox, enqueueSnackbar, closeSnackbar, navigate, t]);
};
