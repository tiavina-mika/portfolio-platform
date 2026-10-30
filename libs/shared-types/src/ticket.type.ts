/**
 * What a support request is about, picked by its author in the app. Stored as this key (never the
 * translated label) so the back-office can filter and count tickets per subject whatever the
 * language, and so a label can be reworded without touching the tickets already written.
 */
export enum TicketSubjectEnum {
  REFUND = 'refund',
  PAYMENT = 'payment',
  BOOKING = 'booking',
  RIDE_ISSUE = 'ride_issue',
  PUBLISH = 'publish',
  LOST_ITEM = 'lost_item',
  SAFETY = 'safety',
  REPORT_USER = 'report_user',
  VERIFICATION = 'verification',
  ACCOUNT = 'account',
  TECH = 'tech',
  OTHER = 'other'
}

export type TicketSubject = `${TicketSubjectEnum}`;

/** The headings the subjects are listed under, in the app's subject picker. */
export enum TicketSubjectGroupEnum {
  MONEY = 'money',
  RIDE = 'ride',
  TRUST = 'trust',
  ACCOUNT_AND_APP = 'account_and_app'
}

export type TicketSubjectGroup = `${TicketSubjectGroupEnum}`;

/**
 * The kinds of record a request can be attached to ("the ride concerned", "the payment
 * concerned"…). Which ones a subject asks for is declared in `TICKET_SUBJECT_OBJECTS`.
 */
export enum TicketObjectEnum {
  RIDE = 'ride',
  PAYMENT = 'payment',
  BOOKING = 'booking',
  USER = 'user'
}

export type TicketObject = `${TicketObjectEnum}`;

/**
 * Whose move it is on a request, as its author filters their own list: an open request is waiting
 * either on them or on support depending on who wrote last, and a finished one waits on nobody.
 */
export enum TicketAwaitingEnum {
  AWAITING_USER = 'awaiting_user',
  AWAITING_SUPPORT = 'awaiting_support',
  CLOSED = 'closed'
}

export type TicketAwaiting = `${TicketAwaitingEnum}`;
