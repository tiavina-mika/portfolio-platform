import { formatInZone, startOfInZone } from '@shared/utils';
import dayjs from 'dayjs';

import { translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { SLACK_ALERT_ICONS, SLACK_ALERT_LOCALE } from '@/constants/_core/slack.constants';
import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';
import { isSlackAlertEnabled, postSlackAlert } from '@/services/slack.service';
import { buildSlackAlertText } from '@/utils/_core/slack.utils';

import { getAllRoleUserIds } from './userRole.service.cloud';

/** The day a summary covers: from its first instant, up to (not including) the next day's. */
export type DailySummaryPeriod = { since: Date; until: Date };

/** One figure of the morning summary: its icon, the translation key of its label, and the count. */
export type DailySummaryFigure = { icon: string; labelKey: string; count: number };

type DailySummaryProvider = (period: DailySummaryPeriod) => Promise<DailySummaryFigure[]>;

const providers: DailySummaryProvider[] = [];

/**
 * Lets each business domain add its own figures to the morning summary, without this generic
 * service knowing about rides or bookings. Figures are shown in the order providers registered.
 */
export const registerDailySummaryProvider = (provider: DailySummaryProvider): void => {
  providers.push(provider);
};

/**
 * Yesterday on the country's clock: the summary is read by people who think in local days, and a
 * UTC day would cut the evening rush in two.
 */
export const getYesterdayPeriod = (now: Date): DailySummaryPeriod => {
  const until = startOfInZone(now, STATISTICS_TIME_ZONE);
  // half a day back from midnight lands inside yesterday whatever the zone's offset
  const since = startOfInZone(dayjs(until).subtract(12, 'hour').toDate(), STATISTICS_TIME_ZONE);

  return { since, until };
};

/** The summary as one Slack message: the day in the title, then every figure on one line. */
export const buildDailySummaryText = (figures: DailySummaryFigure[], period: DailySummaryPeriod): string => (
  buildSlackAlertText({
    icon: SLACK_ALERT_ICONS.summary,
    title: translate('slack.dailySummaryTitle', SLACK_ALERT_LOCALE, {
      date: formatInZone(period.since, STATISTICS_TIME_ZONE, 'DD/MM/YYYY'),
    }),
    details: figures.map((figure) => `${figure.icon} ${translate('slack.dailySummaryFigure', SLACK_ALERT_LOCALE, {
      label: translate(figure.labelKey, SLACK_ALERT_LOCALE),
      value: String(figure.count),
    })}`).join(' · '),
  })
);

// staff accounts are left out, as on the back-office dashboard: an admin's account is not a sign-up
const getUserDailySummaryFigures = async ({
  since, until,
}: DailySummaryPeriod): Promise<DailySummaryFigure[]> => {
  const staffUserIds = await getAllRoleUserIds();
  const count = await new Parse.Query(Parse.User)
    .greaterThanOrEqualTo('createdAt', since)
    .lessThan('createdAt', until)
    .notContainedIn('objectId', staffUserIds)
    .count(USE_MASTER_KEY);

  return [{ icon: SLACK_ALERT_ICONS.newUsers, labelKey: 'slack.dailySummaryNewUsers', count }];
};

registerDailySummaryProvider(getUserDailySummaryFigures);

/**
 * Posts yesterday's figures to the staff's Slack alert channel. In an environment with no channel
 * nothing is counted at all.
 */
export const postDailySlackSummary = async (now: Date = new Date()): Promise<void> => {
  if (!isSlackAlertEnabled()) return;

  const period = getYesterdayPeriod(now);
  const figures = (await Promise.all(providers.map(async (provider) => provider(period)))).flat();

  await postSlackAlert(buildDailySummaryText(figures, period));
};
