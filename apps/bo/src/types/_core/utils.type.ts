import { Dayjs } from 'dayjs';

import type { ISelectOption } from '@/types/_core/app.type';

export type DateType = string | number | Date | Dayjs | null | undefined;

// in database, it's a date type, but Parse Server extract the date with this type
export interface IParseServerDate {
  __type: string;
  iso: Date;
}

export interface IOnRouteEnterInput {
  params?: any;
  searchParams?: any;
  location?: any;
}

export type PlatformType = 'ios' | 'android' | 'macos' | 'windows' | 'web' | 'native' | 'bo';

export interface ICreatableSelectOption extends Partial<ISelectOption> {
  inputValue?: any;
  disabled?: boolean;
}

export interface IJobStatusAttributes {
  objectId: string;
  status: string;
  startDate: string;
  name: string;
  message?: string;
  endDate: string;
  success: number;
  error: number;
  count: number;
}

export interface IUserDefaultRecord {
  createdAt: DateType;
  updatedAt: DateType;

  deletedAt?: DateType;
  deletedBy?: Parse.User;
  deleted?: boolean;
  /*
   * the row was taken back out of the recycle bin — kept next to the `deleted` pair rather than
   * clearing it, so a history reads as the two decisions it was
   */
  undeletedAt?: DateType;
  undeletedBy?: Parse.User;
  seen: boolean;
  /*
   * the FIRST opening — set once and never rewritten, so it keeps naming the admin who took the
   * row out of the queue however many times it has been reopened since (see `setBooleanFields`
   * server-side). The three fields below say what happened after that.
   */
  seenAt?: DateType;
  seenBy?: Parse.User;
  lastSeenAt?: DateType;
  lastSeenBy?: Parse.User;
  seenCount?: number;
  unseenAt?: DateType;
  unseenBy?: Parse.User;
}

/**
 * What a bulk "mark as seen"/"mark as unseen" returns: the rows that actually changed state, and
 * the collection's badge count as recomputed by the server after the write.
 */
export interface IToggleSeenResult {
  toggledIds: string[];
  count: number;
}

/**
 * What "mark the whole collection as seen" returns: how many rows this pass cleared, and what the
 * badge reads afterwards — a count still above zero means a second pass is needed.
 */
export interface IMarkAllSeenResult {
  markedCount: number;
  count: number;
}
export interface IJobStatus extends Parse.User<IJobStatusAttributes> {}
