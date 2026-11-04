import { useNavigate } from '@tanstack/react-router';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';

import {
  IS_SESSION_INACTIVITY_TIMEOUT_DISABLED, SESSION_INACTIVITY_WARNING_MS,
} from '@/constants/_core/auth.constants';
import { goToLogout } from '@/redux/actions/_core/auth.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsIsAuthenticatedSelector } from '@/redux/reducers/_core/settings.reducer';
import { getSessionInactivityTimeoutMs } from '@/utils/_core/role.utils';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
const CHECK_INTERVAL_MS = 1000;

type Props = {
  isWarningVisible: boolean;
  remainingSeconds: number;
  stayLoggedIn: () => void;
};

/**
 * auto-logout after a period of no mouse/keyboard/touch activity, showing a warning
 * SESSION_INACTIVITY_WARNING_MS before the actual logout. The timeout itself comes from the
 * roles the current user holds — a role can define its own, otherwise the back-office default
 * applies (see getSessionInactivityTimeoutMs)
 */
export const useInactivityLogout = (): Props => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(getSettingsIsAuthenticatedSelector);
  const currentUserRoles = useSelector(getRoleCurrentUserRolesSelector);
  const timeoutMs = getSessionInactivityTimeoutMs(currentUserRoles);

  const lastActivityRef = useRef(Date.now());
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_INACTIVITY_WARNING_MS / 1000);

  const stayLoggedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningVisible(false);
  }, []);

  useEffect(() => {
    // bail out before the listeners and the interval, not only around the logout itself
    if (!isAuthenticated || IS_SESSION_INACTIVITY_TIMEOUT_DISABLED) return undefined;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMs - elapsed;

      if (remaining <= 0) {
        setIsWarningVisible(false);
        navigate(goToLogout());
        return;
      }

      if (remaining <= SESSION_INACTIVITY_WARNING_MS) {
        setIsWarningVisible(true);
        setRemainingSeconds(Math.ceil(remaining / 1000));
      }
      else {
        setIsWarningVisible(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, navigate, timeoutMs]);

  return {
    isWarningVisible, remainingSeconds, stayLoggedIn,
  };
};
