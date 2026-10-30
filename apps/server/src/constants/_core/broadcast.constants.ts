/**
 * Who an announcement written in the back-office is addressed to.
 *
 * Only two to begin with, and deliberately so: "everybody" is what an operator incident needs, and
 * "one city" is what keeps a regional outage from waking up the whole country. Narrower audiences
 * (drivers only, a single member) are a support tool rather than an announcement one, and adding
 * them before anyone has asked would be one more thing to get wrong on a send that cannot be undone.
 */
export enum BroadcastSegmentEnum {
  /** every active member of the platform */
  ALL = 'all',
  /** the members whose declared address names this city */
  CITY = 'city'
}

export type BroadcastSegment = `${BroadcastSegmentEnum}`;

/**
 * How many recipients one notification row addresses.
 *
 * An announcement is one event, but a single row naming a hundred thousand recipients would be a
 * document nothing can read back: the recipients are a Parse pointer array, the delivery outcome is
 * stored per recipient next to them, and the back-office draws both. So a broadcast is written as a
 * series of rows of this size, each pushing to its own slice — which is also what keeps a failed
 * push from costing the whole send.
 */
export const BROADCAST_RECIPIENTS_PER_NOTIFICATION = 100;

/**
 * How many members are read from the database at a time while the audience is walked. Independent
 * of the row size above: the query pages in larger batches than a notification addresses, and the
 * batch is then split.
 */
export const BROADCAST_AUDIENCE_PAGE_SIZE = 500;

/**
 * Upper bound on an announcement's title and body, per language. A push is truncated by the
 * operating system well before this, and the app's list shows two lines — the limit is what stops a
 * newsletter being sent through a channel that is meant for one sentence.
 */
export const BROADCAST_TITLE_MAX_LENGTH = 80;
export const BROADCAST_BODY_MAX_LENGTH = 500;

/** How many past announcements the back-office lists under the form — a reminder, not an archive. */
export const BROADCAST_HISTORY_LIMIT = 10;
