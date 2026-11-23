import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { MissionStatusEnum } from '@shared/domain-types';

import type { StatusTone } from '@/utils/_core/theme/styles.utils';

import i18n from '@/config/i18n';
import { IListTabValue } from '@/types/_core/app.type';

export const MISSION_COLLECTION = DOMAIN_COLLECTIONS.mission;

// the list scoped on one status; the generic "All" tab before them lists every mission
export const MISSION_TAB_OPTIONS: IListTabValue[] = Object.values(MissionStatusEnum).map((status) => ({
  label: i18n.t(`project:mission.statuses.${status}`),
  tab: i18n.t(`route:missionTabs.${status}`),
  key: 'status',
  value: status,
}));

// the action of the row menu that moves a mission to each status it can reach
export const MISSION_STATUS_ACTION_LABEL_KEYS: Partial<Record<MissionStatusEnum, string>> = {
  [MissionStatusEnum.IN_PROGRESS]: 'project:mission.actions.start',
  [MissionStatusEnum.DONE]: 'project:mission.actions.finish',
  [MissionStatusEnum.CANCELLED]: 'project:mission.actions.cancel',
};

// the tint of each status in the list, in the dot language every other list uses for a state
export const MISSION_STATUS_TONES: Record<MissionStatusEnum, StatusTone> = {
  [MissionStatusEnum.PLANNED]: 'info',
  [MissionStatusEnum.IN_PROGRESS]: 'warning',
  [MissionStatusEnum.DONE]: 'success',
  [MissionStatusEnum.CANCELLED]: 'default',
};

// the row action of the quote list that starts a mission from an accepted quote
export const MISSION_CREATE_FROM_QUOTE_LABEL_KEY = 'project:mission.createFromQuote';

// how many accepted quotes of a client the quote picker of the mission form proposes
export const MISSION_QUOTE_PICKER_LIMIT = 50;

export const MISSION_FORM_ID = 'mission-form';
