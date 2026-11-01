import { TicketObjectEnum, TicketSubjectEnum, TicketSubjectGroupEnum } from '@shared/types';

/**
 * The subjects of the app's subject picker, under their heading, in display order. Shared so the
 * server accepts exactly the subjects the app offers.
 */
export const TICKET_SUBJECT_GROUPS = [
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
 * and a safety report must be read first. Any other request is medium.
 */
export const TICKET_HIGH_PRIORITY_REASONS: Partial<Record<TicketSubjectEnum, readonly string[]>> = {
  [TicketSubjectEnum.TECH]: ['security_flaw'],
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
  [TicketSubjectEnum.REPORT_USER]: [{ object: TicketObjectEnum.USER, required: true }],
};

