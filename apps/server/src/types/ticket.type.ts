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
 * Where the ticket comes from: the public website or the app. It is recorded rather than derived: a
 * message sent from the public website by someone who happens to hold an account would otherwise be
 * indistinguishable from one written inside the app — the two are answered differently.
 */
export enum TicketSourceEnum {
  WEB = 'web',
  APP = 'app'
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
  id: string;
  ticket: Parse.Object;
  ticketOwner?: Parse.User;
  sender?: Parse.User;
  senderRole: TicketMessageSenderRole;
  message: string;
  attachments?: ITicketAttachment[];
  /**
   * An agent-written note kept inside the back-office: it is part of the thread an operator reads
   * but is never returned to the ticket's own author, and never notifies them.
   */
  isInternal?: boolean;
  deleted: boolean;
}

export interface ITicketMessage extends Parse.Object<ITicketMessageAttributes> {
  id: string;
}
