import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import {
  loadCancellationStatistics,
  loadOverviewStatistics,
  loadPaymentsStatistics,
  loadReportsStatistics,
  loadUsersStatistics,
  onCancellationsStatisticsEnter,
  onOverviewStatisticsEnter,
  onPaymentsStatisticsEnter,
  onReportsStatisticsEnter,
  onUsersStatisticsEnter,
} from '@/redux/actions/_core/statistics.action';
import { onEnter, onLoad } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { periodRouteSearchParams } from '@/validations/_core/app.validations';

const Overview = lazy(() => import('@/pages/_core/statistics/Overview'));
const Users = lazy(() => import('@/pages/_core/statistics/Users'));
const Payments = lazy(() => import('@/pages/_core/statistics/Payments'));
const Cancellations = lazy(() => import('@/pages/_core/statistics/Cancellations'));
const Reports = lazy(() => import('@/pages/_core/statistics/Reports'));

/*
 * The figures are loaded by the route rather than by the page: `loaderDeps` runs the load again each
 * time the period in the address changes. They are kept once the reader moves to another view, so
 * coming back shows them while they are read again, the way a change of period already does.
 * `beforeLoad` only guards the right — it has to settle before anything is fetched.
 */
export const statisticsOverviewRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  getParentRoute: () => privateLayout,
  component: Overview,
  beforeLoad: onEnter(onOverviewStatisticsEnter),
  loader: onLoad(loadOverviewStatistics),
  path: PATH_NAMES.statistics.root,
});

export const statisticsUsersRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  loaderDeps: ({ search }) => ({ period: search.period }),
  getParentRoute: () => privateLayout,
  component: Users,
  beforeLoad: onEnter(onUsersStatisticsEnter),
  loader: onLoad(({ deps }) => loadUsersStatistics(deps.period)),
  path: PATH_NAMES.statistics.users,
});


export const statisticsPaymentsRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  loaderDeps: ({ search }) => ({ period: search.period }),
  getParentRoute: () => privateLayout,
  component: Payments,
  beforeLoad: onEnter(onPaymentsStatisticsEnter),
  loader: onLoad(({ deps }) => loadPaymentsStatistics(deps.period)),
  path: PATH_NAMES.statistics.payments,
});


export const statisticsCancellationsRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  loaderDeps: ({ search }) => ({ period: search.period }),
  getParentRoute: () => privateLayout,
  component: Cancellations,
  beforeLoad: onEnter(onCancellationsStatisticsEnter),
  loader: onLoad(({ deps }) => loadCancellationStatistics(deps.period)),
  path: PATH_NAMES.statistics.cancellations,
});

export const statisticsReportsRoute = createRoute({
  validateSearch: search => periodRouteSearchParams.parse(search),
  loaderDeps: ({ search }) => ({ period: search.period }),
  getParentRoute: () => privateLayout,
  component: Reports,
  beforeLoad: onEnter(onReportsStatisticsEnter),
  loader: onLoad(({ deps }) => loadReportsStatistics(deps.period)),
  path: PATH_NAMES.statistics.reports,
});
