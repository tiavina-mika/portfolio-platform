import Parse from 'parse';

import { OPEN_SOS_TICKET_STATUSES } from '@/constants/_core/ticket.constants';
import { IContact, IContactSummary, ITicketContext } from '@/types/_core/contact.type';
import {
  ITicketAttachment, ITicketMessage, TicketPriority, TicketPriorityEnum, TicketSourceEnum, TicketStatus,
} from '@/types/_core/ticket-message.type';
import { IUser } from '@/types/_core/user.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

const collection = 'Contact';

export const fetchContact = async (id: string, include: string[] = []): Promise<IContact | undefined> => {
  const contact = await Parse.Cloud.run('getContact', { id, include });

  return contact?.toJSON ? toJSONWithId<IContact>(contact) : contact;
};

const toParseContact = (contact: IContact): Parse.Object =>
  Parse.Object.fromJSON({ ...contact, className: collection });

export const markContactAsReplied = async (contact: IContact): Promise<IContact> => {
  const parseContact = toParseContact(contact);

  parseContact.set('replied', true);
  const updatedContact = await parseContact.save();

  return toJSONWithId<IContact>(updatedContact);
};

/**
 * Records that an agent opened this ticket — a direct client save (like `markContactAsReplied`
 * above) rather than a Cloud Function, since `Contact`'s CLP already grants `update` to any BO
 * role with contact rights, and the session is also what lets the trigger name the agent.
 *
 * Two flags, one round trip, because they say different things: `seen` marks the ticket as picked
 * up by the back-office and is written on every visit (the trigger keeps the first date and counts
 * the rest), while `unreadByAdmin` is the "there is something new here" flag the inbox badge counts
 * and only needs clearing when it was actually raised.
 */
export const markTicketAsSeenByAdmin = async (
  ticketId: string,
  shouldClearUnread: boolean
): Promise<void> => {
  const parseContact = Parse.Object.extend(collection).createWithoutData(ticketId);

  parseContact.set('seen', true);
  if (shouldClearUnread) parseContact.set('unreadByAdmin', false);
  await parseContact.save();
};

type TicketMessagesResult = { results: ITicketMessage[]; count: number };

export const fetchTicketMessages = async (
  ticketId: string,
  limit: number,
  skip: number
): Promise<TicketMessagesResult> => {
  const result = await Parse.Cloud.run('getTicketMessages', { ticketId, limit, skip });

  return {
    results: (result.results ?? []).map((message: Parse.Object) => toJSONWithId<ITicketMessage>(message)),
    count: result.count ?? 0,
  };
};

export const sendTicketMessageService = async (
  ticketId: string,
  message: string,
  attachments?: ITicketAttachment[],
  isInternal?: boolean
): Promise<ITicketMessage> => {
  const ticketMessage = await Parse.Cloud.run('sendTicketMessage', {
    ticketId, message, attachments, isInternal,
  });

  return toJSONWithId<ITicketMessage>(ticketMessage);
};

/** How many tickets stand in each scope of the inbox — see the server's `getContactSummary`. */
export const fetchContactSummary = async (): Promise<IContactSummary> =>
  Parse.Cloud.run('getContactSummary');

/** The requester's record and their previous tickets, drawn beside the open thread. */
export const fetchTicketContext = async (ticketId: string): Promise<ITicketContext> => {
  const result = await Parse.Cloud.run('getTicketContext', { ticketId });

  return {
    requester: result.requester ?? null,
    previousTickets: (result.previousTickets ?? []).map(
      (ticket: Parse.Object) => toJSONWithId<IContact>(ticket)
    ),
  };
};

/** The back-office users a ticket can be handed to. */
export const fetchTicketAgents = async (): Promise<IUser[]> => {
  const agents = await Parse.Cloud.run('getTicketAgents');

  return (agents ?? []).map((agent: Parse.Object) => toJSONWithId<IUser>(agent));
};

export const assignTicketService = async (
  ticketId: string,
  agentId: string | null
): Promise<IContact> => {
  const updatedContact = await Parse.Cloud.run('assignTicket', { ticketId, agentId });

  return toJSONWithId<IContact>(updatedContact);
};

export const updateTicketStatusService = async (
  ticketId: string,
  status: TicketStatus
): Promise<IContact> => {
  const updatedContact = await Parse.Cloud.run('updateTicketStatus', { ticketId, status });

  return toJSONWithId<IContact>(updatedContact);
};

export const updateTicketPriorityService = async (
  ticketId: string,
  priority: TicketPriority
): Promise<IContact> => {
  const updatedContact = await Parse.Cloud.run('updateTicketPriority', { ticketId, priority });

  return toJSONWithId<IContact>(updatedContact);
};

/**
 * How many SOS alerts support has not closed yet — the dedicated badge of the notification centre.
 * Read through the inbox list itself with no rows asked for, so it counts exactly what the inbox
 * would show. Filtered on the urgent priority too: every SOS is filed urgent, which keeps out the
 * legacy tickets written before the source was stored.
 */
export const fetchOpenSosTicketsCount = async (): Promise<number> => {
  const result = await Parse.Cloud.run('getContacts', {
    limit: 0,
    skip: 0,
    search: {
      source: TicketSourceEnum.SOS,
      status: OPEN_SOS_TICKET_STATUSES,
      priority: [TicketPriorityEnum.URGENT],
    },
  });

  return result.count ?? 0;
};
