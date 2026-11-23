import {
  QUOTE_ACCEPTANCE_PROOF_EXTENSIONS, QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB, QUOTE_CURRENCIES,
  QUOTE_LINE_LABEL_MAX_LENGTH, QUOTE_LINE_QUANTITY_MAX, QUOTE_LINES_MAX, QUOTE_NOTES_MAX_LENGTH,
  QUOTE_RATE_DECIMALS, QUOTE_TAX_RATE_MAX, QUOTE_TITLE_MAX_LENGTH,
} from '@shared/domain-constants';
import { QuoteAcceptanceMethodEnum } from '@shared/domain-types';
import { z } from 'zod';

import { tabRouteSearchParams } from '@/validations/_core/app.validations';
import { generateFileSchema } from '@/validations/_core/zodSchema.validations';

export const quotesRouteSearchParams = tabRouteSearchParams;

export type QuotesRouteSearchParams = z.infer<typeof quotesRouteSearchParams>;

// a quantity or a rate typed with at most two decimals (`0.5` day, `5.5` %), as the server allows
const hasAtMostRateDecimals = (value: number): boolean => {
  const scaled = value * (10 ** QUOTE_RATE_DECIMALS);

  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
};

// the boxes hold text: an empty one is no value, anything else is read as a number
const emptyToNull = (value: unknown) => (value === '' || value === undefined ? null : value);

const quoteLineSchema = z.object({
  label: z.string().trim().min(1).max(QUOTE_LINE_LABEL_MAX_LENGTH),
  quantity: z.coerce.number().positive().max(QUOTE_LINE_QUANTITY_MAX).refine(hasAtMostRateDecimals),
  // typed in the main unit (12.50 €); its decimals are checked against the currency on submit
  unitAmount: z.coerce.number().nonnegative(),
});

export const quoteSchema = z.object({
  client: z.string().min(1),
  title: z.string().trim().min(1).max(QUOTE_TITLE_MAX_LENGTH),
  lines: z.array(quoteLineSchema).min(1).max(QUOTE_LINES_MAX),
  currency: z.enum(Object.keys(QUOTE_CURRENCIES) as [keyof typeof QUOTE_CURRENCIES]),
  taxRate: z.preprocess(
    emptyToNull,
    z.coerce.number().min(0).max(QUOTE_TAX_RATE_MAX).refine(hasAtMostRateDecimals).nullable()
  ),
  validUntil: z.date().nullish(),
  notes: z.string().trim().max(QUOTE_NOTES_MAX_LENGTH).optional(),
});

export const quoteAcceptSchema = z.object({
  acceptanceMethod: z.enum(QuoteAcceptanceMethodEnum),
  // optional: a signed quote or the client's e-mail, as a PDF or an image
  acceptanceProof: generateFileSchema(false, {
    maxSize: QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB,
    extensions: [...QUOTE_ACCEPTANCE_PROOF_EXTENSIONS],
  }) as z.ZodType<File | undefined, File | undefined>,
});

export type QuoteAcceptInput = z.infer<typeof quoteAcceptSchema>;
