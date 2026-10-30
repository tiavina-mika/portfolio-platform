import { TicketObjectEnum, TicketSubjectEnum, TicketSubjectGroupEnum } from '@shared/types';

/**
 * The subjects of the app's subject picker, under their heading, in display order. Shared so the
 * server accepts exactly the subjects the app offers.
 */
export const TICKET_SUBJECT_GROUPS = [
  {
    group: TicketSubjectGroupEnum.MONEY,
    subjects: [TicketSubjectEnum.REFUND, TicketSubjectEnum.PAYMENT],
  },
  {
    group: TicketSubjectGroupEnum.RIDE,
    subjects: [
      TicketSubjectEnum.BOOKING,
      TicketSubjectEnum.RIDE_ISSUE,
      TicketSubjectEnum.PUBLISH,
      TicketSubjectEnum.LOST_ITEM,
    ],
  },
  {
    group: TicketSubjectGroupEnum.TRUST,
    subjects: [TicketSubjectEnum.SAFETY, TicketSubjectEnum.REPORT_USER, TicketSubjectEnum.VERIFICATION],
  },
  {
    group: TicketSubjectGroupEnum.ACCOUNT_AND_APP,
    subjects: [TicketSubjectEnum.ACCOUNT, TicketSubjectEnum.TECH, TicketSubjectEnum.OTHER],
  },
] as const;

/**
 * The reasons a subject offers, as stable keys (the labels live in the translations), most
 * frequent first: the app shows the first ones and folds the rest behind "see more". A subject
 * with an empty list takes no reason at all. A catch-all "other" reason is only kept in short
 * lists — longer ones already have the "other" subject for that, and a per-subject "other" would
 * dilute the back-office statistics.
 */
export const TICKET_SUBJECT_REASONS: Record<TicketSubjectEnum, readonly string[]> = {
  [TicketSubjectEnum.REFUND]: [
    'cancelled_by_driver', 'cancelled_by_me', 'booking_cancelled_by_driver', 'penalty_disputed',
    'wrong_amount',
  ],
  [TicketSubjectEnum.PAYMENT]: [
    'charged_without_booking', 'charged_twice', 'payment_failed', 'earnings_not_paid', 'commission',
  ],
  [TicketSubjectEnum.BOOKING]: ['cancelled_by_driver', 'invitation', 'change', 'cancel'],
  [TicketSubjectEnum.RIDE_ISSUE]: [
    'driver_no_show', 'delay', 'route_changed', 'passenger_no_show', 'different_vehicle', 'different_price',
  ],
  [TicketSubjectEnum.PUBLISH]: ['price', 'commission', 'seats', 'change', 'cancel', 'passengers'],
  [TicketSubjectEnum.LOST_ITEM]: ['lost', 'found'],
  [TicketSubjectEnum.SAFETY]: [
    'inappropriate_behavior', 'dangerous_driving', 'accident', 'harassment', 'other',
  ],
  [TicketSubjectEnum.REPORT_USER]: ['fake_profile', 'behavior', 'abusive_review', 'fraud', 'no_show'],
  [TicketSubjectEnum.VERIFICATION]: ['identity_document', 'driving_license', 'vehicle', 'phone', 'email'],
  [TicketSubjectEnum.ACCOUNT]: ['login', 'password', 'phone', 'suspension', 'deletion', 'personal_data'],
  [TicketSubjectEnum.TECH]: ['bug', 'slowness', 'security_flaw', 'other'],
  [TicketSubjectEnum.OTHER]: [],
};

/**
 * The (subject, reason) pairs support must see first: a security flaw must not sit in the queue,
 * and a double charge is money the requester is missing right now. Any other request is medium.
 */
export const TICKET_HIGH_PRIORITY_REASONS: Partial<Record<TicketSubjectEnum, readonly string[]>> = {
  [TicketSubjectEnum.TECH]: ['security_flaw'],
  [TicketSubjectEnum.PAYMENT]: ['charged_twice', 'charged_without_booking'],
  [TicketSubjectEnum.SAFETY]: TICKET_SUBJECT_REASONS[TicketSubjectEnum.SAFETY],
};

type TicketSubjectObject = {
  object: TicketObjectEnum;
  /** whether the request cannot be filed without it */
  required: boolean;
};

/**
 * The records a subject attaches, in the order the form asks for them. The first one is the
 * record the request is mainly about. A subject missing from this map attaches nothing (a
 * verification or an account question is about the account itself).
 */
export const TICKET_SUBJECT_OBJECTS: Partial<Record<TicketSubjectEnum, readonly TicketSubjectObject[]>> = {
  [TicketSubjectEnum.REFUND]: [{ object: TicketObjectEnum.RIDE, required: true }],
  [TicketSubjectEnum.PAYMENT]: [{ object: TicketObjectEnum.PAYMENT, required: true }],
  [TicketSubjectEnum.BOOKING]: [{ object: TicketObjectEnum.BOOKING, required: true }],
  [TicketSubjectEnum.RIDE_ISSUE]: [{ object: TicketObjectEnum.RIDE, required: true }],
  [TicketSubjectEnum.PUBLISH]: [{ object: TicketObjectEnum.RIDE, required: false }],
  [TicketSubjectEnum.LOST_ITEM]: [{ object: TicketObjectEnum.RIDE, required: true }],
  [TicketSubjectEnum.SAFETY]: [{ object: TicketObjectEnum.RIDE, required: false }],
  [TicketSubjectEnum.REPORT_USER]: [
    { object: TicketObjectEnum.USER, required: true },
    { object: TicketObjectEnum.RIDE, required: false },
  ],
};

