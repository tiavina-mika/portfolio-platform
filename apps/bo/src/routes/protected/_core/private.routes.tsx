import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const About = lazy(() => import('@/pages/_core/About'));
const Home = lazy(() => import('@/pages/_core/Home'));
const Profile = lazy(() => import('@/pages/_core/Profile'));
const Settings = lazy(() => import('@/pages/_core/Settings'));

import { onSettingsEnter } from '@/redux/actions/_core/app.action';
import { onDashboardEnter } from '@/redux/actions/_core/dashboard.action';
import { onEnter, onLoad } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { settingsRouteSearchParams } from '@/validations/_core/app.validations';

export const homeRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Home,
  // not awaited: the page draws its own skeleton, so the shell and the page head show up at once
  loader: onLoad(onDashboardEnter),
  path: '/',
});

export const profileRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Profile,
  path: PATH_NAMES.profile,
});

export const aboutRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: About,
  path: PATH_NAMES.about,
});

export const settingsRoute = createRoute({
  validateSearch: search => settingsRouteSearchParams.parse(search),
  getParentRoute: () => privateLayout,
  component: Settings,
  beforeLoad: onEnter(onSettingsEnter),
  path: PATH_NAMES.settings,
});
