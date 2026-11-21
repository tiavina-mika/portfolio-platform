import { QUOTE_BRING_KEYS, QUOTE_SUPPORT_KEYS } from '@/utils/contact.constants';

export type QuoteSupport = (typeof QUOTE_SUPPORT_KEYS)[number];
export type QuoteBring = (typeof QUOTE_BRING_KEYS)[number];

/**
 * What the quote request form sends. `bring` is empty while the visitor has not picked anything.
 */
export interface IQuoteRequestInput {
  name: string;
  email: string;
  product: string;
  supports: Record<QuoteSupport, boolean>;
  bring: QuoteBring | '';
  needs: string;
  estimate: string;
  consent: boolean;
}
