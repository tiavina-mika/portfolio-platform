import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import { onNotificationEnter, onNotificationsEnter } from '@/redux/actions/_core/notification.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { validateTabSearch } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';


const Notification = lazy(() => import('@/pages/_core/notifications/Notification'));
const Notifications = lazy(() => import('@/pages/_core/notifications/Notifications'));

export const notificationsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.notifications,
  staticData: { breadcrumb: { labelKey: 'user:notifications.notifications' } },
});

export const notificationsRoute = createRoute({
  validateSearch: validateTabSearch,
  getParentRoute: () => notificationsLayout,
  beforeLoad: onEnter(onNotificationsEnter),
  component: Notifications,
  path: '/',
});

export const notificationRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onNotificationEnter),
  getParentRoute: () => notificationsLayout,
  component: Notification,
  path: '$id',
});

const notificationRoutes = [
  notificationsRoute,
  notificationRoute,
];

export default notificationRoutes;
