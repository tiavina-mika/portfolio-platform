import { CONTACT_MESSAGE_MAX_LENGTH } from '@shared/constants';

import { IQuoteRequestInput } from '@/types/contact.type';

import {
  QUOTE_BRING_LABELS,
  QUOTE_SUPPORT_KEYS,
  QUOTE_SUPPORT_LABELS,
} from './contact.constants';

const ELLIPSIS = '…';

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, Math.max(0, maxLength - ELLIPSIS.length))}${ELLIPSIS}`;

/**
 * The quote request as the one text the `Contact` of the back-office stores: the form has more fields than
 * a contact has columns, so each answer takes a line of the message. The estimate comes last and is the
 * one to be cut when the message is too long for a contact.
 */
export const composeQuoteMessage = (input: IQuoteRequestInput): string => {
  const supports = QUOTE_SUPPORT_KEYS
    .filter(key => input.supports[key])
    .map(key => QUOTE_SUPPORT_LABELS[key])
    .join(', ');

  const lines = [
    `Product: ${input.product}`,
    `Platforms: ${supports}`,
    input.bring && `Brings: ${QUOTE_BRING_LABELS[input.bring]}`,
    input.needs && `Needs:\n${input.needs}`,
  ].filter(Boolean);

  const head = lines.join('\n');
  const estimatePrefix = '\nEstimate:\n';
  const estimateRoom = CONTACT_MESSAGE_MAX_LENGTH - head.length - estimatePrefix.length;

  if (!input.estimate || estimateRoom <= ELLIPSIS.length) return truncate(head, CONTACT_MESSAGE_MAX_LENGTH);

  return `${head}${estimatePrefix}${truncate(input.estimate, estimateRoom)}`;
};
