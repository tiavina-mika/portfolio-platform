import type { Locale } from '@/types/app.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { renderTicketAcknowledgementContent } from '@/emails/templates/ticket-acknowledgement.template';
import { logger } from '@/utils/_core/logger';

import { sendEmailToRecipient } from '../../utils/_core/email.utils.cloud';

/**
 * Confirms to someone who wrote from the public website form that their request arrived, with the
 * reference to quote. The app shows that reference on its own confirmation screen; the website
 * visitor, who may have no account, only has their mailbox.
 *
 * Never throws: it is sent after the ticket is saved, and a mail failure must not turn a filed
 * ticket into an error for the visitor.
 *
 * Only for a ticket that carries an email. A visitor who left a phone number alone is acknowledged
 * by `sendTicketAcknowledgementSms` instead: each of the two returns early when the other one is the
 * right channel, so the caller fires both and exactly one of them sends.
 * @param ticket the ticket just created, its reference already drawn
 * @returns whether an email was sent — `false` when the ticket has no email to send it to
 */
export const sendTicketAcknowledgementEmail = async (ticket: Parse.Object): Promise<boolean> => {
  const email: string | undefined = ticket.get('email');

  // no address: the requester left a phone number, which is answered by SMS instead
  if (!email) return false;

  const locale = (ticket.get('locale') ?? DEFAULT_LANGUAGE) as Locale;
  const requesterName: string = ticket.get('name') || email;

  try {
    return await sendEmailToRecipient(
      { email, lastName: requesterName },
      {
        subject: translate('email.ticketAcknowledgementSubject', locale),
        message: renderTicketAcknowledgementContent({
          requesterName,
          reference: ticket.get('reference'),
          message: ticket.get('message') ?? '',
          locale,
        }),
      }
    );
  }
  catch (error) {
    logger.error('sendTicketAcknowledgementEmail failed', {
      contactId: ticket.id,
      error: (error as Error).message,
    });
    return false;
  }
};
