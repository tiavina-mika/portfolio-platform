import { DEFAULT_COUNTRY } from '@shared/constants';

/**
 * IANA time zone statistics are counted on: a "day" or a "month" is the one members live, so the
 * country's clock — never the server's OS, which is UTC in production and UTC+3 on a developer's
 * machine. Every day/month boundary of a statistics query and every Mongo date operator of a
 * statistics pipeline is given this zone explicitly.
 */
export const STATISTICS_TIME_ZONE = DEFAULT_COUNTRY.timeZone;

export const MINUTE_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
