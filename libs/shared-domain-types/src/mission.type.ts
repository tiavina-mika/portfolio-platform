/**
 * Where an Aldaron mission stands. It is born `planned`, starts (`inProgress`) and ends `done`; it may be
 * `cancelled` before it is done. The status only moves forward, and `done` and `cancelled` are final: a
 * mission is never deleted, it stays as history in one of these states.
 */
export enum MissionStatusEnum {
  PLANNED = 'planned',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

/**
 * Where a mission stands inside its status: each status has its own fixed list of phases, and a phase
 * moves freely inside its status. For `cancelled` the phases are the reasons of the cancellation.
 */
export enum MissionPhaseEnum {
  // planned
  WAITING_CLIENT = 'waitingClient',
  SCHEDULED = 'scheduled',
  // in progress
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  CLIENT_REVIEW = 'clientReview',
  RELEASE = 'release',
  // done
  HANDOVER = 'handover',
  WARRANTY = 'warranty',
  CLOSED = 'closed',
  // cancelled: why
  BY_CLIENT = 'byClient',
  // a role, not the brand: the agency's name may change, a stored value may not
  BY_AGENCY = 'byAgency',
  UNPAID = 'unpaid'
}
