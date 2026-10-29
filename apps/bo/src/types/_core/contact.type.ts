import type { IPayment } from '@/types/_core/payment.type';
import type { ReportReason, ReportStatus } from '@/types/_core/report.type';
import type {
  ITicketMessage, TicketPriority, TicketSource, TicketStatus,
} from '@/types/_core/ticket-message.type';
import type { IUser } from '@/types/_core/user.type';
import type { RideUserTypeEnum, SosSmsStatusEnum } from '@shared/domain-types';
import type { TicketSubjectEnum } from '@shared/types';


/** A pointer the server resolved with `include`: the record itself, still keyed by its Parse id. */
export type IncludedRecord<T> = T & { objectId: string };

export interface IContactAttributes {
  objectId: string;
  // the record a ticket points at, when a domain attaches one (its shape is the domain's own)
  ride?: IncludedRecord<Record<string, any>>;
  /*
   * the short number the app shows the requester, and the one they quote over the phone or in a
   * chat — absent on the tickets opened before the sequence existed
   */
  reference?: number;
  /*
   * a requester leaves an email or a phone number, at least one: a visitor with no email (or an
   * account created by phone) is answered by SMS, so either can be absent. The phone is in
   * international form (+261341234567)
   */
  email?: string;
  phone?: string;
  name?: string;
  updatedAt: string;
  createdAt: string;
  deleted: boolean;
  user?: IUser;
  message: string;
  replied: boolean;
  repliedBy?: IUser;
  repliedAt?: string;
  locale?: string;
  acceptNewsLetter?: boolean;
  status: TicketStatus;
  priority: TicketPriority;
  lastMessageAt?: string;
  /*
   * two different questions, deliberately kept apart: `unreadByAdmin` says there is something new
   * to read on this ticket and comes back on every customer reply, while `seen` says the
   * back-office has picked the ticket up at least once and never goes back on its own. The badge
   * over the inbox counts the first; the second is what dates the pick-up and counts the visits.
   */
  unreadByAdmin?: boolean;
  seen?: boolean;
  // the FIRST opening, never rewritten — the three below say what happened after it
  seenAt?: string;
  seenBy?: IUser;
  lastSeenAt?: string;
  lastSeenBy?: IUser;
  seenCount?: number;
  /*
   * absent on tickets created before the field existed — read it through `getTicketSource`, which
   * falls back to what the ticket's own account says about where it must have come from
   */
  source?: TicketSource;
  /*
   * what the requester said the request is about, picked in the app — absent on tickets from the
   * website, from an SOS, and on those filed before subjects existed. `reason` is a key of the
   * subject's own list (`TICKET_SUBJECT_REASONS`), absent for a subject that takes none.
   */
  subject?: TicketSubjectEnum;
  reason?: string;
  // the agent who owes this requester an answer — absent while the ticket is still unclaimed
  assignedTo?: IUser;
  /*
   * the records the requester attached in the app, checked to be theirs when the ticket was filed —
   * absent on older tickets and on subjects that attach nothing
   */
  payment?: IncludedRecord<IPayment>;
  reportedUser?: IUser;
}

export type IContact = IContactAttributes & { id: string };

/** How many tickets each scope of the inbox holds, plus the size of the whole queue. */
export interface IContactSummary {
  total: number;
  byStatus: Record<TicketStatus, number>;
  unread: number;
}

/** What the inbox side panel says about the person who opened the ticket. */
export interface ITicketRequesterContext {
  memberSince?: string;
  isVerified: boolean;
  ridesCount: number;
  cancellationsCount: number;
  rating: number | null;
  reviewsCount: number;
}

/** The SOS behind a ticket the SOS opened — what the agent needs to call the right people */
export interface ITicketSosContext {
  triggeredAt: string;
  role: RideUserTypeEnum;
  /** the ride was still booked: the driver never declared it under way in the app */
  isRideNotStarted: boolean;
  ride: {
    id: string;
    departureLabel: string;
    destinationLabel: string;
    departureAt?: string;
    vehicleLabel: string;
    plate: string;
    driverName: string;
    /** the member who raised it when a passenger did, every accepted passenger when the driver did */
    passengerNames: string[];
  } | null;
  location: { latitude: number; longitude: number; mapUrl: string } | null;
  smsStatus: SosSmsStatusEnum;
  /** the contact as it was when the SOS went out — it may have changed since */
  emergencyContact: {
    name: string;
    relationship: string;
    phone: { code: string; number: string };
  } | null;
}

/** The report behind a ticket a report on a ride opened — enough to read where it stands and open it */
export interface ITicketReportContext {
  id: string;
  reason: ReportReason;
  status: ReportStatus;
}

export interface ITicketContext {
  requester: ITicketRequesterContext | null;
  previousTickets: IContact[];
  /** null on every ticket that was not opened by an SOS */
  sosAlert?: ITicketSosContext | null;
  /** null on every ticket that was not opened by a report */
  report?: ITicketReportContext | null;
}

/**
 * What the filter panel beside the inbox search narrows the queue by, on top of its scope. An unset
 * key is "any" — the panel offers "all" as a value of each group rather than an empty state.
 */
export interface IContactInboxFilters {
  // how many days back, today included, a ticket may have been created
  addedWithinDays?: number;
  priority?: TicketPriority;
  source?: TicketSource;
  subject?: TicketSubjectEnum;
  // the ISO alpha-2 code of the country the ticket was filed from
  country?: string;
}

export interface IContactState {
  loading: boolean;
  contact: IContact | null;
  contacts: IContact[];
  count: number;
  summary: IContactSummary | null;
  ticketContext: ITicketContext | null;
  ticketContextLoading: boolean;
  agents: IUser[];
  ticketMessages: ITicketMessage[];
  ticketMessagesCount: number;
  ticketMessagesLoading: boolean;
}
