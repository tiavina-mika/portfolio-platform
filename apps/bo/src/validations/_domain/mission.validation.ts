import { MISSION_DESCRIPTION_MAX_LENGTH, MISSION_TITLE_MAX_LENGTH } from '@shared/domain-constants';
import { MissionPhaseEnum } from '@shared/domain-types';
import { z } from 'zod';

import i18n from '@/config/i18n';
import { tabRouteSearchParams } from '@/validations/_core/app.validations';

export const missionsRouteSearchParams = tabRouteSearchParams;

export type MissionsRouteSearchParams = z.infer<typeof missionsRouteSearchParams>;

// a calendar day as a number that orders like the days themselves: 2026-11-23 → 20261123
const toDayValue = (date: Date): number => (
  (date.getFullYear() * 10_000) + ((date.getMonth() + 1) * 100) + date.getDate()
);

export const missionSchema = z.object({
  client: z.string().min(1),
  title: z.string().trim().min(1).max(MISSION_TITLE_MAX_LENGTH),
  quote: z.string().nullish(),
  assignee: z.string().nullish(),
  phase: z.enum(MissionPhaseEnum).nullish(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  description: z.string().trim().max(MISSION_DESCRIPTION_MAX_LENGTH).optional(),
}).refine(
  /*
   * the server refuses it too: said here before anything is sent. Compared by day, as the server does —
   * a start the server dated at 2 p.m. and an end picked as that same day are not refused
   */
  ({ startDate, endDate }) => !startDate || !endDate || toDayValue(endDate) >= toDayValue(startDate),
  { path: ['endDate'], message: i18n.t('project:mission.endBeforeStart') }
);

// the advanced search: every mission, or only the ones given to the signed-in user
export const missionFilterSchema = z.object({
  mine: z.boolean().optional(),
});

export type MissionFiltersInput = z.infer<typeof missionFilterSchema>;
