import Parse from 'parse';

import type { IUserAuditTrailEntry } from '@shared/types';

import { USER_AUDIT_TRAIL_LIMIT, USER_DETAIL_BLOCK_LIMIT, USER_TICKET_THREAD_LIMIT } from '@/constants/_core/user.constants';
import { fetchTicketMessages } from '@/services/_core/contact.service';
import { fetchEntityList } from '@/services/_core/crud.service';
import { fetchNotifications } from '@/services/_core/notification.service';
import { IContact } from '@/types/_core/contact.type';
import { INotification } from '@/types/_core/notification.type';
import { ITicketMessage, TicketStatusEnum } from '@/types/_core/ticket-message.type';
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

// a ticket support still owes an answer on
const OPEN_TICKET_STATUSES = [TicketStatusEnum.OPEN, TicketStatusEnum.IN_PROGRESS];

export type UserTicketsExtra = { openCount: number };

/**
 * The support tickets the account opened, plus how many of them support still owes an answer on —
 * the figure the summary raises.
 */
export const fetchUserTickets = async (
  userId: string
): Promise<IUserBlockResult<IContact, UserTicketsExtra>> => {
  const filters = { userId };
  const [latest, open] = await Promise.all([
    fetchEntityList<IContact>('getContacts', {
      ...LATEST_FIRST,
      limit: USER_DETAIL_BLOCK_LIMIT,
      filters,
    }),
    fetchEntityList<IContact>('getContacts', {
      ...LATEST_FIRST,
      limit: 1,
      filters,
      search: { status: OPEN_TICKET_STATUSES },
    }),
  ]);

  return { items: latest.results, count: latest.count, extra: { openCount: open.count } };
};

// one ticket's thread, read when its row is unfolded
export const fetchTicketThread = async (ticketId: string): Promise<IUserBlockResult<ITicketMessage>> => {
  const { results, count } = await fetchTicketMessages(ticketId, USER_TICKET_THREAD_LIMIT, 0);

  return { items: results, count };
};

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
