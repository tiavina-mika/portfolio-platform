import { z } from 'zod';

import type { IUser } from '@/types/_core/user.type';

import { TICKET_QUICK_REPLY_KEYS } from '@/constants/_core/ticket.constants';
import { sendTicketMessageSchema } from '@/validations/_core/ticket-message.validations';

export type TicketQuickReplyKey = typeof TICKET_QUICK_REPLY_KEYS[number];

export enum TicketStatusEnum {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}
export type TicketStatus = `${TicketStatusEnum}`;

export enum TicketPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
export type TicketPriority = `${TicketPriorityEnum}`;

/**
 * Where the ticket was written from. Recorded at creation rather than derived from whether the
 * requester has an account: someone holding an account can still write from the public website,
 * and the two are answered differently.
 */
export enum TicketSourceEnum {
  WEB = 'web',
  APP = 'app',
  // opened by the server when a member raises an SOS during a ride — always urgent
  SOS = 'sos'
}
export type TicketSource = `${TicketSourceEnum}`;

export enum TicketMessageSenderRoleEnum {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  SYSTEM = 'system'
}
export type TicketMessageSenderRole = `${TicketMessageSenderRoleEnum}`;

export interface ITicketAttachment {
  publicId: string;
  url: string;
}

export interface ITicketMessageAttributes {
  objectId: string;
  sender?: IUser;
  senderRole: TicketMessageSenderRole;
  message: string;
  attachments?: ITicketAttachment[];
  /*
   * an agent's note about the ticket rather than a reply to it: part of the thread the back office
   * reads, never returned to the requester and never notifying them
   */
  isInternal?: boolean;
  createdAt: string;
}

export type ITicketMessage = ITicketMessageAttributes & { id: string };

export type SendTicketMessageInput = z.infer<typeof sendTicketMessageSchema>;
