import type { Locale } from '@/types/app.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { renderTicketReplyContent } from '@/emails/templates/ticket-reply.template';

import { sendEmailToRecipient } from '../../utils/_core/email.utils.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';

/**
 * Sends an agent's reply to someone who wrote from the public website form and has no account.
 *
 * It is the whole delivery for that person: with no account there is no in-app thread and no push
 * notification, so without this the agent would be answering into nothing. A ticket that does have
 * an account is left alone here — it is notified in-app, where the reply can actually be answered.
 *
 * A visitor who left a phone number and no email is answered by `sendTicketReplySms`: each of the
 * two returns early when the other one is the right channel, so a reply leaves by exactly one.
 * @param ticket the ticket being answered
 * @param replyMessage what the agent wrote
 * @param agent the agent who wrote it
 * @returns whether an email was sent — `false` for a ticket with an account or without an email
 */
export const sendTicketReplyEmail = async (
  ticket: Parse.Object,
  replyMessage: string,
  agent?: Parse.User
): Promise<boolean> => {
  // an account means an in-app thread, which is a better channel than a one-way email
  if (ticket.get('user')) return false;

  const email = ticket.get('email');

  // no address: the requester left a phone number, which is answered by SMS instead
  if (!email) return false;

  const locale = (ticket.get('locale') ?? DEFAULT_LANGUAGE) as Locale;
  const requesterName = ticket.get('name') || email;

  return sendEmailToRecipient(
    { email, lastName: requesterName },
    {
      subject: translate('email.ticketReplySubject', locale),
      message: renderTicketReplyContent({
        requesterName,
        originalMessage: ticket.get('message') ?? '',
        replyMessage,
        agentName: agent ? getUserFullName(agent) : translate('email.ticketReplyTeamName', locale),
        locale,
      }),
    }
  );
};
