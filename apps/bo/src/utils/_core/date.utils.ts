
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';

import i18n from '@/config/i18n';
import { Locale, Locales } from '@/types/_core/setting.type';
import { DateType, IParseServerDate } from '@/types/_core/utils.type';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

/**
 * return date from parse server database date
 * parse an object to date
 * @param date
 * @returns
 */
export const parseServerDateToDate = (date: IParseServerDate): Date => dayjs(date.iso).toDate();

/**
 * A date as every formatter reads it, whichever way it arrived: a date nested inside a stored object
 * comes back in Parse's wrapped `{ __type: 'Date', iso }` form, where a date column comes back plain.
 */
export const getParseDateValue = <T>(date: T | IParseServerDate): T | IParseServerDate['iso'] => (
  (date as IParseServerDate)?.iso ?? (date as T)
);

export const isBeforeCurrentDate = (date: DateType): boolean => dayjs().isBefore(dayjs(date));

/**
 * format date to display depending to current year
 * @param date
 * @returns
 */
export const formatDate = (
  date: DateType | IParseServerDate,
  onlyHour = false,
  isParseServerDate = false
): string => {
  let newDate = date;

  // if the date is a object with iso field
  if (isParseServerDate) {
    newDate = parseServerDateToDate(date as IParseServerDate);
  }

  if (onlyHour) {
    return dayjs(newDate as DateType).format('HH:mm');
  }
  const currentYear = dayjs().year();
  const year = dayjs(newDate as DateType).year();
  let format;

  // other date than current year
  if (year !== currentYear) {
    format = 'DD MMM YYYY';
  }
  else {
    // the word joining day and time is translated; brackets keep dayjs from reading it as tokens
    format = `DD MMM [${i18n.t('common:at')}] HH:mm`;
  }

  return dayjs(newDate as DateType).format(format);
};

/**
 * get (translated) date from now format (ago)
 * @param date
 * @returns
 */
export const fromNow = (date: DateType, custom = false): any => {
  const dateNow = dayjs();
  const selectedDate = dayjs(date);
  const defaultFromNow = selectedDate.fromNow();
  const diff = dateNow.diff(selectedDate, 'hour');

  // different format if later than 24 hours
  if (diff > 24 && custom) {
    return formatDate(selectedDate);
  }
  return defaultFromNow;
};

/**
 * get date format depending of the app language
 * @param locale app language
 * @returns
 */
export const getDateFormatByLocale = (locale: Locale, withHour = false): string => {
  let dateFormat = 'DD/MM/YYYY';

  // english / american format
  if (locale === Locales.ENGLISH) {
    dateFormat = 'YYYY/MM/DD';
  }

  if (withHour) {
    dateFormat += i18n.t('common:at') + ' hh:mm';
  }

  // malagasy and french format
  return dateFormat;
};

/**
 * add the selected date from the date picker to another input value
 * @param form react hook form form props
 * @param name name of the field
 * @param locale app language
 * @returns string
 */
export const formatDateInputToString = (form: Record<string, any>, name: string, locale: Locale): string => {
  const format = getDateFormatByLocale(locale);
  // get all values of the form
  const values = form.getValues();
  // get the value of the current date field
  const value = values[name];
  const stringifiedDate = dayjs(value).format(format);

  return stringifiedDate;
};

export const formatTimeInputToString = (form: Record<string, any>, name: string): string => {
  const values = form.getValues();
  // get the value of the current date field
  const value = values[name];
  const stringifiedDate = dayjs(value).format('HH[h]mm');

  return stringifiedDate;
};

/**
 * get date format depending on the current year and locale
 * @param date
 * @param withHour show hour
 * @param isMonthsShort show 3 to 4 first month name
 * @param forceDisplayYear force display year even if it is the current year
 * @returns
 */
const getFormat = (
  date: DateType,
  withHour: boolean,
  isMonthsShort: boolean,
  forceDisplayYear: boolean
): string => {
  if (isMonthsShort) {
    // short month name with hour
    if (withHour) return i18n.t('common:monthsShortFormat');
    // short month name without hour
    return i18n.t('common:dateOnlyFormat');
  }

  const currentYear = dayjs().year();
  const year = dayjs(date).year();

  // display year even if it is the current year
  if (forceDisplayYear) {
    return i18n.t('common:monthsShortDateOnlyFormat');
  }

  // do not display year if it is the current year
  if (year !== currentYear) {
    return withHour
      ? i18n.t('common:monthsShortFormat')
      : i18n.t('common:dateOnlyFormat');
  }

  // date with hour and full month name
  return withHour
    ? i18n.t('common:monthsShortCurrentYearFormat')
    : i18n.t('common:monthsShortCurrentYearFormatOnlyFormat');
};

/**
 * display date with translated format
 * @param date
 * @param withHour show hour
 * @param isMonthsShort show 3 to 4 first month name
 * @param forceDisplayYear force display year even if it is the current year
 * @returns
 */
export const displayDate = (
  date: DateType,
  withHour = true,
  isMonthsShort = false,
  forceDisplayYear = false
): string => {
  const format = getFormat(date, withHour, isMonthsShort, forceDisplayYear);
  const formattedDate = dayjs(date).format(format);

  return formattedDate;
};

/**
 * calculate age by birthday
 * @param date
 * @returns
 */
export const getAgeByBirthday = (date: DateType): number => {
  const dayjsDate = dayjs(date);
  const age = dayjs().diff(dayjsDate, 'year');

  return age;
};

export const isPastDate = (date: DateType): boolean => dayjs().isBefore(dayjs(date));
export const isBeforeDate = (start: DateType, end: DateType): boolean => dayjs(end).isBefore(dayjs(start));
export const isDateExpired = (date: DateType): boolean => dayjs().isAfter(dayjs(date));

export const minToHourOrDay = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} j`;
};

export const hoursToHourOrDay = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (hours < 24) {
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }
  return `${Math.floor(hours / 24)} j`;
};
