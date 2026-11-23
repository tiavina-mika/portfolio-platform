import { MISSION_TITLE_MAX_LENGTH } from '@shared/domain-constants';
import { MissionPhaseEnum, MissionStatusEnum } from '@shared/domain-types';
import { describe, expect, it } from 'vitest';

import { MISSION_LIST_MAX_LIMIT } from '@/constants/_domain/mission.constants';

import {
  changeMissionStatusSchema, createMissionSchema, getMissionsSchema, missionInputSchema,
  updateMissionSchema,
} from './mission.validations';
import { getQuotesSchema } from './quote.validations';

const validMission = { title: 'Mobile app', client: 'client1' };

describe('writing a mission from the back-office', () => {
  it('should accept a mission with a title and a client', () => {
    expect(createMissionSchema.safeParse(validMission).success).toBe(true);
  });

  it('should accept the quote, the assignee, a phase, the dates and a description', () => {
    const mission = {
      ...validMission,
      quote: 'quote1',
      assignee: 'user1',
      phase: MissionPhaseEnum.SCHEDULED,
      startDate: '2026-11-23T00:00:00.000Z',
      endDate: new Date('2026-12-23'),
      description: 'Two screens',
    };

    expect(createMissionSchema.safeParse(mission).success).toBe(true);
  });

  it('should refuse a mission with no client or no title', () => {
    expect(createMissionSchema.safeParse({ title: 'Mobile app' }).success).toBe(false);
    expect(createMissionSchema.safeParse({ client: 'client1', title: '  ' }).success).toBe(false);
  });

  it('should refuse a title longer than a mission may hold', () => {
    const title = 'a'.repeat(MISSION_TITLE_MAX_LENGTH + 1);

    expect(createMissionSchema.safeParse({ ...validMission, title }).success).toBe(false);
  });

  it('should refuse a status sent with the fields: a mission moves only through its status change', () => {
    const withStatus = { ...validMission, status: MissionStatusEnum.DONE };

    expect(createMissionSchema.safeParse(withStatus).success).toBe(false);
    expect(updateMissionSchema.safeParse({
      ...validMission, id: 'mission1', status: MissionStatusEnum.DONE,
    }).success).toBe(false);
  });

  it('should refuse a phase that does not exist', () => {
    expect(createMissionSchema.safeParse({ ...validMission, phase: 'onHold' }).success).toBe(false);
  });

  it('should turn the empty boxes into nothing stored', () => {
    const input = missionInputSchema.parse({
      ...validMission, quote: '', assignee: null, description: '', startDate: undefined,
    });

    expect(input).toMatchObject({
      quote: null, assignee: null, description: null, startDate: null, endDate: null, phase: null,
    });
  });
});

describe('moving a mission', () => {
  it('should start, finish or cancel a mission', () => {
    [MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.DONE, MissionStatusEnum.CANCELLED].forEach((status) => {
      expect(changeMissionStatusSchema.safeParse({ id: 'mission1', status }).success).toBe(true);
    });
  });

  it('should never take a mission back to planned', () => {
    expect(changeMissionStatusSchema.safeParse({ id: 'mission1', status: MissionStatusEnum.PLANNED }).success)
      .toBe(false);
  });
});

describe('the mission list', () => {
  it('should accept "my missions"', () => {
    expect(getMissionsSchema.safeParse({ limit: 10, skip: 0, search: { mine: true } }).success).toBe(true);
  });

  it('should refuse a page larger than the list allows', () => {
    expect(getMissionsSchema.safeParse({ limit: MISSION_LIST_MAX_LIMIT + 1, skip: 0 }).success).toBe(false);
  });

  it('should refuse an assignee id sent by the browser instead of "my missions"', () => {
    const result = getMissionsSchema.safeParse({ limit: 10, skip: 0, search: { mine: 'user1' } });

    expect(result.success).toBe(false);
  });
});

describe('the accepted quotes of one client, for the mission form', () => {
  it('should narrow the quote list on a client', () => {
    const params = { limit: 10, skip: 0, filters: { status: 'accepted', client: 'client1' } };

    expect(getQuotesSchema.safeParse(params).success).toBe(true);
  });
});
