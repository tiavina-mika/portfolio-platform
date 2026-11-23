import { MISSION_DESCRIPTION_MAX_LENGTH, MISSION_TITLE_MAX_LENGTH } from '@shared/domain-constants';
import { MissionPhaseEnum, MissionStatusEnum } from '@shared/domain-types';
import { z } from 'zod';

import { MISSION_LIST_MAX_LIMIT } from '@/constants/_domain/mission.constants';

import {
  localeFieldSchema, objectIdFieldSchema, paginationQuerySchema, workspaceFieldSchema,
} from '../_core/util.validations';

/*
 * a date the Parse SDK sends as a `Date`, or a call made by hand as an ISO string; an empty value
 * comes back as `null`, which unsets the column
 */
const optionalDateSchema = z.union([z.date(), z.iso.datetime().transform((value) => new Date(value))])
  .nullish()
  .transform((value) => value ?? null);

// an optional pointer, sent as the id of the object; an empty picker means none
const optionalIdSchema = z.string().trim().nullish().transform((value) => value || null);

/*
 * the fields a back-office user types. Strict: the status and the authors are refused rather than
 * silently stored, so a faulty or forged call cannot impose them. Whether the phase belongs to the
 * status, the quote to the client and the end comes after the start are the trigger's checks, which
 * hold for every save
 */
const missionFieldsSchema = {
  title: z.string().trim().min(1).max(MISSION_TITLE_MAX_LENGTH),
  client: objectIdFieldSchema,
  quote: optionalIdSchema,
  assignee: optionalIdSchema,
  phase: z.enum(MissionPhaseEnum).nullish().transform((value) => value ?? null),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  description: z.string().trim().max(MISSION_DESCRIPTION_MAX_LENGTH)
    .nullish()
    .transform((value) => value || null),
};

/**
 * the typed fields alone, read off an already validated request: the other params (`id`, `locale`…)
 * are dropped, and the values come out trimmed with their empty boxes turned into `null`
 */
export const missionInputSchema = z.object(missionFieldsSchema);

// sent by every back-office call: the language of the error messages and the workspace worked in
const requestFieldsSchema = {
  locale: localeFieldSchema.optional(),
  workspace: workspaceFieldSchema,
};

export const createMissionSchema = z.strictObject({
  ...missionFieldsSchema,
  ...requestFieldsSchema,
});

export const updateMissionSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...missionFieldsSchema,
  ...requestFieldsSchema,
});

/*
 * the one way a mission moves: `planned` is where it starts, so it is never a target. Which move is
 * allowed from where the mission stands is the trigger's check
 */
export const changeMissionStatusSchema = z.strictObject({
  id: objectIdFieldSchema,
  status: z.enum([MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.DONE, MissionStatusEnum.CANCELLED]),
  ...requestFieldsSchema,
});

export const getMissionSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...requestFieldsSchema,
});

// the teammates a mission can be given to: nothing to narrow, the team is small
export const getMissionAssigneesSchema = z.strictObject({
  ...requestFieldsSchema,
});

const missionsFiltersSchema = z.object({
  status: z.enum(MissionStatusEnum).optional(),
}).optional();

const missionsSearchSchema = z.object({
  // the search box: a part of the title
  text: z.string().optional(),
  // "my missions": the ones given to the signed-in user, read from the session, never from an id sent
  mine: z.boolean().optional(),
}).optional();

export const getMissionsSchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().nonnegative().max(MISSION_LIST_MAX_LIMIT),
  filters: missionsFiltersSchema,
  search: missionsSearchSchema,
  ...requestFieldsSchema,
});
