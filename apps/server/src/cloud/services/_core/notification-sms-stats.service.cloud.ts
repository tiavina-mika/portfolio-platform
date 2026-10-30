import { shiftInZone, startOfInZone } from '@shared/utils';

import { collections } from '@/constants/_core/constants';
import { SMS_DAILY_COUNTS_DEFAULT_DAYS, SMS_UNIT_COST_AR } from '@/constants/_core/notification.constants';
import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@/types/notification.type';

import { getMongoCollection } from '../../utils/_core/db.utils.cloud';

export type NotificationSmsDailyCount = {
  /** the day on the members' clock, `YYYY-MM-DD` */
  date: string;
  /** texts the provider accepted — the ones that were paid */
  sentCount: number;
  /** texts the provider refused */
  failedCount: number;
  /** texts held back because the member had reached the daily allowance */
  rateLimitedCount: number;
  /** what the day's accepted texts cost, in Ariary */
  estimatedCostAr: number;
};

type SmsOutcomeRow = { _id: { date: string; status: string }; count: number };

/**
 * How many SMS the notifications sent each day, read off their SMS channel — the figure the cost of
 * the fallback is measured with before the list of events that may be texted is widened. Counted
 * per recipient, not per notification: a send to several members is one SMS each.
 *
 * Only the days that had at least one entry are returned, newest first. Grouped in one aggregate on
 * the collection itself: the outcome is an array nested in `channels.sms`, which a query cannot
 * count.
 * @param days how far back to look, today included
 */
export const getNotificationSmsDailyCounts = async (
  days = SMS_DAILY_COUNTS_DEFAULT_DAYS
): Promise<NotificationSmsDailyCount[]> => {
  const since = startOfInZone(
    shiftInZone(new Date(), STATISTICS_TIME_ZONE, -(days - 1), 'day'),
    STATISTICS_TIME_ZONE,
    'day'
  );
  const smsPath = `channels.${NotificationChannelEnum.SMS}`;
  const collection = await getMongoCollection(collections.Notification);

  const rows: SmsOutcomeRow[] = await collection.aggregate([
    { $match: { _created_at: { $gte: since }, [smsPath]: { $exists: true } } },
    { $unwind: `$${smsPath}` },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$_created_at', timezone: STATISTICS_TIME_ZONE },
          },
          status: `$${smsPath}.status`,
        },
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  const countsByDate = new Map<string, NotificationSmsDailyCount>();

  rows.forEach(({ _id: { date, status }, count }) => {
    const day = countsByDate.get(date) ?? {
      date, sentCount: 0, failedCount: 0, rateLimitedCount: 0, estimatedCostAr: 0,
    };

    if (status === NotificationChannelStatusEnum.SENT) day.sentCount += count;
    if (status === NotificationChannelStatusEnum.FAILED) day.failedCount += count;
    if (status === NotificationChannelStatusEnum.SMS_RATE_LIMITED) day.rateLimitedCount += count;

    day.estimatedCostAr = day.sentCount * SMS_UNIT_COST_AR;
    countsByDate.set(date, day);
  });

  return [...countsByDate.values()].sort((first, second) => second.date.localeCompare(first.date));
};
