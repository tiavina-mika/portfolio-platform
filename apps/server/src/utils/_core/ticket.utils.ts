import { TICKET_LAST_MESSAGE_PREVIEW_LENGTH } from '@/constants/_core/ticket.constants';

/**
 * The part of a message a ticket keeps to show it in its author's list: whitespace collapsed,
 * since the row is two lines at most and a blank line would spend one of them on nothing.
 * @param message the message as written — empty when it only carries attachments
 * @returns the preview, empty when the message has no text
 */
export const getTicketMessagePreview = (message?: string): string =>
  (message ?? '').replace(/\s+/g, ' ').trim().slice(0, TICKET_LAST_MESSAGE_PREVIEW_LENGTH);
