import { type TicketAwaiting, TicketAwaitingEnum } from '@shared/types';


import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { TICKET_NOTIFICATION_TYPE } from '@/constants/_core/notification.constants';
import { FINISHED_TICKET_STATUSES } from '@/constants/_core/ticket.constants';
import {
  type TicketSource, TicketMessageSenderRoleEnum,
  TicketSourceEnum, TicketStatusEnum,
} from '@/types/ticket.type';
import { scopeCountries } from '@/utils/_core/agent-context.utils';
import { toPhoneSearchDigits } from '@/utils/_core/phone.utils';
import { escapeText, isBoolean } from '@/utils/_core/utils';

import { setUnseenNotificationsSeenForRecipient } from './notification.service.cloud';
import { Contact } from '../../triggers/_core/contact.triggers';
import { convertIdToPointer, filtersDatesQuery, multiBooleanQuery } from '../../utils/_core/parse.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';

/*
 * search keys with dedicated handling below (date range, multi-boolean, multi-enum) — excluded
 * from the generic `matches()` free-text loop, which only makes sense against string fields
 */
const SEARCH_KEYS_WITH_DEDICATED_HANDLING = [
  'user', 'text', 'replied', 'status', 'priority', 'source', 'subject', 'countries', 'createdAt',
  'updatedAt',
];

/** A free-text search made only of digits is read as a ticket reference as well as as text. */
const REFERENCE_SEARCH_PATTERN = /^\d+$/;

type GetContactsFilters = {
  limit: number;
  skip: number;
  orderBy: string;
  order?: 'asc' | 'desc';
  filters?: { deleted?: boolean; userId?: string };
  search?: Record<string, any>;
  include?: string[];
};

/**
 * The tickets written from one channel. `source` is only stamped on tickets created since it
 * exists, so an older ticket is placed the way the back-office already labels it: one carrying an
 * account came from the app, one without came from the public form.
 */
const getContactsBySourceQuery = (source: TicketSource): Parse.Query => {
  const legacyQuery = new Parse.Query(Contact).doesNotExist('source');

  if (source === TicketSourceEnum.APP) legacyQuery.exists('user');
  else legacyQuery.doesNotExist('user');

  return Parse.Query.or(new Parse.Query(Contact).equalTo('source', source), legacyQuery);
};

/**
 * How many tickets one phone number opened since a given moment, the one just filed included. It is
 * what caps the texts sent to a number: the form accepts any number, so a number is not proof that
 * its owner is the one writing.
 * @param phone the number as tickets store it (international form)
 * @param since the start of the window
 * @returns the number of tickets
 */
export const countRecentTicketsByPhoneService = async (phone: string, since: Date): Promise<number> => (
  new Parse.Query(Contact)
    .equalTo('phone', phone)
    .greaterThan('createdAt', since)
    .count(USE_MASTER_KEY)
);

