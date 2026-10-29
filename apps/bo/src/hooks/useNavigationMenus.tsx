import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'string-ts';

import {
  BarChartIcon,
  BellIcon,
  BriefcaseIcon,
  CodeIcon,
  ColumnsIcon,
  CreditCardIcon,
  DashboardIcon,
  FlagIcon,
  FolderIcon,
  LayoutIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  ReceiptIcon,
  ServerIcon,
  SettingsIcon,
  UserIcon,
} from '@/components/icons/SidebarIcons';
import { COLLECTIONS } from '@/constants/_core/app.constants';
import { goToHome, goToMisc, goToSettings } from '@/redux/actions/_core/app.action';
import { goToArticles } from '@/redux/actions/_core/article.action';
import { goToCategories } from '@/redux/actions/_core/category.action';
import { goToFinanceOverview } from '@/redux/actions/_core/finance.action';
import { goToNotificationBroadcast } from '@/redux/actions/_core/notification.action';
import { goToPages } from '@/redux/actions/_core/page.action';
import { goToRoles } from '@/redux/actions/_core/role.action';
import { goToStatisticsOverview } from '@/redux/actions/_core/statistics.action';
import { goToUsers } from '@/redux/actions/_core/user.action';
import { goToList } from '@/redux/actions/_core/util.action';
import { goToProjects } from '@/redux/actions/_domain/project.action';
import { ISidebarMenu } from '@/types/_core/navigation.type';
import { UIRoleEnum } from '@/types/_core/role.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

// matches `.nav-link .icon{width:18px;height:18px}` in the design reference
const ICON_SIZE = 18;

/**
 * sidebar navigation structure — single source of truth shared by `SideBar` (renders the menu)
 * and the AppBar breadcrumb (resolves which group the current route belongs to), so the two
 * never drift apart (see `naming-conventions.md` / DRY).
 */
export const useNavigationMenus = (): ISidebarMenu[] => {
  const { t } = useTranslation(['common', 'route', 'user', 'statistics', 'finance', 'project']);
  const navigate = useNavigate();

  return useMemo(() => [
    {
      title: t('common:sidebar.operations'),
      subMenus: [
        {
          id: 'home',
          label: t('common:dashboard'),
          onClick: () => navigate(goToHome()),
          icon: <DashboardIcon size={ICON_SIZE} />,
          alwaysVisible: true,
        },
        {
          id: PATH_NAMES.projects,
          label: t('project:project.projects'),
          onClick: () => navigate(goToProjects()),
          icon: <CodeIcon size={ICON_SIZE} />,
          className: COLLECTIONS.project,
          hasRightName: 'canFind',
        },
      ],
    },
    {
      title: t('common:sidebar.community'),
      subMenus: [
        {
          id: PATH_NAMES.users,
          label: t('user:users'),
          onClick: () => navigate(goToUsers()),
          icon: <UserIcon size={ICON_SIZE} />,
          className: COLLECTIONS.user,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.contacts,
          label: t('user:contacts.contacts'),
          onClick: () => navigate(goToList('contacts')),
          icon: <MessageCircleIcon size={ICON_SIZE} />,
          className: COLLECTIONS.contact,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.reports,
          label: t('user:reports.reports'),
          onClick: () => navigate(goToList('reports')),
          icon: <FlagIcon size={ICON_SIZE} />,
          className: COLLECTIONS.report,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.notifications,
          label: t('user:notifications.notifications'),
          onClick: () => navigate(goToList('notifications')),
          icon: <BellIcon size={ICON_SIZE} />,
          className: COLLECTIONS.notification,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.broadcast,
          label: t('user:notifications.broadcast.broadcast'),
          onClick: () => navigate(goToNotificationBroadcast() as any),
          icon: <MegaphoneIcon size={ICON_SIZE} />,
          /*
           * gated on the dedicated right rather than on a right over notifications: every domain
           * writes notifications, while writing to the whole membership at once is a decision a
           * handful of people should be able to take (the server checks it again)
           */
          uiRight: UIRoleEnum.BROADCAST,
        },
        {
          id: PATH_NAMES.payments,
          label: t('user:payments.payments'),
          onClick: () => navigate(goToList('payments')),
          icon: <CreditCardIcon size={ICON_SIZE} />,
          className: COLLECTIONS.payment,
          hasRightName: 'canFind',
        },
      ],
    },
    {
      title: t('common:sidebar.analytics'),
      subMenus: [
        {
          id: PATH_NAMES.statistics.root,
          label: t('common:statistics'),
          onClick: () => navigate(goToStatisticsOverview()),
          icon: <BarChartIcon size={ICON_SIZE} />,
          uiRight: UIRoleEnum.STATISTICS,
          hasRightName: 'canFind',
          /*
           * one entry for the whole section: the views (overview, users, rides…) are switched from
           * the navigation inside the statistics page itself, and every one of them sits under this
           * entry's address segment, so it stays highlighted whichever view is open
           */
        },
      ],
    },
    {
      title: t('common:sidebar.finance'),
      subMenus: [
        {
          id: PATH_NAMES.finance.root,
          label: t('common:finance'),
          onClick: () => navigate(goToFinanceOverview()),
          icon: <ReceiptIcon size={ICON_SIZE} />,
          uiRight: UIRoleEnum.FINANCE,
          hasRightName: 'canFind',
        },
      ],
    },
    {
      title: t('common:sidebar.content'),
      subMenus: [
        {
          id: PATH_NAMES.articles,
          label: t('cms:articles'),
          onClick: () => navigate(goToArticles()),
          icon: <FolderIcon size={ICON_SIZE} />,
          className: COLLECTIONS.article,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.pages,
          label: t('cms:pages'),
          onClick: () => navigate(goToPages()),
          icon: <LayoutIcon size={ICON_SIZE} />,
          className: COLLECTIONS.page,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.categories,
          label: t('cms:category.categories'),
          onClick: () => navigate(goToCategories()),
          icon: <ColumnsIcon size={ICON_SIZE} />,
          className: COLLECTIONS.category,
          hasRightName: 'canFind',
        },
      ],
    },
    {
      title: t('common:sidebar.admin'),
      subMenus: [
        {
          id: PATH_NAMES.roles,
          label: t('user:role.roles'),
          onClick: () => navigate(goToRoles() as any),
          icon: <BriefcaseIcon size={ICON_SIZE} />,
          className: COLLECTIONS.role,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.settings,
          label: t('common:settings'),
          onClick: () => navigate(goToSettings()),
          icon: <SettingsIcon size={ICON_SIZE} />,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.miscellaneous,
          label: capitalize(t('route:miscellaneous')),
          onClick: () => navigate(goToMisc()),
          icon: <ServerIcon size={ICON_SIZE} />,
          // shown if the role has access to at least one of the "Divers" page tabs
          uiRight: [UIRoleEnum.MIGRATIONS, UIRoleEnum.CRON, UIRoleEnum.TESTS],
          hasRightName: 'canFind',
        },
      ],
    },


  ], [t, navigate]);
};
