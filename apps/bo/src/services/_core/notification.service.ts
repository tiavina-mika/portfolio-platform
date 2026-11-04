import Parse from 'parse';

import type { IListTabCounts } from '@/types/_core/app.type';
import type { NotificationChannel } from '@shared/types';

import { locales } from '@/config/i18n';
import {
  BroadcastHistoryEntry, BroadcastInput, INotification, INotificationResend, NotificationListCounts,
  NotificationResends,
  NotificationSmsDailyCount, ResendNotificationOptions,
} from '@/types/_core/notification.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

/**
 * One page of the notification list, plus the figures that describe the whole collection: the size
 * of each tab, of each category, and of the delivery backlog. They travel with the page rather than
 * being fetched separately — none of them can be derived from the rows just returned, and two round
 * trips would let the list and the filter panel disagree about what exists.
 */
export const fetchNotifications = async ({
  limit, skip, orderBy, order, filters, search,
}: {
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
}): Promise<{
  results: INotification[];
  count: number;
  tabCounts: IListTabCounts;
} & NotificationListCounts> => {
  const result: Record<string, any> = await Parse.Cloud.run('getNotifications', {
    limit, skip, orderBy, order, filters, search, locales,
  });

  return {
    results: result.results.map(
      (notification: Parse.Object) => toJSONWithId<INotification>(notification)
    ),
    count: result.count,
    tabCounts: result.tabCounts ?? {},
    typeCounts: result.typeCounts ?? {},
    failedSendsCount: result.failedSendsCount ?? 0,
  };
};

/**
 * How many fallback SMS went out each of the last `days` days, with what they cost and how many
 * were held back by the daily allowance. Only the days that had at least one SMS are returned,
 * newest first.
 */
export const fetchNotificationSmsDailyCounts = async (days: number): Promise<NotificationSmsDailyCount[]> => {
  return Parse.Cloud.run('getNotificationSmsDailyCounts', { days });
};

export const fetchNotification = async (
  id: string,
  include: string[] = []
): Promise<INotification | undefined> => {
  const notification = await Parse.Cloud.run('getNotification', { id, include });

  return (notification ? toJSONWithId(notification) : undefined);
};

export const bulkSetNotificationsReceiverSeen = async (
  ids: string[],
  value: boolean
): Promise<INotification[]> => {
  const updated: Parse.Object[] = await Parse.Cloud.run('bulkSetNotificationsReceiverSeen', { ids, value });

  return updated.map((notification) => toJSONWithId<INotification>(notification));
};

export const bulkSoftDeleteNotificationsByIds = async (ids: string[]): Promise<void> => {
  await Parse.Cloud.run('bulkSoftDeleteNotifications', { ids });
};

/** Takes binned sends back out of the recycle bin. Resolves to how many were restored. */
export const bulkRestoreNotificationsByIds = async (ids: string[]): Promise<number> => {
  return Parse.Cloud.run('bulkRestoreNotifications', { ids });
};

/**
 * Destroys binned sends for good, with their resend history. Its own endpoint rather than the
 * generic `destroyObjects`, which would leave those resends behind.
 * Resolves to how many were destroyed.
 */
export const destroyNotificationsByIds = async (ids: string[]): Promise<number> => {
  return Parse.Cloud.run('destroyNotifications', { ids });
};

/**
 * Sends an existing notification again on one channel — to all of its recipients or to the ones
 * named. The row is not rewritten: the same message goes out a second time, and the channel's
 * entries record how it ended. Resolves to how many recipients it went to — 0 when the channel
 * cannot be rebuilt for this send.
 */
export const resendNotificationInCloud = async (
  id: string,
  options: ResendNotificationOptions
): Promise<number> => {
  return Parse.Cloud.run('resendNotification', { id, ...options });
};

/**
 * Sends every send in the selection again, to the recipients a provider rejected it for, on every
 * channel that can be rebuilt. Resolves to how many recipients each channel went to — none at all
 * is not an error: a selection that all went out cleanly has nothing to retry.
 */
export const resendNotificationFailedDeliveriesInCloud = async (
  ids: string[]
): Promise<Record<NotificationChannel, number>> => {
  return Parse.Cloud.run('resendNotificationFailedDeliveries', { ids });
};

/**
 * The resends of one send, and the channels it can go out on again. The account behind a resend
 * arrives through a pointer, which serialises with `objectId` alone — it is given the `id` every
 * user link of the back-office reads.
 */
export const fetchNotificationResends = async (id: string): Promise<NotificationResends | undefined> => {
  const result: Record<string, any> | false = await Parse.Cloud.run('getNotificationResends', { id });

  if (!result) return undefined;

  return {
    resends: result.resends.map((resend: Parse.Object): INotificationResend => {
      const json = resend.toJSON() as unknown as INotificationResend;

      return json.resentBy
        ? { ...json, resentBy: { ...json.resentBy, id: json.resentBy.objectId } }
        : json;
    }),
    resendableChannels: result.resendableChannels ?? [],
  };
};

/**
 * How many members the announcement being written would reach. Its own call rather than a figure
 * guessed from a filter: the operator is about to write to a segment of the membership at once, and
 * the one number that makes that decision reviewable is how many people are actually in it.
 */
export const fetchNotificationBroadcastAudience = async (
  audience: Pick<BroadcastInput, 'segment' | 'city'>
): Promise<number> => {
  const { recipientCount } = await Parse.Cloud.run('previewNotificationBroadcast', audience);

  return recipientCount ?? 0;
};

/** The announcements sent most recently, newest first, each one stated once. */
export const fetchNotificationBroadcastHistory = async (): Promise<BroadcastHistoryEntry[]> => (
  Parse.Cloud.run('getNotificationBroadcastHistory')
);

/**
 * Sends the announcement. `expectedRecipientCount` is the figure the operator confirmed: the server
 * recounts the audience and refuses the send when it no longer matches, since a broadcast cannot be
 * taken back. Resolves to how many members it actually reached.
 */
export const sendNotificationBroadcastInCloud = async (
  broadcast: BroadcastInput & { expectedRecipientCount: number }
): Promise<number> => {
  const { recipientCount } = await Parse.Cloud.run('sendNotificationBroadcast', broadcast);

  return recipientCount ?? 0;
};
