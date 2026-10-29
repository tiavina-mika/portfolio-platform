import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import { onReportEnter, onReportsEnter } from '@/redux/actions/_core/report.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { validateReportSearch } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const Report = lazy(() => import('@/pages/_core/reports/Report'));
const Reports = lazy(() => import('@/pages/_core/reports/Reports'));

export const reportsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.reports,
  staticData: { breadcrumb: { labelKey: 'user:reports.reports' } },
});

export const reportsRoute = createRoute({
  validateSearch: validateReportSearch,
  getParentRoute: () => reportsLayout,
  beforeLoad: onEnter(onReportsEnter),
  component: Reports,
  path: '/',
});

/*
 * not cleared on leave: moving from one report to the next is the same route under another id, and
 * a clear running after the new report was read would blank the page that just loaded. The page
 * compares the stored report with the id in its address instead, so a stale one is never drawn.
 */
export const reportRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onReportEnter),
  getParentRoute: () => reportsLayout,
  component: Report,
  path: '$id',
});

const reportRoutes = [
  reportsRoute,
  reportRoute,
];

export default reportRoutes;
