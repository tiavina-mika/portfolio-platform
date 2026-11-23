import { MissionPhaseEnum, MissionStatusEnum } from '@shared/domain-types';

/*
 * The only moves a mission may make: a planned mission starts or is cancelled, a mission in progress is
 * done or cancelled. `done` and `cancelled` are final: there is no way back.
 */
const MISSION_STATUS_TRANSITIONS: Record<MissionStatusEnum, MissionStatusEnum[]> = {
  [MissionStatusEnum.PLANNED]: [MissionStatusEnum.IN_PROGRESS, MissionStatusEnum.CANCELLED],
  [MissionStatusEnum.IN_PROGRESS]: [MissionStatusEnum.DONE, MissionStatusEnum.CANCELLED],
  [MissionStatusEnum.DONE]: [],
  [MissionStatusEnum.CANCELLED]: [],
};

// the phases each status may hold, in the order the work goes through them
const MISSION_STATUS_PHASES: Record<MissionStatusEnum, MissionPhaseEnum[]> = {
  [MissionStatusEnum.PLANNED]: [MissionPhaseEnum.WAITING_CLIENT, MissionPhaseEnum.SCHEDULED],
  [MissionStatusEnum.IN_PROGRESS]: [
    MissionPhaseEnum.DESIGN,
    MissionPhaseEnum.DEVELOPMENT,
    MissionPhaseEnum.TESTING,
    MissionPhaseEnum.CLIENT_REVIEW,
    MissionPhaseEnum.RELEASE,
  ],
  [MissionStatusEnum.DONE]: [
    MissionPhaseEnum.HANDOVER,
    MissionPhaseEnum.WARRANTY,
    MissionPhaseEnum.CLOSED,
  ],
  [MissionStatusEnum.CANCELLED]: [
    MissionPhaseEnum.BY_CLIENT,
    MissionPhaseEnum.BY_AGENCY,
    MissionPhaseEnum.UNPAID,
  ],
};

/** the statuses a mission can move to from the one it is in */
export const getNextMissionStatuses = (status: MissionStatusEnum): MissionStatusEnum[] => (
  MISSION_STATUS_TRANSITIONS[status] ?? []
);

/** whether a mission may move from one status to another */
export const canChangeMissionStatus = (from: MissionStatusEnum, to: MissionStatusEnum): boolean => (
  getNextMissionStatuses(from).includes(to)
);

/** the phases a mission may be in while it holds this status */
export const getMissionPhases = (status: MissionStatusEnum): MissionPhaseEnum[] => (
  MISSION_STATUS_PHASES[status] ?? []
);

/**
 * Whether a phase may be held with a status. No phase at all is always allowed: a maintenance mission
 * has no design, a static site no store release.
 * @example isMissionPhaseOfStatus(MissionPhaseEnum.TESTING, MissionStatusEnum.IN_PROGRESS) => true
 * @example isMissionPhaseOfStatus(MissionPhaseEnum.TESTING, MissionStatusEnum.DONE) => false
 */
export const isMissionPhaseOfStatus = (
  phase: MissionPhaseEnum | null | undefined, status: MissionStatusEnum
): boolean => !phase || getMissionPhases(status).includes(phase);

/**
 * Whether the client and the quote of a mission may still change: only while it is planned, so the
 * work started is never moved to another client or another quote.
 */
export const canChangeMissionParties = (status: MissionStatusEnum): boolean => (
  status === MissionStatusEnum.PLANNED
);
