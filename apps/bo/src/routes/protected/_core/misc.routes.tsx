import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { onMiscEnter } from '@/redux/actions/_core/misc.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { validateTabSearch } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';


const Misc = lazy(() => import('@/pages/_core/misc/Misc'));

export const miscLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.miscellaneous,
  staticData: { breadcrumb: { labelKey: 'route:miscellaneous' } },
});

export const miscRoute = createRoute({
  getParentRoute: () => miscLayout,
  component: Misc,
  beforeLoad: onEnter(onMiscEnter),
  validateSearch: validateTabSearch,
  path: '/',
});

const miscRoutes = [
  miscRoute,
];

export default miscRoutes;
