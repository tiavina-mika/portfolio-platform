import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useNavigationMenus } from '@/hooks/useNavigationMenus';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { IDashboardLink } from '@/types/_core/dashboard.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { canOpenMenuItem } from '@/utils/_core/role.utils';

/**
 * The pages an account whose post gives no dashboard data can open instead: its own profile, then
 * every sidebar entry its roles allow — the same answer as the sidebar, so the two never disagree.
 */
export const useDashboardNoAccessLinks = (): IDashboardLink[] => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const menus = useNavigationMenus();

  return useMemo(() => [
    { id: 'profile', label: t('common:myProfile'), onClick: () => navigate({ to: PATH_NAMES.profile }) },
    ...menus
      .flatMap((menu) => menu.subMenus)
      // the dashboard is the page the account is already on
      .filter((subMenu) => !subMenu.alwaysVisible && canOpenMenuItem(roles, subMenu))
      .map(({ id, label, onClick }) => ({ id, label, onClick })),
  ], [menus, roles, navigate, t]);
};
