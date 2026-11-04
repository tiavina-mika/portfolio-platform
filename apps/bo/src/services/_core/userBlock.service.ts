import Parse from 'parse';

import type { IUserAuditTrailEntry } from '@shared/types';

import { USER_AUDIT_TRAIL_LIMIT, USER_DETAIL_BLOCK_LIMIT } from '@/constants/_core/user.constants';
import { fetchNotifications } from '@/services/_core/notification.service';
import { INotification } from '@/types/_core/notification.type';
import { IUserBlockResult } from '@/types/_core/userBlock.type';

/*
 * The reads behind the blocks of the user detail page: the latest few rows of each list the account
 * appears in, newest first, plus the figure the summary shows before the block is opened. Each is a
 * module-level function taking the account id, which is what `useUserBlock` expects.
 */

const LATEST_FIRST = {
  skip: 0,
  orderBy: 'createdAt',
  order: 'desc',
} as const;

export const fetchUserNotifications = async (userId: string): Promise<IUserBlockResult<INotification>> => {
  const { results, count } = await fetchNotifications({
    ...LATEST_FIRST,
    limit: USER_DETAIL_BLOCK_LIMIT,
    filters: { toId: userId },
  });

  return { items: results, count };
};

/**
 * What was done to the account and by whom — sessions closed, support sessions, posts, bans,
 * suspensions — merged by the server from the logs each action is written to.
 */
export const fetchUserAuditTrail = async (
  userId: string
): Promise<IUserBlockResult<IUserAuditTrailEntry>> => {
  const { results }: { results: IUserAuditTrailEntry[] } = await Parse.Cloud.run('getUserAuditTrail', {
    userId,
    limit: USER_AUDIT_TRAIL_LIMIT,
  });

  return { items: results, count: results.length };
};
