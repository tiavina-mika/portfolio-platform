import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { onFinanceOverviewEnter } from '@/redux/actions/_core/finance.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { periodRouteSearchParams } from '@/validations/_core/app.validations';

const FinanceOverview = lazy(() => import('@/pages/_core/finance/FinanceOverview'));

export const financeLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.finance.root,
  staticData: { breadcrumb: { labelKey: 'common:finance' } },
});

export const financeOverviewRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  getParentRoute: () => financeLayout,
  beforeLoad: onEnter(onFinanceOverviewEnter),
  component: FinanceOverview,
  path: '/',
});

const financeRoutes = [financeOverviewRoute];

export default financeRoutes;
