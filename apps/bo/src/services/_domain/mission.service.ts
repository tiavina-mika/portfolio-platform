import Parse from 'parse';

import type { MissionStatusEnum } from '@shared/domain-types';
import type { TargetEnum } from '@shared/types';

import { Locale } from '@/types/_core/setting.type';
import {
  IMission, IMissionAssignee, IMissionInput, IMissionQuote,
} from '@/types/_domain/mission.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

/*
 * Every mission call goes through a Cloud Function: the server checks the Aldaron workspace there,
 * which a direct query could not. The workspace and the language travel with each call.
 */
type RequestContext = { locale: Locale; workspace: TargetEnum };

// `toJSON` writes a stored date as a `{ __type, iso }` object: the dates are read off the object instead
const toISODate = (mission: Parse.Object, field: string): string | undefined => (
  (mission.get(field) as Date | undefined)?.toISOString()
);

const toMissionQuote = (quote: Parse.Object | undefined): IMissionQuote | undefined => (
  quote
    ? {
      id: quote.id ?? '',
      number: quote.get('number') ?? '',
      version: quote.get('version') ?? 1,
      title: quote.get('title') ?? '',
    }
    : undefined
);

const toMissionAssignee = (user: Parse.Object | undefined): IMissionAssignee | undefined => {
  if (!user) return undefined;

  const name = [user.get('firstName'), user.get('lastName')].filter(Boolean).join(' ');
  const email = user.get('email') ?? '';

  return { id: user.id ?? '', name: name || email, email };
};

// the pointed objects come back as nested Parse objects: the list only needs what it shows of them
const toMission = (mission: Parse.Object): IMission => {
  const client = mission.get('client');

  return {
    ...toJSONWithId<IMission>(mission),
    client: { id: client?.id, name: client?.get('name') ?? '', email: client?.get('email') ?? '' },
    quote: toMissionQuote(mission.get('quote')),
    assignee: toMissionAssignee(mission.get('assignee')),
    startDate: toISODate(mission, 'startDate'),
    endDate: toISODate(mission, 'endDate'),
  };
};

export const fetchMissions = async ({
  limit, skip, orderBy, order, filters, search, locale, workspace,
}: {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
} & RequestContext): Promise<{ results: IMission[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getMissions', {
    limit, skip, orderBy, order, filters, search, locale, workspace,
  });

  return { results: result.results.map(toMission), count: result.count };
};

export const createMission = async (values: IMissionInput, context: RequestContext): Promise<IMission> => {
  const mission = await Parse.Cloud.run('createMission', { ...values, ...context });

  return toMission(mission);
};

export const updateMission = async (
  id: string, values: IMissionInput, context: RequestContext
): Promise<IMission> => {
  const mission = await Parse.Cloud.run('updateMission', { id, ...values, ...context });

  return toMission(mission);
};

export const changeMissionStatus = async (
  id: string, status: MissionStatusEnum, context: RequestContext
): Promise<IMission> => {
  const mission = await Parse.Cloud.run('changeMissionStatus', { id, status, ...context });

  return toMission(mission);
};

/** the teammates a mission can be given to: the members of the roles that open the Aldaron workspace */
export const fetchMissionAssignees = async (context: RequestContext): Promise<IMissionAssignee[]> => (
  Parse.Cloud.run('getMissionAssignees', { ...context })
);
