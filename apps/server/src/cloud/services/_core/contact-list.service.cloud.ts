import { hasVerifiedContacts } from '@shared/utils';

import type { TicketStatus } from '@/types/ticket.type';

import {
  collections, DEFAULT_QUERY_LIMIT, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { TicketStatusEnum } from '@/types/ticket.type';

import { getUserIdsFromRoles } from './userRole.service.cloud';
import { agentCountryMatch, newAgentQuery } from '../../utils/_core/parse.utils.cloud';

/**
 * How many tickets of the same requester the inbox side panel looks back over. It states what an
 * agent has already answered this person, not their whole history — a long list would push the
 * ticket being answered off the screen.
 */
const PREVIOUS_TICKETS_LIMIT = 5;

/** How many tickets each scope of the inbox holds, plus the size of the whole queue. */
export type ContactSummary = {
  total: number;
  byStatus: Record<TicketStatus, number>;
  /** tickets carrying activity no agent has opened yet — the "handle first" figure */
  unread: number;
};

/** What the inbox side panel says about the person who opened the ticket. */
export type TicketRequesterContext = {
  memberSince?: string;
  isVerified: boolean;
  ridesCount: number;
  cancellationsCount: number;
  rating: number | null;
  reviewsCount: number;
};

export type TicketContext = {
  requester: TicketRequesterContext | null;
  previousTickets: Parse.Object[];
  /** blocks a business domain adds beside the thread, keyed by the name the back-office reads */
  [extension: string]: unknown;
};

/**
 * Adds a block of its own to the context of a ticket (e.g. the SOS a ticket was opened by). The
 * inbox is generic: a domain that opens tickets registers what the agent needs to see about them
 * rather than this service reading domain collections itself.
 * @returns the blocks to merge into the context — an empty object when the ticket is not theirs
 */
type TicketContextExtension = (ticket: Parse.Object) => Promise<Record<string, unknown>>;

const ticketContextExtensions: TicketContextExtension[] = [];

export const registerTicketContextExtension = (extension: TicketContextExtension): void => {
  ticketContextExtensions.push(extension);
};

/*
 * ---------------------------------------------- //
 * ------------------ summary ------------------- //
 * ---------------------------------------------- //
 */

/**
 * How many tickets stand in each scope of the inbox. The figures describe the whole queue rather
 * than the current search — they say how much there is to switch to, so typing in the search box
 * must not move them.
 * @returns the queue size, one count per status and how many carry unseen activity
 */
export const getContactSummaryService = async (): Promise<ContactSummary> => {
  const [total, statusGroups, unread] = await Promise.all([
    /*
     * counted on its own rather than summed from the four scopes: they are exhaustive today, but a
     * ticket left without a status must not silently make the unscoped tab under-count
     */
    newAgentQuery(collections.Contact).equalTo('deleted', false).count(USE_MASTER_KEY),

    new Parse.Query(collections.Contact).aggregate([
      { $match: { ...agentCountryMatch(), deleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ] as any),

    newAgentQuery(collections.Contact)
      .equalTo('deleted', false)
      .equalTo('unreadByAdmin', true)
      .count(USE_MASTER_KEY),
  ]);

  /*
   * every scope keeps a figure even when it holds nothing: a tab whose count never lands reads as
   * still loading, and one that disappears takes away a scope the reader can switch back to
   */
  const byStatus = Object.values(TicketStatusEnum).reduce((counts, status) => {
    // Parse Server renames the $group `_id` to `objectId` — fall back to `_id` for safety
    const group = statusGroups.find((item: any) => (item.objectId ?? item._id) === status);

    return { ...counts, [status]: (group?.count as number) ?? 0 };
  }, {} as Record<TicketStatus, number>);

  return { total, byStatus, unread };
};

/*
 * ---------------------------------------------- //
 * ------------------ context ------------------- //
 * ---------------------------------------------- //
 */

const buildRequesterContext = (user: Parse.User): TicketRequesterContext => {
  const stats = user.get('stats') ?? {};
  const rideStats = user.get('rideStats') ?? {};
  const requestStats = user.get('requestStats') ?? {};

  return {
    memberSince: user.get('createdAt')?.toISOString(),
    /*
     * an account is trusted once every way to reach it that it has was proven: a member who signed up
     * by phone has no email, so their confirmed number is what counts — reading only the email made
     * every one of them look unverified to the agent answering their ticket
     */
    isVerified: hasVerifiedContacts({
      email: user.get('email'),
      phone: user.get('phone'),
      emailVerified: user.get('emailVerified'),
      phoneVerified: user.get('phoneVerified'),
    }),
    /*
     * what the person has actually travelled, both ways round: the two counters are kept on the
     * same account by different triggers, and an agent reading a ticket wants the one figure
     */
    ridesCount: (rideStats.completed ?? 0) + (requestStats.completed ?? 0),
    cancellationsCount: (rideStats.canceled ?? 0) + (requestStats.canceled ?? 0),
    // a new account has no score yet — null so the panel says so rather than showing a zero
    rating: stats.reviewsCount ? stats.rating : null,
    reviewsCount: stats.reviewsCount ?? 0,
  };
};

/**
 * What the inbox states beside the thread: who opened the ticket and what they have already
 * written in. Both answer the same question — whether this is a first-time problem or another
 * chapter of one — which is why they are read in one call rather than per panel.
 * @param ticket the ticket being read
 * @returns the requester's record, and their other tickets newest first
 */
export const getTicketContextService = async (ticket: Parse.Object): Promise<TicketContext> => {
  const user: Parse.User | undefined = ticket.get('user');
  const email = ticket.get('email');
  const phone = ticket.get('phone');

  /*
   * matched on the address (or the number, for a visitor who left no address) rather than on the
   * account: a ticket opened from the public website before the person signed up carries no user,
   * and it is still their history
   */
  const previousTicketsQuery = new Parse.Query(collections.Contact)
    .equalTo('deleted', false)
    .notEqualTo('objectId', ticket.id)
    .select(['message', 'status', 'priority', 'createdAt', 'lastMessageAt'])
    .descending('lastMessageAt')
    .limit(PREVIOUS_TICKETS_LIMIT);

  if (user) previousTicketsQuery.equalTo('user', user);
  else if (email) previousTicketsQuery.equalTo('email', email);
  else if (phone) previousTicketsQuery.equalTo('phone', phone);

  // a ticket with no account, no address and no number has no identity to match a history on
  const hasIdentity = !!(user || email || phone);

  const [previousTickets, extensions] = await Promise.all([
    hasIdentity ? previousTicketsQuery.find(USE_MASTER_KEY) : Promise.resolve([]),
    Promise.all(ticketContextExtensions.map((extension) => extension(ticket))),
  ]);

  return {
    ...Object.assign({}, ...extensions),
    requester: user ? buildRequesterContext(user) : null,
    previousTickets,
  };
};

/*
 * ---------------------------------------------- //
 * ------------------- agents ------------------- //
 * ---------------------------------------------- //
 */

/**
 * The back-office users a ticket can be handed to: everyone whose role lets them answer one.
 * Read off the roles rather than kept as a list of its own, so an agent who loses contact rights
 * stops being offered without anything else having to be updated.
 * @returns the agents, ordered by name
 */
export const getTicketAgentsService = async (): Promise<Parse.User[]> => {
  const roles = await new Parse.Query(Parse.Role)
    .equalTo('rights.className', collections.Contact)
    .select(['name', 'rights'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  /*
   * reading a ticket is not answering one: only a role that may write on `Contact` is offered,
   * plus the highest-level roles, which carry every right without listing them
   */
  const roleNames = roles
    .filter((role: Parse.Role) => {
      const entry = (role.get('rights') ?? []).find((right: any) => right.className === collections.Contact);

      return !!entry?.rights?.update;
    })
    .map((role: Parse.Role) => role.getName());

  const agentIds = await getUserIdsFromRoles([...HIGHEST_LEVEL_ROLES, ...roleNames]);

  if (!agentIds.length) return [];

  return new Parse.Query(Parse.User)
    .containedIn('objectId', agentIds)
    // `notEqualTo` rather than `equalTo(false)`: an account created before the flag has no field
    .notEqualTo('deleted', true)
    .select(['firstName', 'lastName', 'email', 'image'])
    .ascending('lastName')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);
};
