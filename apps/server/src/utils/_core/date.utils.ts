import { DEFAULT_COUNTRY } from '@shared/constants';
import { formatInZone, shiftInZone, startOfInZone } from '@shared/utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

import type { DateType } from '@/types/utils.type';

// idempotent — also extended at boot, but a unit test imports this module without the entry point
dayjs.extend(utc);

export const unixToDate = (unix: number): DateType => {
  const day = dayjs(unix).toDate();

  return day;
};

/**
 * A date written the way the member reads it on their own clock. The server runs in UTC, so a plain
 * `dayjs(date).format('HH:mm')` printed every departure three hours early in pushes and e-mails.
 * @param date the instant to print
 * @param format dayjs format
 * @param timeZone IANA zone the reader is on — the default country's unless the place is known
 */
export const formatDateInAppTimezone = (
  date: DateType,
  format = 'DD/MM/YYYY HH:mm',
  timeZone: string = DEFAULT_COUNTRY.timeZone
): string => formatInZone(date, timeZone, format);

/**
 * The span of whole local days (members' clock) around the day a date falls on, as `[start, end)`.
 *
 * The calendar day is read on the members' clock, not the server's: a picked day reaches the server
 * as an instant (local midnight or noon of the passenger's device, as ISO), and the server runs in
 * UTC, so reading it there would shift the day for every instant between 21:00 and 24:00 UTC.
 * @param date any instant within the wanted day
 * @param extraDays whole days added on each side of that day (0 = the day alone)
 * @param timeZone IANA zone the day is read on — the default country's unless the place is known
 */
export const getAppDaysRange = (
  date: DateType,
  extraDays = 0,
  timeZone: string = DEFAULT_COUNTRY.timeZone
): { start: Date; end: Date } => {
  const day = startOfInZone(date, timeZone, 'day');

  return {
    start: shiftInZone(day, timeZone, -extraDays, 'day'),
    end: shiftInZone(day, timeZone, extraDays + 1, 'day'),
  };
};
