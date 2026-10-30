import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { EMAIL_COLORS } from '@/emails/theme';
import { escapeHtml, getClientUrl, renderTextAsHtml } from '@/utils/_core/utils';

import { renderQuote } from './shared/render-quote.template';

const { light } = EMAIL_COLORS;

type TicketReplyContentProps = {
  requesterName: string;
  /** what the person originally wrote — quoted back so they recognise the subject weeks later */
  originalMessage: string;
  replyMessage: string;
  agentName: string;
  locale: Locale;
};

/**
 * The reply an agent wrote, as it reaches someone who has no account and therefore no thread to
 * read it in. Everything the agent and the requester typed goes through `renderTextAsHtml`: it is
 * text, not markup, and its line breaks are the shape the agent gave the answer.
 *
 * The last block is the point of the whole email — this address is a dead end. Saying so plainly,
 * and saying what to do instead, is the difference between a person who creates an account and a
 * person who replies into the void and concludes that nobody read them.
 */
export const renderTicketReplyContent = ({
  requesterName,
  originalMessage,
  replyMessage,
  agentName,
  locale,
}: TicketReplyContentProps): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${escapeHtml(requesterName)}</b>,</p>
  <p style="margin:0 0 16px;">${translate('email.ticketReplyIntro', locale)}</p>
  ${renderQuote(translate('email.ticketReplyOriginalLabel', locale), renderTextAsHtml(originalMessage))}
  ${renderTextAsHtml(replyMessage)}
  <p class="em-muted" style="margin:16px 0 24px;font-size:14px;color:${light.muted};">
    ${translate('email.ticketReplySignature', locale, { agentName: escapeHtml(agentName) })}
  </p>
  <div class="em-warn" style="padding:14px 16px;border-radius:12px;background-color:${light.warnBg};
    font:400 14px/1.55 Onest, Arial, Helvetica, sans-serif;">
    <p style="margin:0 0 6px;"><b>${translate('email.ticketReplyCannotReplyTitle', locale)}</b></p>
    <p style="margin:0 0 8px;">${translate('email.ticketReplyCannotReplyBody', locale)}</p>
    <a href="${getClientUrl()}/${locale}/contact" style="text-decoration:underline;">
      ${translate('email.ticketReplyWriteAgain', locale)}
    </a>
  </div>
`;
