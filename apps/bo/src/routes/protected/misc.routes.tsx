import { Outlet, createRoute } from '@tanstack/react-router';

import JobsStatus from '@/containers/misc/jobs/JobsStatus';
import Misc from '@/pages/misc/Misc';
import Tests from '@/pages/misc/Tests';
import { onMiscEnter } from '@/redux/actions/misc.action';
import { onTestEnter } from '@/redux/actions/test.action';
import { onEnter } from '@/redux/actions/util.action';
import { PATH_NAMES } from '@/utils/pathnames';

import { privateLayout } from './private.routes';

export const miscLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.miscellaneous,
});

export const miscRoute = createRoute({
  getParentRoute: () => miscLayout,
  component: Misc,
  beforeLoad: onEnter(onMiscEnter),
  path: '/',
});

// individual routes
export const jobsRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: JobsStatus,
  path: PATH_NAMES.jobs,
});

// individual routes
export const testsRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Tests,
  beforeLoad: onEnter(onTestEnter),
  path: PATH_NAMES.tests,
});

const miscRoutes = [
  miscRoute,
];

export default miscRoutes;