export const getContactsService = async ({
  limit, skip, orderBy, order, filters, search, include = [],
}: GetContactsFilters): Promise<{ results: Parse.Object[]; count: number }> => {
  let query = new Parse.Query(Contact);

  if (search) {
    /*
     * full text search
     * should be before all other queries
     */
    /*
     * the tickets whose author matches the text: the account query is nested under `user` — it
     * used to replace the ticket query itself, so the search returned accounts, not tickets
     */
    if (search?.user) {
      const text = escapeText(search.user);
      const authors = Parse.Query.or(
        new Parse.Query(Parse.User).matches('email', text),
        new Parse.Query(Parse.User).matches('lastName', text),
        new Parse.Query(Parse.User).matches('firstName', text),
        ...getUserPhoneSearchQueries(search.user)
      );

      query.matchesQuery('user', authors);
    }

    if (search.text) {
      const text = escapeText(search.text);
      const authorFilteredQuery = query;
      const textQueries = [
        new Parse.Query(Contact).matches('email', text),
        new Parse.Query(Contact).matches('name', text),
        new Parse.Query(Contact).matches('message', text),
      ];

      /*
       * the reference is a number, so `matches` (a regex on a string column) never sees it: an
       * all-digit search is what an agent types when a requester has just quoted their number, and
       * it has to land on that one ticket rather than on nothing at all
       */
      if (REFERENCE_SEARCH_PATTERN.test(search.text)) {
        textQueries.push(new Parse.Query(Contact).equalTo('reference', Number(search.text)));
      }

      /*
       * a requester who wrote with a number only is found by that number — it is the one thing the
       * ticket says about them, and it is what the agent has in hand when they call back
       */
      const phoneDigits = toPhoneSearchDigits(search.text);

      if (phoneDigits) {
        textQueries.push(new Parse.Query(Contact).matches('phone', escapeText(phoneDigits)));
      }

      query = Parse.Query.and(authorFilteredQuery, Parse.Query.or(...textQueries));
    }

    Object.keys(search).forEach((key: string) => {
      if (search[key] && !SEARCH_KEYS_WITH_DEDICATED_HANDLING.includes(key)) {
        query.matches(key, escapeText(search[key]));
      }
    });

    // query dates
    filtersDatesQuery(query, search);

    // [true, false] query
    multiBooleanQuery(query, search.replied, 'replied');

    if (search.status?.length) query.containedIn('status', search.status);
    if (search.priority?.length) query.containedIn('priority', search.priority);
    if (search.subject?.length) query.containedIn('subject', search.subject);
    // an `$or` of its own, so it is joined to the text search above rather than replacing it
    if (search.source) query = Parse.Query.and(query, getContactsBySourceQuery(search.source));
  }

  /*
   * the countries the agent's roles cover, whether or not a filter asks for any; a ticket filed before
   * the country was stamped has none, so it matches no country
   */
  const countries = scopeCountries(search?.countries);

  if (countries) query.containedIn('country', countries);

  query.limit(+limit)
    .skip(+skip)
    .equalTo('deleted', false)
    .include(['user', 'repliedBy', 'deletedBy', 'assignedTo', ...include]);

  if (filters) {
    // override the deleted query below
    if (isBoolean(filters?.deleted)) {
      query.equalTo('deleted', filters.deleted);
    }

    // the tickets one account opened, named by id — read from that account's own page
    if (filters.userId) {
      query.equalTo('user', convertIdToPointer(collections.User, filters.userId));
    }
  }

  if (order === 'desc') {
    query.descending(orderBy);
  }
  else {
    query.ascending(orderBy);
  }

  const result = await query.withCount().find(USE_MASTER_KEY);

  return result as unknown as { results: Parse.Object[]; count: number };
};

export const getContactByIdService = async (
  id: string,
  include: string[] = []
): Promise<Parse.Object | undefined> => {
  const contact = await new Parse.Query(Contact)
    .equalTo('objectId', id)
    /*
     * `seenBy`/`lastSeenBy` are resolved here rather than left as raw pointers: the panel beside
     * the thread names the agent who first picked the ticket up, which is the whole point of
     * keeping the first opening apart from the last one
     */
    /*
     * the records the request is about are resolved too: the panel beside the thread links to
     * each of them, and a bare pointer carries neither a route nor a name
     */
    .include([
      'user', 'updatedBy', 'assignedTo', 'seenBy', 'lastSeenBy',
      ...include,
    ])
    .first(USE_MASTER_KEY);

  return contact ?? undefined;
};

/*
 * what a ticket is worth to the person who opened it — the same fields its list rows carry, so the
 * detail screen never receives a back-office field the list already withholds
 */
const MY_TICKET_FIELDS = [
  'name', 'email', 'message', 'status', 'priority', 'lastMessageAt', 'unreadByUser', 'createdAt',
  // the short number the detail screen shows and lets its author copy to quote to support
  'reference',
  // what the request is about, shown on its card and at the top of its thread
  'subject', 'reason',
  // who wrote last, what they said and how many support replies are unread — the list row
  'lastMessageBy', 'lastMessagePreview', 'unreadCountByUser',
];

/**
 * One ticket as its own author may read it. Deliberately not `getContactByIdService`: that one is
 * the back office's read and returns the whole record, assignment included.
 * @param id the ticket to read
 * @returns the ticket, or undefined when there is no such ticket
 */
