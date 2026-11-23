import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { onEnter } from '@/redux/actions/_core/util.action';
import { onMissionsEnter } from '@/redux/actions/_domain/mission.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { missionsRouteSearchParams } from '@/validations/_domain/mission.validation';

const Missions = lazy(() => import('@/pages/_domain/mission/Missions'));

// the missions of the Aldaron workspace: one list, written and edited in a dialog over it
export const missionsRoute = createRoute({
  validateSearch: search => missionsRouteSearchParams.parse(search),
  getParentRoute: () => privateLayout,
  beforeLoad: onEnter(onMissionsEnter),
  component: Missions,
  path: PATH_NAMES.missions,
  staticData: { breadcrumb: { labelKey: 'project:mission.missions' } },
});
