import { QUOTE_REQUEST_MESSAGE_LABELS } from '@shared/constants';
import { QUOTE_LINE_LABEL_MAX_LENGTH, QUOTE_LINES_MAX, QUOTE_TITLE_MAX_LENGTH } from '@shared/domain-constants';

import type { QuoteRequestPrefill } from '@/types/quote.type';

const PRODUCT_PREFIX = `${QUOTE_REQUEST_MESSAGE_LABELS.product}:`;
const ESTIMATE_HEADER = `${QUOTE_REQUEST_MESSAGE_LABELS.estimate}:`;

/**
 * What a quote request of the Aldaron site says, read back to prefill a draft quote: the product the
 * visitor named becomes the title, and each line of the simulator's estimate a line of the quote, priced 0
 * (the estimate is a summary, its amounts are not unit prices: the team types them). The message is the
 * one the site writes, one answer per line, the estimate last under its own header.
 * @param message the contact's message
 * @param fallbackTitle the title when the message names no product (a message typed by hand)
 */
export const parseQuoteRequestMessage = (message: string, fallbackTitle: string): QuoteRequestPrefill => {
  const lines = message.split(/\r?\n/);

  const productLine = lines.find((line) => line.startsWith(PRODUCT_PREFIX));
  const product = productLine?.slice(PRODUCT_PREFIX.length).trim();

  // the last header: a visitor may have typed the word in their needs, above it
  const estimateIndex = lines.map((line) => line.trim()).lastIndexOf(ESTIMATE_HEADER);
  const estimateLines = estimateIndex < 0 ? [] : lines.slice(estimateIndex + 1);

  return {
    title: (product || fallbackTitle).slice(0, QUOTE_TITLE_MAX_LENGTH),
    lines: estimateLines
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, QUOTE_LINES_MAX)
      .map((label) => ({ label: label.slice(0, QUOTE_LINE_LABEL_MAX_LENGTH), quantity: 1, unitAmount: 0 })),
  };
};
