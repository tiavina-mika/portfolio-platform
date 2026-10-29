import {
  TICKET_NEW_REPLY_FROM_AGENT_STATUS, TICKET_NOTIFICATION_TYPE, TICKET_RESOLVED_STATUS,
} from '@/constants/_core/notification.constants';

import { createNotification } from './notification.service.cloud';

const buildTicketNotificationPayload = (ticket: Parse.Object): Record<string, unknown> => ({
  ticket: {
    id: ticket.id,
    status: ticket.get('status'),
  },
});

/*
 * No-op for tickets with no linked user (an anonymous web contact): there is nobody to notify
 * in-app, and that person is answered by e-mail instead. The recipient's preferences are not
 * applied here — the in-app row is always written, the push fan-out drops a muted channel.
 */
const createTicketNotification = async (
  ticket: Parse.Object,
  status: string
): Promise<Parse.Object | undefined> => {
  const user: Parse.User | undefined = ticket.get('user');

  if (!user) return;

  return createNotification({
    type: TICKET_NOTIFICATION_TYPE,
    to: [user],
    status,
    payload: buildTicketNotificationPayload(ticket),
  });
};

/** Notifies the ticket submitter that a BO agent has replied. */
export const createNotificationForTicketReply = async (
  ticket: Parse.Object
): Promise<Parse.Object | undefined> => createTicketNotification(ticket, TICKET_NEW_REPLY_FROM_AGENT_STATUS);

/**
 * Tells the submitter support considers their request handled. A ticket closed in silence read as
 * ignored, and the author only found out by opening it again.
 */
export const createNotificationForTicketResolved = async (
  ticket: Parse.Object
): Promise<Parse.Object | undefined> => createTicketNotification(ticket, TICKET_RESOLVED_STATUS);
