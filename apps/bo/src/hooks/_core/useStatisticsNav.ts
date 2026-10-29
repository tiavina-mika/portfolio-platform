import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { goToStatisticsView } from '@/redux/actions/_core/statistics.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { IStatisticsNavItem, StatisticsPeriod, StatisticsViewEnum } from '@/types/_core/statistics.type';
import { getRights } from '@/utils/_core/role.utils';
import { getStatisticsViews } from '@/utils/_core/statistics.utils';

type StatisticsNav = {
  navItems: IStatisticsNavItem[];
  onNavigate: (view: StatisticsViewEnum) => void;
};

/**
 * Page-controller hook shared by the seven statistics routes: the views the signed-in role may open,
 * and the move from one to another. The period goes along with the move — a reader comparing the
 * users and the rides of the last thirty days keeps reading thirty days.
 */
export const useStatisticsNav = (period?: StatisticsPeriod, isComparing?: boolean): StatisticsNav => {
  const { t } = useTranslation(['statistics', 'user', 'project']);
  const navigate = useNavigate();
  const roles = useSelector(getRoleCurrentUserRolesSelector);

  const navItems = useMemo(() => (
    getStatisticsViews()
      .filter((entry) => {
        const className = 'className' in entry ? entry.className : undefined;
        const uiRight = 'uiRight' in entry ? entry.uiRight : undefined;

        return getRights(roles, className, uiRight).canFind;
      })
      .map((entry) => ({ view: entry.view, label: t(entry.labelKey) }))
  ), [roles, t]);

  const handleNavigate = (view: StatisticsViewEnum): void => {
    navigate(goToStatisticsView(view, period, isComparing));
  };

  return { navItems, onNavigate: handleNavigate };
};
