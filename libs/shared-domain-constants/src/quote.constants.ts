/**
 * The currencies a quote can be written in, with the number of decimals its amounts are typed with.
 * Amounts are stored as integers in the smallest unit (`12.50 €` is `1250`), so the decimals decide how
 * a typed amount becomes a stored one. Adding a currency, or changing its decimals, is an edit here only.
 *
 * The ariary takes 0 decimals: ISO 4217 declares 2 (the iraimbilanja), but that sub-unit is no longer
 * used, and a quote in ariary is priced in whole ariary.
 */
export const QUOTE_CURRENCIES = {
  EUR: { decimals: 2 },
  MGA: { decimals: 0 },
} as const;

/** the currency a new quote starts in until the back-office user picks another default */
export const DEFAULT_QUOTE_CURRENCY = 'EUR';

/*
 * `lines` is an embedded array rewritten in full on every save: past a few dozen entries it would
 * belong in its own collection, so it is capped
 */
export const QUOTE_LINES_MAX = 50;

/*
 * the longest value each typed field of a quote may hold: the back-office form refuses it before the
 * server does
 */
export const QUOTE_TITLE_MAX_LENGTH = 200;
export const QUOTE_LINE_LABEL_MAX_LENGTH = 500;
export const QUOTE_NOTES_MAX_LENGTH = 5000;

// a VAT rate is a percentage
export const QUOTE_TAX_RATE_MAX = 100;

/*
 * the biggest quantity and unit amount a line may hold: far above any real quote, and low enough that
 * the total of the 50 lines stays an exact integer in JavaScript
 */
export const QUOTE_LINE_QUANTITY_MAX = 100_000;
export const QUOTE_LINE_UNIT_AMOUNT_MAX = 100_000_000_000;

// quantities and VAT rates are typed with at most this many decimals
export const QUOTE_RATE_DECIMALS = 2;

/*
 * the proof of an acceptance (a signed quote, the client's e-mail saved as a PDF or a screenshot) is
 * uploaded with the other back-office files, into this folder: the server only takes a proof stored there
 */
export const QUOTE_ACCEPTANCE_PROOF_FOLDER = 'quotes/acceptance-proofs';

// a PDF or an image, as the back-office drop accepts it and the server checks it
export const QUOTE_ACCEPTANCE_PROOF_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'] as const;

// the heaviest proof the upload takes, in MB
export const QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB = 5;
