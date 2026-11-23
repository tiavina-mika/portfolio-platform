import { QUOTE_LINE_LABEL_MAX_LENGTH, QUOTE_LINES_MAX } from '@shared/domain-constants';
import { describe, expect, it } from 'vitest';

import { parseQuoteRequestMessage } from './quote-request.utils';

// the message as the Aldaron site writes it (`composeQuoteMessage`)
const SITE_MESSAGE = [
  'Product: A booking app for a hair salon',
  'Platforms: Mobile app, Back-office',
  'Brings: Designs',
  'Needs:',
  'Online payment',
  'Estimate:',
  'With : designs',
  'Mobile app : about 8 screens',
  '',
  'Online payment (Mobile app) : 1 (900 €)',
].join('\n');

describe('reading a quote request of the site back into a draft quote', () => {
  it('should take the product the visitor named as the title', () => {
    expect(parseQuoteRequestMessage(SITE_MESSAGE, 'Fallback').title).toBe('A booking app for a hair salon');
  });

  it('should make one line per line of the estimate, priced 0 for the team to type, blank lines dropped', () => {
    expect(parseQuoteRequestMessage(SITE_MESSAGE, 'Fallback').lines).toEqual([
      { label: 'With : designs', quantity: 1, unitAmount: 0 },
      { label: 'Mobile app : about 8 screens', quantity: 1, unitAmount: 0 },
      { label: 'Online payment (Mobile app) : 1 (900 €)', quantity: 1, unitAmount: 0 },
    ]);
  });

  it('should read the estimate from the last header, not from the word typed in the needs', () => {
    const message = ['Product: App', 'Needs:', 'Estimate:', 'typed by the visitor', 'Estimate:', 'Web : 3'].join('\n');

    expect(parseQuoteRequestMessage(message, 'Fallback').lines.map(({ label }) => label)).toEqual(['Web : 3']);
  });

  it('should fall back on the given title and no line for a message typed by hand', () => {
    expect(parseQuoteRequestMessage('Hello, I need a website.', 'Quote request from Jane'))
      .toEqual({ title: 'Quote request from Jane', lines: [] });
  });

  it('should keep a product line empty after its label from making an empty title', () => {
    expect(parseQuoteRequestMessage('Product: \nEstimate:\nWeb : 3', 'Fallback').title).toBe('Fallback');
  });

  it('should keep the lines within what a quote accepts', () => {
    const longLine = 'x'.repeat(QUOTE_LINE_LABEL_MAX_LENGTH + 10);
    const message = ['Estimate:', longLine, ...Array.from({ length: QUOTE_LINES_MAX + 5 }, (_, i) => `l${i}`)]
      .join('\n');
    const { lines } = parseQuoteRequestMessage(message, 'Fallback');

    expect(lines).toHaveLength(QUOTE_LINES_MAX);
    expect(lines[0]!.label).toHaveLength(QUOTE_LINE_LABEL_MAX_LENGTH);
  });

  it('should read a message written with Windows line ends', () => {
    expect(parseQuoteRequestMessage('Product: App\r\nEstimate:\r\nWeb : 3', 'F')).toEqual({
      title: 'App', lines: [{ label: 'Web : 3', quantity: 1, unitAmount: 0 }],
    });
  });
});
