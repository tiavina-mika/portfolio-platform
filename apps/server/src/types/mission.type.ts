import type { MissionPhaseEnum, MissionStatusEnum } from '@shared/domain-types';

/** the stored fields of an Aldaron `Mission`: the work done for a client, often after an accepted quote */
export interface IMissionAttributes {
  title: string;
  client: Parse.Object;
  // when set, an accepted quote of the same client; frozen once the mission left `planned`
  quote?: Parse.Object;
  status: MissionStatusEnum;
  // the back-office user who does the work
  assignee?: Parse.User;
  // one of the phases of the current status; cleared when the status changes
  phase?: MissionPhaseEnum;
  // filled with the day it starts when still empty
  startDate?: Date;
  // filled with the day it is done when still empty; never before `startDate`
  endDate?: Date;
  description?: string;
  createdBy?: Parse.User;
  updatedBy?: Parse.User;
}

/** what the back-office may write on a mission: the status moves only through `changeMissionStatus` */
export type MissionInput = Pick<IMissionAttributes, 'title'> & {
  // the ids of the pointed objects
  client: string;
  quote: string | null;
  assignee: string | null;
  phase: MissionPhaseEnum | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
};

/** a teammate a mission can be given to, as the picker of the back-office shows it */
export type MissionAssignee = {
  id: string;
  name: string;
  email: string;
};
