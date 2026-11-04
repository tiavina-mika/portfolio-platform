import dayjs, { type Dayjs, type ManipulateType, type OpUnitType } from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { getCountry } from './country.utils';
import type { DateType } from './date.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

/** A wall-clock reading with no zone attached, e.g. `2026-10-01 08:30:00.000`. */
const WALL_CLOCK_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

/**
 * Whether a string is an IANA zone name the runtime knows (`Indian/Antananarivo`). Offsets such as
 * `+03:00` are refused: only a name can follow daylight saving time and its changes.
 */
export const isValidTimeZone = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0) return false;
  // recent runtimes let `Intl` accept a bare offset as a zone; it names no region, so it is not one
  if (/^[+-]/.test(value)) return false;

  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  }
  catch {
    return false;
  }
};

/**
 * The zone a place is read on: the zone it carries when it is valid, otherwise the zone of its
 * country, otherwise the default country's. Rows saved before zones were stored have neither, so
 * every reader goes through this instead of assuming one is present.
 * @param timeZone zone stored on the place (address, ride), when there is one
 * @param countryCode ISO 3166-1 alpha-2 code of the place, when known
 */
export const resolveTimeZone = (timeZone?: string | null, countryCode?: string | null): string => {
  if (isValidTimeZone(timeZone)) return timeZone;

  return getCountry(countryCode).timeZone;
};

/** A date seen on the clock of a zone. Prefer the helpers below; this is the escape hatch. */
export const inZone = (date: DateType, timeZone: string): Dayjs => dayjs(date).tz(timeZone);

/** A date written the way it reads on the clock of a zone. */
export const formatInZone = (date: DateType, timeZone: string, format = 'DD/MM/YYYY HH:mm'): string => (
  inZone(date, timeZone).format(format)
);

/** First instant of the day / week / month / year a date falls in, on the clock of a zone. */
export const startOfInZone = (date: DateType, timeZone: string, unit: OpUnitType = 'day'): Date => (
  inZone(date, timeZone).startOf(unit).toDate()
);

/** Last instant of the day / week / month / year a date falls in, on the clock of a zone. */
export const endOfInZone = (date: DateType, timeZone: string, unit: OpUnitType = 'day'): Date => (
  inZone(date, timeZone).endOf(unit).toDate()
);

/**
 * Turns a wall-clock reading ("2026-10-01 08:30") into the instant it designates in a zone — what
 * a member means when they pick a time, whatever the clock of the device that picked it.
 * @param wallClock date and time with no zone, in any format dayjs parses (`YYYY-MM-DD HH:mm[:ss]`)
 * @param timeZone zone the reading belongs to
 */
export const zonedTimeToInstant = (wallClock: string, timeZone: string): Date => (
  dayjs.tz(wallClock, timeZone).toDate()
);

/**
 * Combines a picked day and a picked time of day into the instant they designate in a zone: the day
 * is the one `date` falls on and the time the one `hour` falls on, both read on that zone's clock
 * rather than on the machine's. Pickers hand each back as an instant, so reading them on a clock
 * other than the one they were picked on shifts the hour by the offset and can land on another day.
 * @param date any instant within the wanted day
 * @param hour any instant carrying the wanted time of day
 * @param timeZone IANA zone the day and the time are read on
 */
export const combineDateAndHourInZone = (date: DateType, hour: DateType, timeZone: string): Date => (
  zonedTimeToInstant(
    `${formatInZone(date, timeZone, 'YYYY-MM-DD')} ${formatInZone(hour, timeZone, 'HH:mm:ss')}`,
    timeZone
  )
);

/**
 * Moves a date by whole calendar days / months / years on the clock of a zone. Plain arithmetic on
 * the instant would shift the wall-clock hour whenever a daylight saving change sits in between.
 */
export const shiftInZone = (
  date: DateType,
  timeZone: string,
  amount: number,
  unit: ManipulateType
): Date => {
  const wallClock = formatInZone(date, timeZone, WALL_CLOCK_FORMAT);
  const shifted = dayjs.utc(wallClock).add(amount, unit).format(WALL_CLOCK_FORMAT);

  return zonedTimeToInstant(shifted, timeZone);
};

const CALENDAR_DATE_FORMAT = 'YYYY-MM-DD';

/** The day ('YYYY-MM-DD') it currently is on the clock of a zone. */
export const getTodayInZone = (timeZone: string, now: Date = new Date()): string => (
  formatInZone(now, timeZone, CALENDAR_DATE_FORMAT)
);

/**
 * Whether a calendar date (a day with no time, like the end of validity printed on a paper) is
 * before today on the clock of a zone. A `YYYY-MM-DD` string is compared as written — it names a
 * day, not an instant, so the clock of whoever reads it must not move it. A real instant is first
 * read on the clock of the zone.
 * @param value the stored calendar date
 * @param timeZone zone that decides which day today is
 * @param now the instant "today" is read at (injectable for tests)
 */
export const isCalendarDateBeforeToday = (
  value: string | Date,
  timeZone: string,
  now: Date = new Date()
): boolean => {
  const day = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, CALENDAR_DATE_FORMAT.length)
    : formatInZone(value, timeZone, CALENDAR_DATE_FORMAT);

  return day < getTodayInZone(timeZone, now);
};
