import { MissionPhaseEnum, MissionStatusEnum, QuoteStatusEnum } from '@shared/domain-types';
import {
  canChangeMissionParties, canChangeMissionStatus, getMissionPhases, getNextMissionStatuses,
  isMissionPhaseOfStatus,
} from '@shared/domain-utils';
import { describe, expect, it } from 'vitest';

import {
  canLinkQuoteToMission, formatMissionAssigneeName, getMissionDatesToFill, isMissionEndBeforeStart,
  toBusinessDay,
} from './mission.utils';

/*
 * The mission trigger checks every save with the shared rules below (the back-office offers only the
 * same moves and phases): they are tested here, with the server's own date and quote rules.
 */
describe('moving a mission through its statuses', () => {
  it('should let a planned mission start or be cancelled', () => {
    expect(getNextMissionStatuses(MissionStatusEnum.PLANNED))
      .toEqual([MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.CANCELLED]);
  });

  it('should let a mission in progress be done or cancelled', () => {
    expect(canChangeMissionStatus(MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.DONE)).toBe(true);
    expect(canChangeMissionStatus(MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.CANCELLED)).toBe(true);
  });

  it('should never go back to an earlier status', () => {
    expect(canChangeMissionStatus(MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.PLANNED)).toBe(false);
    expect(canChangeMissionStatus(MissionStatusEnum.DONE, MissionStatusEnum.IN_PROGRESS)).toBe(false);
  });

  it('should never skip the start: a planned mission is not done at once', () => {
    expect(canChangeMissionStatus(MissionStatusEnum.PLANNED, MissionStatusEnum.DONE)).toBe(false);
  });

  it('should keep a done or cancelled mission where it is', () => {
    expect(getNextMissionStatuses(MissionStatusEnum.DONE)).toEqual([]);
    expect(getNextMissionStatuses(MissionStatusEnum.CANCELLED)).toEqual([]);
  });
});

describe('the phase of a mission', () => {
  it('should accept a phase of the current status', () => {
    expect(isMissionPhaseOfStatus(MissionPhaseEnum.TESTING, MissionStatusEnum.IN_PROGRESS)).toBe(true);
    expect(isMissionPhaseOfStatus(MissionPhaseEnum.WARRANTY, MissionStatusEnum.DONE)).toBe(true);
  });

  it('should refuse a phase of another status', () => {
    expect(isMissionPhaseOfStatus(MissionPhaseEnum.TESTING, MissionStatusEnum.PLANNED)).toBe(false);
    expect(isMissionPhaseOfStatus(MissionPhaseEnum.BY_CLIENT, MissionStatusEnum.DONE)).toBe(false);
  });

  it('should accept no phase at all, whatever the status', () => {
    expect(isMissionPhaseOfStatus(null, MissionStatusEnum.IN_PROGRESS)).toBe(true);
    expect(isMissionPhaseOfStatus(undefined, MissionStatusEnum.CANCELLED)).toBe(true);
  });

  it('should give each status its own phases, none shared', () => {
    const phases = Object.values(MissionStatusEnum).flatMap(getMissionPhases);

    expect(new Set(phases).size).toBe(phases.length);
    expect(phases).toHaveLength(Object.values(MissionPhaseEnum).length);
  });
});

describe('the client and the quote of a mission', () => {
  it('should change only while the mission is planned', () => {
    expect(canChangeMissionParties(MissionStatusEnum.PLANNED)).toBe(true);
    expect(canChangeMissionParties(MissionStatusEnum.IN_PROGRESS)).toBe(false);
    expect(canChangeMissionParties(MissionStatusEnum.DONE)).toBe(false);
  });

  it('should take an accepted quote of the same client', () => {
    expect(canLinkQuoteToMission({ status: QuoteStatusEnum.ACCEPTED, clientId: 'c1' }, 'c1')).toBe(true);
  });

  it('should refuse a quote that is not accepted', () => {
    expect(canLinkQuoteToMission({ status: QuoteStatusEnum.SENT, clientId: 'c1' }, 'c1')).toBe(false);
    expect(canLinkQuoteToMission({ status: QuoteStatusEnum.DRAFT, clientId: 'c1' }, 'c1')).toBe(false);
  });

  it('should refuse an accepted quote of another client', () => {
    expect(canLinkQuoteToMission({ status: QuoteStatusEnum.ACCEPTED, clientId: 'c2' }, 'c1')).toBe(false);
    const accepted = { status: QuoteStatusEnum.ACCEPTED, clientId: 'c1' };

    expect(canLinkQuoteToMission(accepted, undefined)).toBe(false);
  });
});

describe('the dates of a mission', () => {
  const now = new Date('2026-11-23T10:00:00Z');
  const typed = new Date('2026-11-20T00:00:00Z');

  it('should date the start of a mission that starts with an empty start date', () => {
    expect(getMissionDatesToFill(MissionStatusEnum.IN_PROGRESS, {}, now)).toEqual({ startDate: now });
  });

  it('should keep a start date typed by hand', () => {
    expect(getMissionDatesToFill(MissionStatusEnum.IN_PROGRESS, { startDate: typed }, now)).toEqual({});
  });

  it('should date the end of a mission that is done with an empty end date', () => {
    expect(getMissionDatesToFill(MissionStatusEnum.DONE, { startDate: typed }, now))
      .toEqual({ endDate: now });
  });

  it('should keep an end date typed by hand', () => {
    expect(getMissionDatesToFill(MissionStatusEnum.DONE, { startDate: typed, endDate: typed }, now))
      .toEqual({});
  });

  it('should fill no date when a mission is cancelled', () => {
    expect(getMissionDatesToFill(MissionStatusEnum.CANCELLED, {}, now)).toEqual({});
  });

  it('should refuse an end before the start', () => {
    expect(isMissionEndBeforeStart(new Date('2026-11-20'), new Date('2026-11-19'), 'UTC')).toBe(true);
  });

  it('should accept an end on the same day as the start, whatever the hour', () => {
    expect(isMissionEndBeforeStart(
      new Date('2026-11-20T14:00:00Z'), new Date('2026-11-20T00:00:00Z'), 'UTC'
    )).toBe(false);
  });

  it('should accept a mission with no start or no end', () => {
    expect(isMissionEndBeforeStart(null, new Date('2026-11-19'), 'UTC')).toBe(false);
    expect(isMissionEndBeforeStart(new Date('2026-11-19'), undefined, 'UTC')).toBe(false);
  });

  it('should read the day where the business works, not in UTC', () => {
    expect(toBusinessDay(new Date('2026-11-23T22:30:00Z'), 'Indian/Antananarivo')).toBe('2026-11-24');
  });
});

describe('the name a teammate is shown under', () => {
  it('should join the first and last names', () => {
    expect(formatMissionAssigneeName({ firstName: 'Jean', lastName: 'Rabe', email: 'j@x.mg' }))
      .toBe('Jean Rabe');
  });

  it('should fall back on the e-mail when the account has no name', () => {
    expect(formatMissionAssigneeName({ email: 'j@x.mg' })).toBe('j@x.mg');
  });
});
