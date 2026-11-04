import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import DashboardShellSkeleton from '@/containers/_core/layout/DashboardShellSkeleton';
import {
  getSettingsIsSideBarOpenSelector, getSettingsSidebarStyleSelector, getSettingsThemeColorSelector,
  getSettingsThemeSelector,
} from '@/redux/reducers/_core/settings.reducer';
import { getSidebarTokens } from '@/utils/_core/theme/tokens.utils';

/**
 * what the dashboard layout route shows while its guard is still loading the admin: the shell
 * placeholder in the admin's own sidebar style and theme, which are persisted settings and so
 * already known on a cold start
 */
const DashboardPending = () => {
  const isSideBarOpen = useSelector(getSettingsIsSideBarOpenSelector);
  const themeMode = useSelector(getSettingsThemeSelector);
  const themeColor = useSelector(getSettingsThemeColorSelector);
  const sidebarStyle = useSelector(getSettingsSidebarStyleSelector);
  const tokens = useMemo(
    () => getSidebarTokens(themeMode, sidebarStyle, themeColor),
    [themeMode, sidebarStyle, themeColor]
  );

  return <DashboardShellSkeleton isSideBarOpen={isSideBarOpen} tokens={tokens} />;
};

export default DashboardPending;
