import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { loadNotificationBroadcastHistory } from '@/redux/actions/_core/notification.action';
import { onLoad } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const Broadcast = lazy(() => import('@/pages/_core/notifications/Broadcast'));

/**
 * The page where an operator writes an announcement to a segment of the members.
 *
 * Its own address rather than a tab of the notification list: that list is a record of what was
 * sent, this is the one place something is sent from, and the two are not granted by the same right.
 * No `beforeLoad` — the form has nothing to read before it is drawn, only the audience it counts
 * once the operator has chosen one. The list of past announcements under it is read by the loader
 * instead, which does not hold the page back: the list draws its own placeholder meanwhile.
 */
export const broadcastRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Broadcast,
  loader: onLoad(loadNotificationBroadcastHistory),
  path: PATH_NAMES.broadcast,
  staticData: { breadcrumb: { labelKey: 'user:notifications.broadcast.broadcast' } },
});

export default broadcastRoute;
