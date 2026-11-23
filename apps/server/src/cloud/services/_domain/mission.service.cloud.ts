import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { TargetEnum } from '@shared/types';
import sortBy from 'lodash/sortBy.js';
import uniqBy from 'lodash/uniqBy.js';

import type { Locale } from '@/types/app.type';
import type { MissionAssignee, MissionInput } from '@/types/mission.type';
import type { MissionStatusEnum } from '@shared/domain-types';

import { collections, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  MISSION_ASSIGNEE_ROLES_LIMIT, MISSION_ASSIGNEES_PER_ROLE_LIMIT, MISSION_EDITABLE_FIELDS,
  MISSION_INCLUDED_POINTERS, MISSION_LIST_FIELDS, MISSION_ORDER_FIELDS, MISSION_POINTER_FIELDS,
} from '@/constants/_domain/mission.constants';
import { escapeText, setValues } from '@/utils/_core/utils';
import { formatMissionAssigneeName } from '@/utils/_domain/mission.utils';

import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';

type MissionsParams = {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: { status?: MissionStatusEnum };
  search?: { text?: string; mine?: boolean };
};

// the class each pointer field of a mission points to
const POINTER_CLASSES: Record<(typeof MISSION_POINTER_FIELDS)[number], string> = {
  client: DOMAIN_COLLECTIONS.client,
  quote: DOMAIN_COLLECTIONS.quote,
  assignee: collections.User,
};

const buildMissionQuery = () => new Parse.Query(DOMAIN_COLLECTIONS.mission);

/*
 * a master-key save carries no session: the `beforeSave` trigger reads the author and the language
 * of its refusals from the context instead
 */
const buildSaveContext = (user: Parse.User, locale?: Locale) => ({ userId: user.id, locale });

/**
 * The missions of the back-office list, narrowed by the search box, the tab and "my missions", each
 * with the name of its client, its quote and its assignee read through the pointers.
 * @param user the signed-in user: "my missions" are the ones given to them
 * @returns the page of missions with the total count of the narrowed list
 */
export const getMissionsService = async (
  {
    limit, skip, orderBy, order, filters, search,
  }: MissionsParams,
  user: Parse.User | undefined
): Promise<Record<string, any>> => {
  const query = buildMissionQuery();

  // a part of the title, whatever the case
  if (search?.text) query.matches('title', escapeText(search.text));

  if (search?.mine) {
    // no session (a master-key call) has no mission of its own
    if (!user) return { results: [], count: 0 };
    query.equalTo('assignee', convertIdToPointer<Parse.User>(collections.User, user.id));
  }

  // one tab per status; the "all" tab sends none
  if (filters?.status) query.equalTo('status', filters.status);

  const sortField = orderBy && MISSION_ORDER_FIELDS.includes(orderBy) ? orderBy : 'updatedAt';

  if (order === 'asc') query.ascending(sortField);
  else query.descending(sortField);

  const result: Record<string, any> = await query
    .include(MISSION_INCLUDED_POINTERS)
    .select(MISSION_LIST_FIELDS)
    .limit(limit)
    .skip(skip)
    .withCount()
    .find(USE_MASTER_KEY);

  return result;
};

/**
 * One mission, whatever its status, with what the list shows of its client, quote and assignee.
 * @returns the mission, or `false` when there is none: `false` rather than `undefined`, which the
 * Parse client would read as a successful empty answer
 */
export const getMissionByIdService = async (id: string): Promise<Parse.Object | false> => {
  const mission = await buildMissionQuery()
    .include(MISSION_INCLUDED_POINTERS)
    .select(MISSION_LIST_FIELDS)
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY);

  return mission ?? false;
};

/**
 * Whether a client is named on at least one mission, whatever its status: such a client carries a
 * history and is archived, never deleted.
 */
