import { DEFAULT_COUNTRY } from '@shared/constants';
import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientStatusEnum, MissionStatusEnum } from '@shared/domain-types';
import {
  canChangeMissionParties, canChangeMissionStatus, isMissionPhaseOfStatus,
} from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { MISSION_FROZEN_FIELDS } from '@/constants/_domain/mission.constants';
import {
  canLinkQuoteToMission, getMissionDatesToFill, isMissionEndBeforeStart,
} from '@/utils/_domain/mission.utils';

import { getClientByIdService } from '../../services/_domain/client.service.cloud';
import { getMissionAssigneeUserService } from '../../services/_domain/mission.service.cloud';
import { getQuoteByIdService } from '../../services/_domain/quote.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { getUserWorkspaces } from '../../utils/_core/role.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

// the columns only the server writes: on an existing mission a change to one of them is put back
const SERVER_OWNED_FIELDS = ['createdBy'] as const;

// the day a mission starts and ends is the one where the business works, like the quote numbering
const MISSION_TIME_ZONE = DEFAULT_COUNTRY.timeZone;

const translateStatus = (status: MissionStatusEnum, locale: Locale): string => (
  translate(`mission.statuses.${status}`, locale)
);

const restoreOriginalValue = (mission: Parse.Object, original: Parse.Object, field: string): void => {
  const value = original.get(field);

  if (value === undefined) mission.unset(field);
  else mission.set(field, value);
};

// the client of a mission must be one still worked with: archived or anonymized clients get no new work
const assertActiveClient = async (mission: Parse.Object, locale: Locale): Promise<void> => {
  const client = await getClientByIdService(mission.get('client')?.id);

  if (!client || client.get('status') !== ClientStatusEnum.ACTIVE) {
    throw new Error(translate('mission.clientNotActive', locale));
  }
};

// the quote a mission carries out is an accepted one, written for the same client
const assertLinkableQuote = async (mission: Parse.Object, locale: Locale): Promise<void> => {
  const quoteId: string | undefined = mission.get('quote')?.id;

  if (!quoteId) return;

  const quote = await getQuoteByIdService(quoteId);

  if (!quote) throw new Error(translate('mission.quoteNotFound', locale));

  const isLinkable = canLinkQuoteToMission(
    { status: quote.get('status'), clientId: quote.get('client')?.id },
    mission.get('client')?.id
  );

  if (!isLinkable) {
    throw new Error(translate('mission.quoteNotLinkable', locale, { number: quote.get('number') }));
  }
};

/*
 * the teammate who does the work must be able to open the Aldaron workspace, where the missions are:
 * otherwise the mission would be given to someone who can never see it
 */
const assertAgencyAssignee = async (mission: Parse.Object, locale: Locale): Promise<void> => {
  const assigneeId: string | undefined = mission.get('assignee')?.id;

  if (!assigneeId) return;

  const assignee = await getMissionAssigneeUserService(assigneeId);

  if (!assignee || !(await getUserWorkspaces(assignee)).includes(TargetEnum.AGENCY)) {
    throw new Error(translate('mission.assigneeNotAllowed', locale));
  }
};

/**
 * The status of a mission only moves forward (`planned → inProgress → done`, or `cancelled`), and
 * `done` and `cancelled` are final. Once it left `planned` its client and its quote no longer change.
 * A status change clears the phase, which belonged to the previous status, and dates the start or the
 * end when they are still empty.
 */
const checkUpdatedMission = (mission: Parse.Object, original: Parse.Object, locale: Locale): void => {
  SERVER_OWNED_FIELDS.forEach((field) => {
    if (mission.dirty(field)) restoreOriginalValue(mission, original, field);
  });

  const from: MissionStatusEnum = original.get('status');
  const to: MissionStatusEnum = mission.get('status');

  if (!canChangeMissionParties(from) && MISSION_FROZEN_FIELDS.some((field) => mission.dirty(field))) {
    throw new Error(translate('mission.partiesFrozen', locale, { status: translateStatus(from, locale) }));
  }

  if (from === to) return;

  if (!canChangeMissionStatus(from, to)) {
    throw new Error(translate('mission.statusChangeNotAllowed', locale, {
      from: translateStatus(from, locale),
      to: translateStatus(to, locale),
    }));
  }

  // the phase belonged to the status left: the new status starts with none
  mission.unset('phase');

  const datesToFill = getMissionDatesToFill(
    to, { startDate: mission.get('startDate'), endDate: mission.get('endDate') }, new Date()
  );

  Object.entries(datesToFill).forEach(([field, date]) => mission.set(field, date));
};

/*
 * A mission is saved by its Cloud Functions with the master key, so the session is not on the request:
 * the functions hand the user and the language over through the save's context.
 */
Parse.Cloud.beforeSave(
  DOMAIN_COLLECTIONS.mission,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const mission = request.object;
    const locale = (request.context?.locale as Locale | undefined) ?? DEFAULT_LANGUAGE;
    const userId = (request.context?.userId as string | undefined) ?? request.user?.id;
    const author = userId ? convertIdToPointer<Parse.User>(collections.User, userId) : undefined;
    const isNew = !mission.existed();

    if (isNew) {
      // whatever was sent, a mission is born planned: the work has not started yet
      mission.set('status', MissionStatusEnum.PLANNED);
      if (author) mission.set('createdBy', author);
    } else if (request.original) {
      checkUpdatedMission(mission, request.original, locale);
    }

    const status: MissionStatusEnum = mission.get('status');

    if (!isMissionPhaseOfStatus(mission.get('phase'), status)) {
      throw new Error(translate('mission.phaseNotAllowed', locale, {
        phase: translate(`mission.phases.${mission.get('phase')}`, locale),
        status: translateStatus(status, locale),
      }));
    }

    if (isMissionEndBeforeStart(mission.get('startDate'), mission.get('endDate'), MISSION_TIME_ZONE)) {
      throw new Error(translate('mission.endBeforeStart', locale));
    }

    const isClientSet = isNew || mission.dirty('client');

    if (isClientSet) await assertActiveClient(mission, locale);
    if (isClientSet || mission.dirty('quote')) await assertLinkableQuote(mission, locale);
    if (mission.dirty('assignee')) await assertAgencyAssignee(mission, locale);

    if (author) mission.set('updatedBy', author);
  })
);
