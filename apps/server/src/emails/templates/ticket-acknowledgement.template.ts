import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { escapeHtml, renderTextAsHtml } from '@/utils/_core/utils';

import { renderNote } from './shared/render-note.template';
import { renderQuote } from './shared/render-quote.template';

type TicketAcknowledgementContentProps = {
  requesterName: string;
  reference?: number;
  /** what the person wrote — quoted back so they can check it arrived whole */
  message: string;
  locale: Locale;
};

/**
 * The receipt a visitor gets right after sending the website's contact form. Without it the form
 * was a black box: nothing told the person their message had arrived, nor gave them anything to
 * quote if they wrote or called again. The reference is the same short number support sees.
 */
export const renderTicketAcknowledgementContent = ({
  requesterName,
  reference,
  message,
  locale,
}: TicketAcknowledgementContentProps): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${escapeHtml(requesterName)}</b>,</p>
  <p style="margin:0 0 16px;">${translate('email.ticketAcknowledgementIntro', locale)}</p>
  ${reference ? `
  <p style="margin:20px 0;">
    ${translate('email.ticketAcknowledgementReferenceLabel', locale)} <b>#${reference}</b>
  </p>` : ''}
  ${renderQuote(translate('email.ticketReplyOriginalLabel', locale), renderTextAsHtml(message))}
  ${renderNote(translate('email.ticketAcknowledgementNextSteps', locale))}
`;