export const hasClientMissionsService = async (client: Parse.Object): Promise<boolean> => {
  const mission = await buildMissionQuery()
    .select([])
    .equalTo('client', client)
    .first(USE_MASTER_KEY);

  return !!mission;
};

/**
 * Creates a planned mission, or writes the typed fields of an existing one. The status, the dates a
 * move fills and every consistency check (quote, client, phase, dates, assignee) are the `beforeSave`
 * trigger's job, so they hold for every way a mission is saved.
 * @param values the validated fields; a `null` unsets the column
 * @param user the back-office user who saves it
 * @param locale the language of a refusal
 * @param mission the mission edited, left out to create one
 */
export const saveMissionService = async (
  values: MissionInput,
  user: Parse.User,
  locale: Locale | undefined,
  mission?: Parse.Object
): Promise<Parse.Object> => {
  const parseMission = mission ?? new Parse.Object(DOMAIN_COLLECTIONS.mission);
  const pointerFields: readonly string[] = MISSION_POINTER_FIELDS;

  setValues(parseMission, values, MISSION_EDITABLE_FIELDS.filter((field) => !pointerFields.includes(field)));

  // only a changed pointer is written, so an unchanged one is not seen as a change by the trigger
  MISSION_POINTER_FIELDS.forEach((field) => {
    const id = values[field];

    if (parseMission.get(field)?.id === (id ?? undefined)) return;
    if (id) parseMission.set(field, convertIdToPointer(POINTER_CLASSES[field], id));
    else parseMission.unset(field);
  });

  const saved = await parseMission.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });

  // read again so the answer carries the names, as the list shows them
  return (await getMissionByIdService(saved.id)) || saved;
};

/**
 * Moves a mission to another status. Whether the move is allowed, the dates it fills and the phase it
 * clears are the trigger's.
 */
export const changeMissionStatusService = async (
  mission: Parse.Object, status: MissionStatusEnum, user: Parse.User, locale: Locale | undefined
): Promise<Parse.Object> => {
  mission.set('status', status);

  const saved = await mission.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });

  return (await getMissionByIdService(saved.id)) || saved;
};

/**
 * The account a mission is given to, nothing of it but its id: whether it may work in the Aldaron
 * workspace is read from its roles afterwards.
 * @returns the user, or `undefined` when there is none
 */
export const getMissionAssigneeUserService = async (id: string): Promise<Parse.User | undefined> => (
  new Parse.Query(Parse.User)
    .select([])
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY)
);

/**
 * The teammates a mission can be given to: the users of the roles that open the Aldaron workspace, and
 * of the highest roles, which open every workspace. Read here rather than through the user list, which
 * a delivery role has no right to read. A role's members live in a relation, read one role at a time:
 * a team holds a handful of roles.
 * @returns name and e-mail of each teammate, once each, by name
 */
export const getMissionAssigneesService = async (): Promise<MissionAssignee[]> => {
  const roles = await Parse.Query.or(
    new Parse.Query(Parse.Role).equalTo('workspaces', TargetEnum.AGENCY),
    new Parse.Query(Parse.Role).containedIn('name', HIGHEST_LEVEL_ROLES)
  )
    .select(['name'])
    .limit(MISSION_ASSIGNEE_ROLES_LIMIT)
    .find(USE_MASTER_KEY);

  const usersByRole = await Promise.all(roles.map((role) => (
    role.relation('users').query()
      .select(['firstName', 'lastName', 'email'])
      .limit(MISSION_ASSIGNEES_PER_ROLE_LIMIT)
      .find(USE_MASTER_KEY)
  )));

  const assignees = uniqBy(usersByRole.flat(), (user) => user.id).map((user) => ({
    id: user.id,
    name: formatMissionAssigneeName({
      firstName: user.get('firstName'), lastName: user.get('lastName'), email: user.get('email'),
    }),
    email: user.get('email') ?? '',
  }));

  return sortBy(assignees, (assignee) => assignee.name.toLowerCase());
};
