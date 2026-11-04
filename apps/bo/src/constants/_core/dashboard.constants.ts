import type { IDashboardKpis, IDashboardRecent } from '@/types/_core/dashboard.type';

// rows are recent by construction, so the year would only be noise
export const DASHBOARD_SHORT_DATE_TIME_FORMAT = 'DD MMM HH:mm';
export const DASHBOARD_DATE_FORMAT = 'DD MMM YYYY';
export const DASHBOARD_UPDATED_AT_FORMAT = 'HH:mm';

/*
 * the parts of each band the generic dashboard draws on its own — a domain adds the ones it feeds
 * through the registries of `dashboard.utils`. The server leaves out a part the account may not
 * read, so counting which of them arrived says how much of the dashboard the account sees.
 */
export const DASHBOARD_KPI_FIELDS: (keyof IDashboardKpis)[] = ['totalUsers'];
export const DASHBOARD_RECENT_FIELDS: (keyof IDashboardRecent)[] = ['users'];
