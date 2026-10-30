import type {
  TicketPriority, TicketStatus, TicketMessageSenderRole, ITicketAttachment,
} from '@/types/ticket.type';

import { translate } from '@/config/i18n';
import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { FINISHED_TICKET_STATUSES } from '@/constants/_core/ticket.constants';
import {
  TicketMessageSenderRoleEnum, TicketStatusEnum,
} from '@/types/ticket.type';
import { setValues } from '@/utils/_core/utils';

import { createNotificationForTicketResolved } from './ticket-notification.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';

/*
 * `Parse.Object.extend` is idempotent for a given class name, so it's safe (and here,
 * necessary) to define this independently rather than import it from
 * `triggers/_core/ticket-message.triggers` — that file needs to call back into this service
 * (`getTicketById`) to look up the parent ticket, and `contact.triggers.ts` needs
 * `createTicketMessageService` too, so importing the class from `triggers/` would create a
 * circular import. Mirrors `Report` being defined independently in both
 * `triggers/_core/report.triggers.ts` and `services/_core/report.service.cloud.ts`.
 */
const TicketMessage = Parse.Object.extend(collections.TicketMessage);

const TICKET_MESSAGE_PROPERTIES = [
  'ticket', 'ticketOwner', 'sender', 'senderRole', 'message', 'attachments', 'isInternal',
];

export const getTicketById = async (ticketId: string): Promise<Parse.Object> => {
  return new Parse.Query(collections.Contact)
    .include(['user'])
    .get(ticketId, USE_MASTER_KEY);
};

type CreateTicketMessageInput = {
  ticket: Parse.Object;
  ticketOwner?: Parse.User;
  sender?: Parse.User;
  senderRole: TicketMessageSenderRole;
  message: string;
  attachments?: ITicketAttachment[];
  isInternal?: boolean;
};

export const createTicketMessageService = async (
  values: CreateTicketMessageInput
): Promise<Parse.Object> => {
  const ticketMessage = new TicketMessage();

  setValues(ticketMessage, values, TICKET_MESSAGE_PROPERTIES);

  return await ticketMessage.save(null, USE_MASTER_KEY);
};

type GetTicketMessagesInput = {
  ticketId: string;
  limit?: number;
  skip?: number;
  /**
   * agent-written notes are part of the thread only for the back office — the ticket's own author
   * must never receive one, so they are dropped from the query rather than filtered client-side
   */
  includeInternal?: boolean;
};

export const getTicketMessagesService = async ({
  ticketId,
  limit = DEFAULT_QUERY_LIMIT,
  skip = 0,
  includeInternal = false,
}: GetTicketMessagesInput): Promise<{ results: Parse.Object[]; count: number }> => {
  const query = new Parse.Query(TicketMessage)
    .equalTo('ticket', convertIdToPointer(collections.Contact, ticketId))
    .equalTo('deleted', false)
    .select(['ticket', 'sender', 'senderRole', 'message', 'attachments', 'isInternal', 'createdAt'])
    .include(['sender'])
    .limit(+limit)
    .skip(+skip)
    .ascending('createdAt');

  // `notEqualTo` rather than `equalTo(false)`: every message written before notes existed has no field at all
  if (!includeInternal) query.notEqualTo('isInternal', true);

  const result = await query.withCount().find(USE_MASTER_KEY);

  return result as unknown as { results: Parse.Object[]; count: number };
};

export const updateTicketStatusService = async (
  ticketId: string,
  status: TicketStatus
): Promise<Parse.Object> => {
  const ticket = await getTicketById(ticketId);
  const isAlreadyFinished = FINISHED_TICKET_STATUSES.includes(ticket.get('status'));
  const isFinished = FINISHED_TICKET_STATUSES.includes(status);

  ticket.set('status', status);

  // the submitter hasn't seen this status change yet
  if (isFinished) {
    ticket.set('unreadByUser', true);
  }

  const savedTicket = await ticket.save(null, USE_MASTER_KEY);

  // announced once, when it becomes finished — moving from resolved to closed is not news to the author
  if (isFinished && !isAlreadyFinished) {
    await createNotificationForTicketResolved(savedTicket);
  }

  return savedTicket;
};

export const updateTicketPriorityService = async (
  ticketId: string,
  priority: TicketPriority
): Promise<Parse.Object> => {
  const ticket = await getTicketById(ticketId);

  ticket.set('priority', priority);

  return ticket.save(null, USE_MASTER_KEY);
};

/**
 * Hands a ticket to one agent, or back to the unassigned queue when no agent is given. The
 * assignment is who owes the requester an answer, not a permission: any agent with contact rights
 * still reads and answers every ticket, so nothing else in the thread depends on this field.
 * @param ticketId the ticket to hand over
 * @param agentId the back-office user taking it, or null/undefined to unassign
 * @returns the saved ticket, with its new holder included
 */
export const assignTicketService = async (
  ticketId: string,
  agentId?: string | null
): Promise<Parse.Object> => {
  const ticket = await getTicketById(ticketId);

  if (agentId) {
    ticket.set('assignedTo', convertIdToPointer('_User', agentId));
  }
  else {
    ticket.unset('assignedTo');
  }

  const savedTicket = await ticket.save(null, USE_MASTER_KEY);

  await savedTicket.fetchWithInclude(['user', 'assignedTo'], USE_MASTER_KEY);

  return savedTicket;
};

/**
 * Puts a ticket its author considers unfinished back in the support queue, and records why the
 * thread suddenly has an open ticket again as a system message — the agent who picks it up reads
 * the reopening in the thread itself rather than having to compare two status dates.
 *
 * A ticket that is still open is returned untouched: reopening it would post a system message
 * saying something that never happened.
 * @param ticket the ticket to reopen, as read by `getTicketById`
 * @returns the ticket, reopened or untouched
 */
export const reopenTicketService = async (ticket: Parse.Object): Promise<Parse.Object> => {
  const status = ticket.get('status');

  if (status !== TicketStatusEnum.RESOLVED && status !== TicketStatusEnum.CLOSED) return ticket;

  ticket.set('status', TicketStatusEnum.OPEN);
  // the queue has something to look at again, and its author has already seen what they just did
  ticket.set('unreadByAdmin', true);
  ticket.set('unreadByUser', false);
  ticket.set('unreadCountByUser', 0);

  const reopenedTicket = await ticket.save(null, USE_MASTER_KEY);

  /*
   * written after the save: the message's own afterSave stamps `lastMessageAt`, so creating it
   * first would have the status save overwrite that stamp with the older one it was read with
   */
  await createTicketMessageService({
    ticket: reopenedTicket,
    ticketOwner: reopenedTicket.get('user'),
    senderRole: TicketMessageSenderRoleEnum.SYSTEM,
    /*
     * stored in the language the ticket was written in, not the caller's: the sentence is part of
     * the thread from now on, and the thread is read back by an agent as well as by its author
     */
    message: translate('ticket.reopenedSystemMessage', reopenedTicket.get('locale')),
  });

  return reopenedTicket;
};
