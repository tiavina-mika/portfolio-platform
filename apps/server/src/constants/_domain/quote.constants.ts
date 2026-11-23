import { DEFAULT_COUNTRY } from '@shared/constants';

/** the fields a back-office user writes on a draft quote; the number, the amounts and the status are the server's */
export const QUOTE_EDITABLE_FIELDS = [
  'client', 'title', 'lines', 'currency', 'taxRate', 'validUntil', 'notes',
] as const;

/*
 * once a quote left `draft` it is never edited: what was sent to the client stays what is stored. A
 * revision is a new version (a later ticket), never an edit of this one
 */
export const QUOTE_FROZEN_FIELDS = QUOTE_EDITABLE_FIELDS;

/** the columns the quote list and the edit dialog need (the dialog opens on the row already loaded) */
export const QUOTE_LIST_FIELDS = [
  ...QUOTE_EDITABLE_FIELDS, 'number', 'status', 'totalAmount', 'paidAmount', 'issuedAt', 'version',
  'acceptedAt', 'acceptanceMethod', 'createdAt', 'updatedAt',
  // the client is read through its pointer, never copied: only what the list shows of it
  'client.name', 'client.email',
];

/** the columns a list may be ordered on; anything else falls back to the most recently changed */
export const QUOTE_ORDER_FIELDS = ['number', 'title', 'totalAmount', 'issuedAt', 'createdAt', 'updatedAt'];

/** the most quotes one page of the list may ask for */
export const QUOTE_LIST_MAX_LIMIT = 100;

/*
 * the readable reference of a quote is `<prefix>-<year>-<sequence>`, the sequence padded to this many
 * digits (`AL-2026-001`); a year past 999 quotes simply grows a digit. The prefix is the agency's
 * initials, decided by the business: it is user-facing text, kept here so it changes in one place
 */
export const QUOTE_NUMBER_PREFIX = 'AL';
export const QUOTE_NUMBER_SEQUENCE_DIGITS = 3;

// the counter row a year's quotes are numbered from: `quote-2026`
export const QUOTE_COUNTER_NAME_PREFIX = 'quote';

// the numbering year turns at midnight where the business works, like the statistics' days
export const QUOTE_NUMBER_TIME_ZONE = DEFAULT_COUNTRY.timeZone;
