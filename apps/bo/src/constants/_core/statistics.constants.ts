import { COLLECTIONS } from '@/constants/_core/app.constants';
import { UIRoleEnum } from '@/types/_core/role.type';
import { StatisticsPeriod, StatisticsViewEnum } from '@/types/_core/statistics.type';

export const STATISTICS_PERIODS = ['7d', '30d', '90d', '12m'] as const;

export const DEFAULT_STATISTICS_PERIOD: StatisticsPeriod = '12m';

/**
 * Post-acceptance cancellation rate the platform aims to stay under. Drawn as a reference line on
 * the cancellation chart so it answers "is this bad?" and not only "is this going up?".
 */
export const CANCELLATION_RATE_TARGET_PERCENT = 5;

/**
 * The core views, each with the right that opens it and its place in the statistics navigation.
 * They are the rights the routes themselves check, so the navigation never offers a view its route
 * would turn away. The views a business domain adds (rides, vehicles) are registered through
 * `registerStatisticsView` and slotted in by their `order`.
 */
export const STATISTICS_VIEWS = [
  {
    view: StatisticsViewEnum.OVERVIEW, labelKey: 'statistics:overview', uiRight: UIRoleEnum.STATISTICS, order: 0,
  },
  { view: StatisticsViewEnum.USERS, labelKey: 'user:users', className: COLLECTIONS.user, order: 10 },
  {
    view: StatisticsViewEnum.PAYMENTS, labelKey: 'user:payments.payments',
    className: COLLECTIONS.payment, order: 30,
  },
  {
    view: StatisticsViewEnum.CANCELLATIONS, labelKey: 'statistics:cancellations',
    uiRight: UIRoleEnum.STATISTICS, order: 50,
  },
  { view: StatisticsViewEnum.REPORTS, labelKey: 'statistics:reports', className: COLLECTIONS.report, order: 60 },
] as const;

// a rate never goes past it, so a percentage chart's axis stops there instead of at its highest point
export const PERCENT_MAX = 100;

// twelve two-hour columns stay readable on a tablet, where twenty-four hourly ones turn into slivers
export const HEATMAP_HOURS_PER_COLUMN = 2;

// a document this close to its end is as urgent as one already expired: the driver cannot renew it in time
export const EXPIRING_DOCUMENT_CRITICAL_DAYS = 7;

// the overview has no period switch: it always reads the last twelve months, a bucket per month
export const OVERVIEW_STATISTICS_PERIOD: StatisticsPeriod = '12m';

// the key the server groups payments under when the operator was never recorded on them
export const UNKNOWN_PAYMENT_SERVICE = 'unknown';

// a table cell with no figure to state — distinct from a 0, which is a figure
export const STATISTICS_EMPTY_CELL = '—';

// the top of the rating scale, written after an average: "4,8 / 5"
export const RATING_MAX = 5;

// the key the server groups the long tail of vehicle brands under
export const OTHER_VEHICLE_BRAND = 'other';
