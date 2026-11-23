import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { TargetEnum } from '@shared/types';

import type { MissionAssignee, MissionInput } from '@/types/mission.type';

import { translate } from '@/config/i18n';
import {
  changeMissionStatusSchema, createMissionSchema, getMissionAssigneesSchema, getMissionSchema,
  getMissionsSchema, missionInputSchema, updateMissionSchema,
} from '@/validations/_domain/mission.validations';

import {
  changeMissionStatusService, getMissionAssigneesService, getMissionByIdService, getMissionsService,
  saveMissionService,
} from '../../services/_domain/mission.service.cloud';
import { resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * The missions exist in the Aldaron workspace only: every function first checks that the account's
 * roles open it, then `fromBO` checks the right on the collection. Both apply — holding Aldaron opens
 * the workspace, not every action in it. No function deletes a mission: it stays as history.
 */
const assertAgencyWorkspace = (request: Parse.Cloud.FunctionRequest): Promise<TargetEnum> => (
  resolveWorkspace(request.user, TargetEnum.AGENCY, request.params.locale)
);

// the mission named by the request, or the translated "not found" error
const getMissionOrThrow = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const mission = await getMissionByIdService(request.params.id);

  if (!mission) throw new Error(translate('mission.notFound', request.params.locale));

  return mission;
};

// the typed fields, as the validation leaves them (trimmed, empty boxes turned into `null`)
const toMissionInput = (params: Record<string, unknown>): MissionInput => missionInputSchema.parse(params);

Parse.Cloud.define(
  'getMissions',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest) => {
      await assertAgencyWorkspace(request);

      return getMissionsService(request.params as Parameters<typeof getMissionsService>[0], request.user);
    },
    ['find'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(getMissionsSchema)
);

Parse.Cloud.define(
  'getMission',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
      await assertAgencyWorkspace(request);

      return getMissionByIdService(request.params.id);
    },
    ['get'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(getMissionSchema)
);

// a new mission, often from an accepted quote: whether that quote may be the mission's is the trigger's
Parse.Cloud.define(
  'createMission',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      return saveMissionService(toMissionInput(request.params), request.user!, request.params.locale);
    },
    ['create'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(createMissionSchema)
);

Parse.Cloud.define(
  'updateMission',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const mission = await getMissionOrThrow(request);
      const { locale } = request.params;

      return saveMissionService(toMissionInput(request.params), request.user!, locale, mission);
    },
    ['update'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(updateMissionSchema)
);

// starting, finishing or cancelling a mission: an edit of its status, which only moves forward
Parse.Cloud.define(
  'changeMissionStatus',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const mission = await getMissionOrThrow(request);
      const { status, locale } = request.params;

      return changeMissionStatusService(mission, status, request.user!, locale);
    },
    ['update'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(changeMissionStatusSchema)
);

// the teammates the mission form proposes: reading the missions is enough to see who they can go to
Parse.Cloud.define(
  'getMissionAssignees',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<MissionAssignee[]> => {
      await assertAgencyWorkspace(request);

      return getMissionAssigneesService();
    },
    ['find'],
    DOMAIN_COLLECTIONS.mission
  ),
  parseFunctionValidation(getMissionAssigneesSchema)
);
