import { TICKET_REPLY_SMS_MAX_LENGTH } from '@shared/constants';
import { splitTypedPhoneNumber, toGsmSafeText } from '@shared/utils';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  TICKET_ACKNOWLEDGEMENT_SMS_MAX_PER_PHONE_PER_DAY, TICKET_REPLY_SMS_MAX_PER_PHONE_PER_DAY,
} from '@/constants/_core/ticket.constants';
import { sendSmsWithResult } from '@/services/sms.service';
import { logger } from '@/utils/_core/logger';
import { consumeDailyAllowance } from '@/utils/_core/sms-quota.utils';

import { countRecentTicketsByPhoneService } from '../../services/_core/contact.service.cloud';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a ticket is answered by SMS: it has a phone number and no other way to reach its author.
 * An account means an in-app thread, an email means an email — a text is only for the requester
 * who left a number alone, which is what a member without an email does.
 */
const isAnsweredBySms = (ticket: Parse.Object): boolean => (
  !ticket.get('user') && !ticket.get('email') && !!ticket.get('phone')
);

/**
 * Who a ticket's text goes to: the national digits and the dial code of the country the ticket's
 * number belongs to, read off the international form the ticket keeps. `undefined` when that form
 * names no country the platform runs in — national digits of it would reach a stranger.
 */
const getTicketSmsRecipient = (ticket: Parse.Object): { to: string; dialCode: string } | undefined => {
  const split = splitTypedPhoneNumber(String(ticket.get('phone')));

  return split ? { to: split.digits, dialCode: split.country.dialCode } : undefined;
};

/**
 * Texts the number of a ticket. The provider takes the national number, the way member numbers are
 * stored, while the ticket keeps the international form.
 * @returns whether the provider accepted the text; a refusal or an error is `false`, never thrown
 */
const sendTicketSms = async (ticket: Parse.Object, message: string, kind: string): Promise<boolean> => {
  try {
    const recipient = getTicketSmsRecipient(ticket);

    if (!recipient) {
      logger.warn(`${kind} SMS not sent — the number of the ticket is of no country we text`, {
        contactId: ticket.id,
      });
      return false;
    }

    const { data, errorCode } = await sendSmsWithResult({ ...recipient, message: toGsmSafeText(message) });

    if (data?.success) return true;

    logger.warn(`${kind} SMS not sent — code:`, errorCode);
    return false;
  }
  catch (error) {
    logger.error(`${kind} SMS failed`, { contactId: ticket.id, error: (error as Error).message });
    return false;
  }
};

/**
 * Confirms by SMS that a request arrived, with the reference to quote — the receipt of a requester
 * who left a phone number and no email. One short text, never more than a few a day to the same
 * number (see `TICKET_ACKNOWLEDGEMENT_SMS_MAX_PER_PHONE_PER_DAY`).
 *
 * Never throws: it is sent after the ticket is saved, and a failed text must not turn a filed
 * ticket into an error for the visitor.
 * @param ticket the ticket just created, its reference already drawn
 * @returns whether a text was sent — `false` for a ticket answered another way
 */
export const sendTicketAcknowledgementSms = async (ticket: Parse.Object): Promise<boolean> => {
  if (!isAnsweredBySms(ticket)) return false;

  try {
    const recentTickets = await countRecentTicketsByPhoneService(
      ticket.get('phone'),
      new Date(Date.now() - ONE_DAY_MS)
    );

    if (recentTickets > TICKET_ACKNOWLEDGEMENT_SMS_MAX_PER_PHONE_PER_DAY) {
      logger.warn('ticket acknowledgement SMS skipped: daily cap reached for this number', {
        contactId: ticket.id,
      });
      return false;
    }
  }
  catch (error) {
    logger.error('ticket acknowledgement SMS skipped: cap check failed', {
      contactId: ticket.id,
      error: (error as Error).message,
    });
    return false;
  }

  const locale = (ticket.get('locale') ?? DEFAULT_LANGUAGE) as Locale;
  const message = translate('sms.ticketAcknowledgement', locale, { reference: ticket.get('reference') });

  return sendTicketSms(ticket, message, 'Ticket acknowledgement');
};

/**
 * Sends an agent's reply by SMS to a requester who left a phone number and no email. It is the whole
 * delivery for that person: with no account there is no in-app thread, and with no email there is no
 * mailbox. The text is cut at `TICKET_REPLY_SMS_MAX_LENGTH`, since a long answer would cost one SMS
 * per segment; the agent can always call. Never more than `TICKET_REPLY_SMS_MAX_PER_PHONE_PER_DAY` a
 * day to the same number.
 * @param ticket the ticket being answered
 * @param replyMessage what the agent wrote
 * @returns whether a text was sent — `false` for a ticket answered another way
 */
export const sendTicketReplySms = async (ticket: Parse.Object, replyMessage: string): Promise<boolean> => {
  if (!isAnsweredBySms(ticket)) return false;

  try {
    const recipient = getTicketSmsRecipient(ticket);

    if (!recipient) return false;

    const retryAt = await consumeDailyAllowance(
      `sms:daily:ticket-reply:${recipient.dialCode}${recipient.to}`,
      TICKET_REPLY_SMS_MAX_PER_PHONE_PER_DAY
    );

    if (retryAt) {
      logger.warn('ticket reply SMS skipped: daily cap reached for this number', { contactId: ticket.id });
      return false;
    }
  }
  catch (error) {
    logger.error('ticket reply SMS skipped: cap check failed', {
      contactId: ticket.id,
      error: (error as Error).message,
    });
    return false;
  }

  const locale = (ticket.get('locale') ?? DEFAULT_LANGUAGE) as Locale;
  const trimmedReply = replyMessage.replace(/\s+/g, ' ').trim();
  const reply = trimmedReply.length > TICKET_REPLY_SMS_MAX_LENGTH
    ? `${trimmedReply.slice(0, TICKET_REPLY_SMS_MAX_LENGTH)}...`
    : trimmedReply;
  const message = translate('sms.ticketReply', locale, { reference: ticket.get('reference'), message: reply });

  return sendTicketSms(ticket, message, 'Ticket reply');
};
