import { LANGUAGES, type LanguageCode } from '@shared/constants';
import { type DateType } from '@shared/types';
import dayjs from 'dayjs';
import 'dayjs/locale/de.js';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(updateLocale);

export type Locale = LanguageCode | '';

export type { DateType };

export const dateToUnix = (date: Date): number => {
  const unix = dayjs.utc(date).valueOf();

  return unix;
};

export const unixToDate = (unix: number): Date => {
  const day = dayjs.utc(unix).toDate();

  return day;
};

export const toDayJsDate = (date?: Date): Date => {
  if (date) {
    return dayjs(date).toDate();
  }

  const now = dayjs().toDate();

  return now;
};

/**
 * The dayjs locale that writes the dates of a language: the one it declares, French for an unknown
 * or empty one.
 */
export const getDayjsLocale = (locale?: Locale): string => (
  locale ? LANGUAGES[locale]?.dayjsLocale : undefined
) ?? LANGUAGES.fr.dayjsLocale;

/**
 * translate basic date worlds depending on language
 * for mg language, it is not available in dayjs locales, so I hack it with other language (de here)
 * @param locale
 */
export const translateDateLocale = (locale: Locale): void => {
  switch (locale) {
    case 'en':
      dayjs.updateLocale('en', {
        relativeTime: {
          future: 'in %s',
          past: '%s ago',
          s: 'a few seconds',
          m: 'a minute',
          mm: '%d minutes',
          h: 'an hour',
          hh: '%d hours',
          d: 'a day',
          dd: '%d days',
          M: 'a month',
          MM: '%d months',
          y: 'a year',
          yy: '%d years',
        },
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        months: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        calendar: {
          lastDay: '[Yesterday at] LT',
          sameDay: '[Today at] LT',
          nextDay: '[Tomorrow at] LT',
          lastWeek: '[last] dddd [at] LT',
          nextWeek: 'dddd [at] LT',
          sameElse: 'L',
        },
      });
      break;
    case 'mg':
      dayjs.updateLocale('de', {
        relativeTime: {
          future: 'afaka %s',
          past: '%s lasa',
          s: 'segondra kely',
          m: 'iray minitra',
          mm: '%d minitra',
          h: 'ora iray',
          hh: '%d ora',
          d: 'iray andro',
          dd: '%d andro',
          M: 'iray volana',
          MM: '%d volana',
          y: 'iray taona',
          yy: '%d taona',
        },
        weekdaysShort: ['Alah', 'Alat', 'Tal', 'Alar', 'Alak', 'Zoma', 'Sab'],
        weekdays: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'],
        months: [
          'Janoary',
          'Febroary',
          'Martsa',
          'Aprily',
          'May',
          'Jona',
          'Jolay',
          'Aogositra',
          'Septambra',
          'Oktobra',
          'Novambra',
          'Desambra',
        ],
        calendar: {
          lastDay: '[Omaly t@] LT',
          sameDay: '[Androany t@] LT',
          nextDay: '[Rahampitso @] LT',
          lastWeek: '[farany teo] dddd [t@] LT',
          nextWeek: 'dddd [@] LT',
          sameElse: 'L',
        },
      });
      break;
    default:
      dayjs.updateLocale('fr', {
        relativeTime: {
          future: 'dans %s',
          past: 'il y a %s',
          s: 'quelques secondes',
          m: 'une minute',
          mm: '%d minutes',
          h: 'une heure',
          hh: '%d heures',
          d: 'un jour',
          dd: '%d jours',
          M: 'un mois',
          MM: '%d mois',
          y: 'un an',
          yy: '%d ans',
        },
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        monthsShort: ['Janv', 'Fevr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec'],
        months: [
          'Janvier',
          'Fevrier',
          'Mars',
          'Avril',
          'Mai',
          'Juin',
          'Juillet',
          'Aout',
          'Septembre',
          'Octobre',
          'Novembre',
          'Decembre',
        ],
        calendar: {
          lastDay: '[Hier à] LT',
          sameDay: '[Ajourd\'hui à] LT',
          nextDay: '[Demain à] LT',
          lastWeek: '[dernier] dddd [à] LT',
          nextWeek: 'dddd [à] LT',
          sameElse: 'L',
        },
      });
      break;
  }
};

/**
 * format hour unix (number) type to string
 * @param date
 * @param withHourLabel
 * @returns
 */
export const displayHour = (date: DateType, withHourLabel = true): string => {
  const format = withHourLabel ? 'HH[h]mm' : 'HH:mm';
  const formattedDate = dayjs(date).format(format);

  return formattedDate;
};
