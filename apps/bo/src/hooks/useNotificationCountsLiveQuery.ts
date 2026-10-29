import { LIVE_QUERY_SUBSCRIBABLE_CLASSES } from '@shared/constants';
import { PaymentStatusEnum } from '@shared/types';
import debounce from 'lodash/debounce';
import Parse from 'parse';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import {
  COLLECTIONS, NOTIFICATION_COLLECTIONS, NOTIFICATION_COUNT_DEBOUNCE_MS,
  NOTIFICATION_COUNT_POLL_INTERVAL_MS,
} from '@/constants/_core/app.constants';
import { PAYMENT_FAILED_NOTIFICATION_KEY } from '@/constants/_core/payment.constants';
import { SOS_COUNT_POLL_INTERVAL_MS } from '@/constants/_core/ticket.constants';
import { refreshNotification } from '@/redux/actions/_core/app.action';
import { refreshOpenSosTicketsCount } from '@/redux/actions/_core/contact.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsIsAuthenticatedSelector } from '@/redux/reducers/_core/settings.reducer';
import { canAccessTo } from '@/utils/_core/role.utils';

/**
 * Loads the AppBar/sidebar "new items" badges (NOTIFICATION_COLLECTIONS) once the shell is mounted,
 * then keeps them in sync while the admin stays on the BO — a new vehicle coming in moves its badge
 * without a reload. The first load happens here rather than in the dashboard guard so the shell is
 * never held back by the slowest of these counts: a badge showing up a moment after the sidebar is
 * secondary information arriving second.
 *
 * A collection is kept in sync one of two ways, decided by whether Parse Server can actually push
 * it to a role-privileged reader (LIVE_QUERY_SUBSCRIBABLE_CLASSES):
 * - **pushed**: a LiveQuery subscription per collection (`seen: false, deleted: false`, the same
 *   filter as `getObjectsCount`), refetching that collection's count on any event — simpler and
 *   drift-free compared to incrementing/decrementing the count client-side.
 * - **polled**: everything else, on NOTIFICATION_COUNT_POLL_INTERVAL_MS. Subscribing to those is
 *   not a slower path but a broken one — the server either refuses the subscription outright and
 *   logs an error for every attempt, or accepts it and then filters every event away.
 *
 * Both also refetch on tab focus, as a fallback for a dropped/missed WebSocket connection and to
 * close the polling gap the moment the reader comes back.
 */
export const useNotificationCountsLiveQuery = (): void => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(getSettingsIsAuthenticatedSelector);
  const roles = useSelector(getRoleCurrentUserRolesSelector);

  /*
   * the effect depends on what the roles grant, not on the roles array itself: every reload of the
   * roles hands a new array reference, which used to tear down and recreate every subscription
   * even when the rights had not changed
   */
  const allowedCollectionsKey = NOTIFICATION_COLLECTIONS.filter(
    (collection) => canAccessTo(roles, collection)
  ).join(',');
  /*
   * failed payments — a `status: failed` subset of the Payment class tracked as its own badge
   * count, kept apart from the generic payment queue because a failed payment is work to do
   * rather than a row to read, so it is refreshed under its own key
   */
  const canTrackFailedPayments = canAccessTo(roles, COLLECTIONS.payment);
  // the SOS alerts still open — a `source: sos` subset of the Contact class, on a faster clock of its own
  const canTrackSosAlerts = canAccessTo(roles, COLLECTIONS.contact);
  const hasRoles = roles.length > 0;

  useEffect(() => {
    if (!isAuthenticated || !hasRoles) return undefined;

    const allowedCollections = allowedCollectionsKey ? allowedCollectionsKey.split(',') : [];
    const pushedCollections = allowedCollections.filter(
      (collection) => LIVE_QUERY_SUBSCRIBABLE_CLASSES.includes(collection)
    );
    const polledCollections = allowedCollections.filter(
      (collection) => !LIVE_QUERY_SUBSCRIBABLE_CLASSES.includes(collection)
    );

    let isCancelled = false;
    const subscriptions: Parse.LiveQuerySubscription[] = [];

    const refresh = (collection: string) => dispatch(refreshNotification(collection));

    /*
     * one bulk action or one import publishes a LiveQuery event per row, and each of them used to
     * fire its own `count()` — in every connected back-office at once. Holding the recount back
     * briefly collapses that burst into a single query, and a badge a fifth of a second late is a
     * badge nobody notices was late. Per collection, so a busy class never delays another's.
     */
    const debouncedRefreshByCollection = new Map<string, ReturnType<typeof debounce>>();

    const refreshDebounced = (collection: string): void => {
      let debounced = debouncedRefreshByCollection.get(collection);

      if (!debounced) {
        debounced = debounce(() => refresh(collection), NOTIFICATION_COUNT_DEBOUNCE_MS);
        debouncedRefreshByCollection.set(collection, debounced);
      }

      debounced();
    };

    const refreshFailedPayments = () => dispatch(refreshNotification(COLLECTIONS.payment, {
      status: PaymentStatusEnum.FAILED,
      key: PAYMENT_FAILED_NOTIFICATION_KEY,
    }));

    const refreshPolled = () => {
      polledCollections.forEach(refresh);
      if (canTrackFailedPayments) refreshFailedPayments();
    };

    const refreshSosAlerts = () => dispatch(refreshOpenSosTicketsCount());

    const refreshAll = () => {
      allowedCollections.forEach(refresh);
      if (canTrackFailedPayments) refreshFailedPayments();
      if (canTrackSosAlerts) refreshSosAlerts();
    };

    const subscribe = async (collection: string): Promise<void> => {
      const query = new Parse.Query(collection)
        .equalTo('deleted', false)
        .equalTo('seen', false);

      try {
        const subscription = await query.subscribe();

        if (isCancelled) {
          await subscription.unsubscribe();
          return;
        }

        (['create', 'enter', 'update', 'leave', 'delete'] as const).forEach((event) => {
          subscription.on(event, () => refreshDebounced(collection));
        });

        subscriptions.push(subscription);
      }
      // LiveQuery unavailable (offline, proxy blocking WS…) — the fallbacks below still work
      catch { /* empty */ }
    };

    // the first load of every badge — nothing else fetches them
    refreshAll();

    // side by side: one after the other, each subscription waited for the previous handshake
    Promise.all(pushedCollections.map(subscribe)).catch(() => undefined);

    /*
     * polling a tab nobody is looking at only burns count queries — the visibility handler below
     * refetches the moment the reader comes back, which is the only point at which a stale badge
     * could have been noticed at all
     */
    const hasPolledBadges = polledCollections.length > 0 || canTrackFailedPayments;
    const pollInterval = hasPolledBadges
      ? window.setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        refreshPolled();
      }, NOTIFICATION_COUNT_POLL_INTERVAL_MS)
      : undefined;

    /*
     * the SOS alerts are recounted even while the tab is hidden, and more often: every other badge
     * can wait for the reader to come back, a member in danger on a ride cannot
     */
    const sosPollInterval = canTrackSosAlerts
      ? window.setInterval(refreshSosAlerts, SOS_COUNT_POLL_INTERVAL_MS)
      : undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      refreshAll();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      debouncedRefreshByCollection.forEach((debounced) => debounced.cancel());
      if (pollInterval !== undefined) window.clearInterval(pollInterval);
      if (sosPollInterval !== undefined) window.clearInterval(sosPollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe().catch(() => undefined);
      });
    };
  }, [
    dispatch, isAuthenticated, hasRoles, allowedCollectionsKey, canTrackFailedPayments,
    canTrackSosAlerts,
  ]);
};
