/**
 * Day of a ride, in the page language and on the clock of its departure place: `dim. 12 avril`.
 * The zone is the ride's, not the visitor's, so a relative abroad reads the same day as the people
 * in the car.
 * @param isoDate ISO date
 * @param locale page locale
 * @param timeZone IANA zone of the departure place
 */
export const formatRideDay = (isoDate: string, locale: string, timeZone: string): string =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(new Date(isoDate));

/**
 * Publication day of a content, short, in the page language: `12 sept. 2026`.
 * @param isoDate ISO date
 * @param locale page locale
 */
export const formatShortDate = (isoDate: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));

/**
 * Time of a ride event on a 24-hour clock, on the clock of the departure place: `06:30`.
 * @param isoDate ISO date
 * @param locale page locale
 * @param timeZone IANA zone of the departure place
 */
export const formatRideTime = (isoDate: string, locale: string, timeZone: string): string =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(isoDate));
