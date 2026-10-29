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
 * Where the ticket comes from: the public website, the app, or an SOS raised during a ride. It is
 * recorded rather than derived: a message sent from the public website by someone who happens to
 * hold an account would otherwise be indistinguishable from one written inside the app, and an
 * SOS is generated rather than written — the three are answered differently.
 */
export enum TicketSourceEnum {
  WEB = 'web',
  APP = 'app',
  SOS = 'sos'
}

export type TicketSource = `${TicketSourceEnum}`;

/** What the app gets back once its request is filed: enough to show the confirmation screen. */
export type CreatedContact = {
  id: string;
  reference: number;
};

/** The ids of the records an app request is attached to, as `createContact` receives them. */
export type ContactObjectIds = {
  rideId?: string;
  /** the booking itself, or the passenger's booking on `rideId` */
  requestId?: string;
  paymentId?: string;
  reportedUserId?: string;
};

/** The same records once checked against their author, as the pointers the ticket stores. */
export type ContactObjects = {
  ride?: Parse.Object;
  request?: Parse.Object;
  payment?: Parse.Object;
  reportedUser?: Parse.Object;
};

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
