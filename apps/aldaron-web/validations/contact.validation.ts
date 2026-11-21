import { z } from 'zod';

import {
  QUOTE_BRING_KEYS,
  QUOTE_FIELD_MAX_LENGTHS,
  QUOTE_NAME_MIN_LENGTH,
  QUOTE_PRODUCT_MIN_LENGTH,
} from '@/utils/contact.constants';

export type QuoteRequestMessages = {
  name: string;
  email: string;
  product: string;
  supports: string;
  consent: string;
};

/**
 * The quote request form. The messages are the ones shown under the fields, already translated by the
 * caller: the form passes its own, the server action the generic invalid input key.
 */
export const createQuoteRequestSchema = (messages: QuoteRequestMessages) => z.object({
  name: z
    .string()
    .trim()
    .min(QUOTE_NAME_MIN_LENGTH, { error: messages.name })
    .max(QUOTE_FIELD_MAX_LENGTHS.name, { error: messages.name }),
  email: z
    .string()
    .trim()
    .max(QUOTE_FIELD_MAX_LENGTHS.email, { error: messages.email })
    .pipe(z.email({ error: messages.email }))
    .transform(value => value.toLowerCase()),
  product: z
    .string()
    .trim()
    .min(QUOTE_PRODUCT_MIN_LENGTH, { error: messages.product })
    .max(QUOTE_FIELD_MAX_LENGTHS.product, { error: messages.product }),
  supports: z
    .object({
      web: z.boolean(),
      app: z.boolean(),
      mobile: z.boolean(),
      bo: z.boolean(),
    })
    .refine(supports => Object.values(supports).some(Boolean), { error: messages.supports }),
  bring: z.enum(['', ...QUOTE_BRING_KEYS]),
  needs: z.string().trim().max(QUOTE_FIELD_MAX_LENGTHS.needs),
  estimate: z.string().trim().max(QUOTE_FIELD_MAX_LENGTHS.estimate),
  consent: z.literal(true, { error: messages.consent }),
});

const INVALID_INPUT = 'error.invalidInput';

// what the server action checks again: a visitor can call it without the form
export const QuoteRequestSchema = createQuoteRequestSchema({
  name: INVALID_INPUT,
  email: INVALID_INPUT,
  product: INVALID_INPUT,
  supports: INVALID_INPUT,
  consent: INVALID_INPUT,
});
