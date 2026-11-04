import type { Dayjs } from 'dayjs';

export type DateType = string | number | Date | Dayjs | null | undefined;

// in database, it's a date type, but Parse Server extract the date with this type
export type ParseServerDate = {
  __type: string;
  iso: Date;
};

// image returned by the upload api
export interface IImageHttpResponse {
  url: string;
  publicId: string;
}

export interface IRights {
  create: boolean;
  find: boolean;
  get: boolean;
  update: boolean;
  delete: boolean;
}

export interface IRightsItem {
  label?: string;
  className: string;
  rights: IRights;
}

export type JobStatusData = {
  objectId: string;
  status: string;
  startDate: string;
  name: string;
  message?: string;
  endDate?: string;
};

export type ParseTriggerValidation = (request: Parse.Cloud.FunctionRequest) => any;

export interface IIdsToTransform {
  key: string;
  className: string;
}

/**
 * What the back-office bulk "mark as seen"/"mark as unseen" action gets back.
 * `toggledIds` names only the rows that actually changed state, so the caller can drop exactly
 * those from the list it is showing; `count` is the collection's badge count recomputed after the
 * write, so the badge never has to be guessed at from the number of rows ticked.
 */
export type ToggleSeenResult = {
  toggledIds: string[];
  count: number;
};

/**
 * What "mark the whole collection as seen" gets back: how many rows this pass cleared, and what
 * the badge reads afterwards — a non-zero `count` means the backlog was deeper than one pass.
 */
export type MarkAllSeenResult = {
  markedCount: number;
  count: number;
};
