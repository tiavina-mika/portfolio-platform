import { DEFAULT_COUNTRY } from '@shared/constants';

/** the fields a back-office user writes on a draft quote; the number, the amounts and the status are the server's */
export const QUOTE_EDITABLE_FIELDS = [
  'client', 'title', 'lines', 'currency', 'taxRate', 'validUntil', 'notes',
] as const;

/*
 * once a quote left `draft` it is never edited: what was sent to the client stays what is stored. A
 * revision is a new version, never an edit of this one
 */
export const QUOTE_FROZEN_FIELDS = QUOTE_EDITABLE_FIELDS;

/** the columns the quote list and the edit dialog need (the dialog opens on the row already loaded) */
export const QUOTE_LIST_FIELDS = [
  ...QUOTE_EDITABLE_FIELDS, 'number', 'status', 'totalAmount', 'paidAmount', 'issuedAt', 'version',
  'acceptedAt', 'acceptanceMethod', 'acceptanceProof', 'createdAt', 'updatedAt', 'parentQuote',
  // the client is read through its pointer, never copied: only what the list shows of it
  'client.name', 'client.email',
  // the quote revised or amended, named in the list by its number and version
  'parentQuote.number', 'parentQuote.version', 'parentQuote.status',
];

// the pointers a quote is read with: its client, and the quote it revises or amends
export const QUOTE_INCLUDED_POINTERS = ['client', 'parentQuote'];

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

// the host every file uploaded to Cloudinary is delivered from: an acceptance proof must come from it
export const CLOUDINARY_DELIVERY_HOST = 'res.cloudinary.com';

// far above a Cloudinary public id or delivery address, low enough that no call stores a huge string
export const QUOTE_ACCEPTANCE_PROOF_PUBLIC_ID_MAX_LENGTH = 300;
export const QUOTE_ACCEPTANCE_PROOF_URL_MAX_LENGTH = 1000;