export const getMyTicketService = async (id: string): Promise<Parse.Object | undefined> => {
  const contact = await new Parse.Query(Contact)
    .equalTo('objectId', id)
    // the owner is what the caller is checked against, so it is read even though it is not returned
    .select([...MY_TICKET_FIELDS, 'user'])
    .first(USE_MASTER_KEY);

  return contact ?? undefined;
};

/**
 * Marks everything support wrote on a ticket as read by its author, once they open it. Skipped when
 * nothing is unread, so opening a quiet ticket costs no write.
 * @param ticket the ticket its author just opened, as read by `getMyTicketService`
 * @returns the ticket, with its unread marks cleared
 */
export const markMyTicketAsReadService = async (ticket: Parse.Object): Promise<Parse.Object> => {
  const author: Parse.User | undefined = ticket.get('user');

  /*
   * the replies were also announced in the notification list: opening the thread reads them there
   * too, or the notifications badge stayed lit for replies the author had just read
   */
  if (author) {
    await setUnseenNotificationsSeenForRecipient(author, (query) => {
      query.equalTo('type', TICKET_NOTIFICATION_TYPE).equalTo('payload.ticket.id', ticket.id);
    });
  }

  const unreadCount: number = ticket.get('unreadCountByUser') ?? 0;

  if (!ticket.get('unreadByUser') && !unreadCount) return ticket;

  /*
   * cleared only if no reply arrived since the ticket was read: an agent's reply increments the
   * count between this read and a plain save, and the save wrote 0 over it — the author then never
   * saw that reply marked new. The condition makes the database refuse the reset in that case; the
   * next opening clears it.
   */
  const contactCollection = await getMongoCollection(collections.Contact);
  const { modifiedCount } = await contactCollection.updateOne(
    { _id: ticket.id, unreadCountByUser: ticket.get('unreadCountByUser') },
    { $set: { unreadByUser: false, unreadCountByUser: 0, _updated_at: new Date() } }
  );

  if (modifiedCount > 0) {
    ticket.set('unreadByUser', false);
    ticket.set('unreadCountByUser', 0);
  }

  return ticket;
};

type GetMyTicketsInput = {
  user: Parse.User;
  limit: number;
  skip: number;
  /** Whose move it is — omitted for every ticket. */
  awaiting?: TicketAwaiting;
};

const ACTIVE_TICKET_STATUSES = [TicketStatusEnum.OPEN, TicketStatusEnum.IN_PROGRESS];

/*
 * a system line (a reopening, say) is written on support's side of the thread: once it is the
 * latest, the author is the one expected to answer
 */
const SUPPORT_SENDER_ROLES = [TicketMessageSenderRoleEnum.AGENT, TicketMessageSenderRoleEnum.SYSTEM];

/** Narrows the author's list to the tickets waiting on the given side. */
const applyAwaitingFilter = (query: Parse.Query, awaiting?: TicketAwaiting): void => {
  switch (awaiting) {
    case TicketAwaitingEnum.AWAITING_USER:
      query.containedIn('status', ACTIVE_TICKET_STATUSES);
      query.containedIn('lastMessageBy', SUPPORT_SENDER_ROLES);
      break;
    case TicketAwaitingEnum.AWAITING_SUPPORT:
      query.containedIn('status', ACTIVE_TICKET_STATUSES);
      query.equalTo('lastMessageBy', TicketMessageSenderRoleEnum.CUSTOMER);
      break;
    case TicketAwaitingEnum.CLOSED:
      query.containedIn('status', FINISHED_TICKET_STATUSES);
      break;
    default:
      break;
  }
};

export const getMyTicketsService = async ({
  user, limit, skip, awaiting,
}: GetMyTicketsInput): Promise<{ results: Parse.Object[]; count: number }> => {
  /*
   * only what the app draws: the back-office fields a ticket also carries — who it is assigned to,
   * whether an agent has read it — are none of the requester's business
   */
  const query = new Parse.Query(Contact)
    .equalTo('user', user)
    .equalTo('deleted', false)
    .select(MY_TICKET_FIELDS)
    .limit(+limit)
    .skip(+skip)
    .descending('lastMessageAt');

  applyAwaitingFilter(query, awaiting);

  const result = await query.withCount().find(USE_MASTER_KEY);

  return result as unknown as { results: Parse.Object[]; count: number };
};
