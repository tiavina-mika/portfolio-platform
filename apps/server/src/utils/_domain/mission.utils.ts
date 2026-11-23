import { MissionStatusEnum, QuoteStatusEnum } from '@shared/domain-types';

/** the dates a status change fills, when the mission does not hold them yet */
export type MissionDates = {
  startDate?: Date | null;
  endDate?: Date | null;
};

/**
 * The calendar day of a moment where the business works, as `YYYY-MM-DD`, so two moments of the same
 * day compare equal whatever their hour.
 * @example toBusinessDay(new Date('2026-11-23T22:30:00Z'), 'Indian/Antananarivo') => '2026-11-24'
 */
export const toBusinessDay = (date: Date, timeZone: string): string => (
  // the Canadian English format is the ISO one: year, month, day
  new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
);

/**
 * Whether a mission would end before it starts. Compared by day: a mission started at 2 p.m. and
 * finished the same day, typed as that day at midnight, is not refused.
 * @example isMissionEndBeforeStart(new Date('2026-11-20'), new Date('2026-11-19'), 'UTC') => true
 */
export const isMissionEndBeforeStart = (
  startDate: Date | null | undefined, endDate: Date | null | undefined, timeZone: string
): boolean => {
  if (!startDate || !endDate) return false;

  return toBusinessDay(endDate, timeZone) < toBusinessDay(startDate, timeZone);
};

/**
 * The dates a status change fills: starting a mission dates its start, finishing it dates its end,
 * each only when the box is still empty — a date typed by hand is kept.
 * @param to the status the mission moves to
 * @param dates the dates it holds
 * @param now the moment of the change
 * @returns only the dates to set, nothing when there is none
 */
export const getMissionDatesToFill = (
  to: MissionStatusEnum, { startDate, endDate }: MissionDates, now: Date
): MissionDates => {
  if (to === MissionStatusEnum.IN_PROGRESS && !startDate) return { startDate: now };
  if (to === MissionStatusEnum.DONE) {
    // a mission done straight from a start never dated is dated on both sides
    return {
      ...(startDate ? {} : { startDate: now }),
      ...(endDate ? {} : { endDate: now }),
    };
  }

  return {};
};

/**
 * Whether a quote may be the one a mission carries out: an accepted quote, written for the client of
 * the mission.
 * @param quote the status and the client id of the quote
 * @param clientId the client of the mission
 */
export const canLinkQuoteToMission = (
  quote: { status: QuoteStatusEnum; clientId?: string }, clientId: string | undefined
): boolean => quote.status === QuoteStatusEnum.ACCEPTED && !!clientId && quote.clientId === clientId;

/**
 * The name a teammate is shown under: first and last name, the e-mail when the account has neither.
 * @example formatMissionAssigneeName({ firstName: 'Jean', lastName: 'Rabe', email: 'j@x.mg' }) => 'Jean Rabe'
 */
export const formatMissionAssigneeName = (
  { firstName, lastName, email }: { firstName?: string; lastName?: string; email?: string }
): string => [firstName, lastName].filter(Boolean).join(' ').trim() || email || '';
