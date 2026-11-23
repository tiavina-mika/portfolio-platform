import {
  QUOTE_CURRENCIES, QUOTE_LINE_LABEL_MAX_LENGTH, QUOTE_LINE_QUANTITY_MAX, QUOTE_LINE_UNIT_AMOUNT_MAX,
  QUOTE_LINES_MAX, QUOTE_NOTES_MAX_LENGTH, QUOTE_RATE_DECIMALS, QUOTE_TAX_RATE_MAX, QUOTE_TITLE_MAX_LENGTH,
} from '@shared/domain-constants';
import { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';
import { z } from 'zod';

import {
  QUOTE_ACCEPTANCE_PROOF_PUBLIC_ID_MAX_LENGTH, QUOTE_ACCEPTANCE_PROOF_URL_MAX_LENGTH, QUOTE_LIST_MAX_LIMIT,
} from '@/constants/_domain/quote.constants';

import {
  localeFieldSchema, objectIdFieldSchema, paginationQuerySchema, workspaceFieldSchema,
} from '../_core/util.validations';

// a quantity or a rate typed with at most two decimals (`0.5` day, `5.5` %)
const hasAtMostRateDecimals = (value: number): boolean => {
  const scaled = value * (10 ** QUOTE_RATE_DECIMALS);

  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
};

/*
 * a date the Parse SDK sends as a `Date`, or a call made by hand as an ISO string; an empty value
 * comes back as `null`, which unsets the column
 */
const optionalDateSchema = z.union([z.date(), z.iso.datetime().transform((value) => new Date(value))])
  .nullish()
  .transform((value) => value ?? null);

const quoteLineSchema = z.strictObject({
  label: z.string().trim().min(1).max(QUOTE_LINE_LABEL_MAX_LENGTH),
  quantity: z.number().positive().max(QUOTE_LINE_QUANTITY_MAX).refine(hasAtMostRateDecimals),
  // an integer in the smallest unit of the currency: a float here would be a wrong conversion upstream
  unitAmount: z.number().int().nonnegative().max(QUOTE_LINE_UNIT_AMOUNT_MAX),
});

/*
 * the fields a back-office user types on a draft. Strict: the number, the amounts, the status, the
 * version and the dates the server sets are refused rather than silently stored, so a faulty or forged
 * call cannot impose them
 */
const quoteFieldsSchema = {
  client: objectIdFieldSchema,
  title: z.string().trim().min(1).max(QUOTE_TITLE_MAX_LENGTH),
  lines: z.array(quoteLineSchema).min(1).max(QUOTE_LINES_MAX),
  currency: z.enum(Object.keys(QUOTE_CURRENCIES) as [keyof typeof QUOTE_CURRENCIES]),
  // empty means no VAT
  taxRate: z.number().min(0).max(QUOTE_TAX_RATE_MAX).refine(hasAtMostRateDecimals)
    .nullish()
    .transform((value) => value ?? null),
  validUntil: optionalDateSchema,
  notes: z.string().trim().max(QUOTE_NOTES_MAX_LENGTH).nullish().transform((value) => value || null),
};

/**
 * the typed fields alone, read off an already validated request: the other params (`id`, `locale`…)
 * are dropped, and the values come out trimmed with their empty boxes turned into `null`
 */
export const quoteInputSchema = z.object(quoteFieldsSchema);

// sent by every back-office call: the language of the error messages and the workspace worked in
const requestFieldsSchema = {
  locale: localeFieldSchema.optional(),
  workspace: workspaceFieldSchema,
};

export const createQuoteSchema = z.strictObject({
  ...quoteFieldsSchema,
  // an amendment: the accepted quote it completes. A revision is never created here (`reviseQuote`)
  parentQuote: objectIdFieldSchema.optional(),
  // the quote request of the site the quote is written from: it then points to the quote
  contact: objectIdFieldSchema.optional(),
  ...requestFieldsSchema,
}).refine(
  // an amendment completes an accepted quote, a request starts a first one: never both
  ({ parentQuote, contact }) => !(parentQuote && contact),
  { path: ['contact'] }
);

// the quote request of the site to turn into a client and the prefill of a draft quote
export const prepareQuoteFromContactSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...requestFieldsSchema,
});

export const updateQuoteSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...quoteFieldsSchema,
  ...requestFieldsSchema,
});

/*
 * the file the back-office uploaded, as the upload answered it. Whether it really is one of the
 * platform's proofs (host, folder, extension) is the trigger's check, which holds for every save
 */
const acceptanceProofSchema = z.strictObject({
  publicId: z.string().trim().min(1).max(QUOTE_ACCEPTANCE_PROOF_PUBLIC_ID_MAX_LENGTH),
  url: z.url({ protocol: /^https$/ }).max(QUOTE_ACCEPTANCE_PROOF_URL_MAX_LENGTH),
});

/*
 * the one way a quote moves: `draft` is where it starts, so it is never a target. Accepting it says how
 * the client said yes, and may join the proof of it; which move is allowed from where the quote stands
 * is the trigger's check
 */
export const changeQuoteStatusSchema = z.strictObject({
  id: objectIdFieldSchema,
  status: z.enum([
    QuoteStatusEnum.SENT, QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED,
  ]),
  acceptanceMethod: z.enum(QuoteAcceptanceMethodEnum).optional(),
  acceptanceProof: acceptanceProofSchema.optional(),
  ...requestFieldsSchema,
}).refine(
  ({ status, acceptanceMethod }) => (status === QuoteStatusEnum.ACCEPTED) === !!acceptanceMethod,
  { path: ['acceptanceMethod'] }
).refine(
  ({ status, acceptanceProof }) => !acceptanceProof || status === QuoteStatusEnum.ACCEPTED,
  { path: ['acceptanceProof'] }
);

export const getQuoteSchema = z.strictObject({
  id: objectIdFieldSchema,
  ...requestFieldsSchema,
});

// the sent quote to revise, nothing else: the new version is a copy of it, edited afterwards as a draft
export const reviseQuoteSchema = getQuoteSchema;

const quotesFiltersSchema = z.object({
  status: z.enum(QuoteStatusEnum).optional(),
  // the quotes of one client: the mission form picks among the accepted quotes of its client
  client: objectIdFieldSchema.optional(),
}).optional();

const quotesSearchSchema = z.object({
  // the search box: a part of the number or of the title
  text: z.string().optional(),
}).optional();

export const getQuotesSchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().nonnegative().max(QUOTE_LIST_MAX_LIMIT),
  filters: quotesFiltersSchema,
  search: quotesSearchSchema,
  ...requestFieldsSchema,
});
