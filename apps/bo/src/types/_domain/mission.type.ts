import type { IQuoteClient } from '@/types/_domain/quote.type';
import type { MissionPhaseEnum, MissionStatusEnum } from '@shared/domain-types';

/** the quote a mission carries out, as much of it as the list names */
export interface IMissionQuote {
  id: string;
  number: string;
  version: number;
  title: string;
}

/** a teammate a mission can be given to */
export interface IMissionAssignee {
  id: string;
  name: string;
  email: string;
}

/** an Aldaron mission, as the list and the edit dialog read it */
export interface IMission {
  id: string;
  title: string;
  client: IQuoteClient;
  // the accepted quote the mission carries out, if any
  quote?: IMissionQuote;
  status: MissionStatusEnum;
  assignee?: IMissionAssignee;
  phase?: MissionPhaseEnum;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** what the mission form holds */
export interface IMissionFormValues {
  // the id of the client
  client: string;
  title: string;
  // the ids of the quote and the assignee; empty for none
  quote?: string | null;
  assignee?: string | null;
  phase?: MissionPhaseEnum | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string;
}

/** what the mission form sends: nothing the server computes, the status moved apart */
export interface IMissionInput {
  client: string;
  title: string;
  quote: string | null;
  assignee: string | null;
  phase: MissionPhaseEnum | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}

/**
 * What a new mission starts from when it is created from an accepted quote: its client, its title and
 * the quote itself.
 */
export interface IMissionPrefill {
  client: IQuoteClient;
  title: string;
  quote: IMissionQuote;
}

export interface IMissionState {
  missions: IMission[];
  count: number;
}
