import { TICKET_ATTACHMENT_MAX_COUNT } from '@shared/constants';
import { z } from 'zod';

import { TicketMessageSenderRoleEnum, TicketPriorityEnum, TicketStatusEnum } from '@/types/ticket.type';

import { paginationQuerySchema, objectIdFieldSchema } from './util.validations';

/*
 * every upload comes back as an https url; anything else was typed by hand, and a `javascript:` one
 * would run in the session of the agent who clicks it in the back-office
 */
export const ticketAttachmentSchema = z.object({
  publicId: z.string().nonempty(),
  url: z.url({ protocol: /^https$/ }),
});

/**
 * A message needs something in it, not necessarily words: a screenshot of the problem on its own
 * answers "could you show us?" just as well, so the text is only required when nothing is attached.
 */
const hasContent = (values: { message: string; attachments?: unknown[] }): boolean =>
  !!values.message.trim() || !!values.attachments?.length;

/**
 * TicketMessage beforeSave trigger validation — validates the Parse object's own fields
 * (`message`/`senderRole`), not the `sendTicketMessage` Cloud Function's params (which use
 * `ticketId`, not the pointer field `ticket`) — see `sendTicketMessageSchema` below for that.
 */
export const ticketMessageSchema = z.object({
  message: z.string().max(2000),
  senderRole: z.enum(TicketMessageSenderRoleEnum),
  attachments: z.array(ticketAttachmentSchema).max(TICKET_ATTACHMENT_MAX_COUNT).optional(),
  isInternal: z.boolean().optional(),
}).refine(hasContent, { path: ['message'] });

export const sendTicketMessageSchema = z.object({
  ticketId: objectIdFieldSchema,
  message: z.string().max(2000),
  attachments: z.array(ticketAttachmentSchema).max(TICKET_ATTACHMENT_MAX_COUNT).optional(),
  /*
   * only honoured for a back-office caller — a note is written by an agent about the ticket, so
   * the flag is dropped for anyone else rather than rejected
   */
  isInternal: z.boolean().optional(),
}).refine(hasContent, { path: ['message'] });

export const getTicketMessagesSchema = paginationQuerySchema.extend({
  ticketId: objectIdFieldSchema,
});

export const assignTicketSchema = z.object({
  ticketId: objectIdFieldSchema,
  // null hands the ticket back to the unassigned queue
  agentId: objectIdFieldSchema.nullable().optional(),
});

export const getTicketContextSchema = z.object({
  ticketId: objectIdFieldSchema,
});

export const updateTicketStatusSchema = z.object({
  ticketId: objectIdFieldSchema,
  status: z.enum(TicketStatusEnum),
});

export const updateTicketPrioritySchema = z.object({
  ticketId: objectIdFieldSchema,
  priority: z.enum(TicketPriorityEnum),
});
