import { TICKET_SUBJECT_GROUPS } from '@shared/domain-constants';
import { TicketSubjectEnum } from '@shared/types';

import i18n from '@/config/i18n';
import { ISelectOption } from '@/types/_core/app.type';
import { TicketPriorityEnum, TicketSourceEnum, TicketStatusEnum } from '@/types/_core/ticket-message.type';

/*
 * the inbox opens on the whole queue, then narrows to one status — `all` is a scope of the strip
 * rather than a status, so it is named here instead of being derived from the enum
 */
export const CONTACT_INBOX_ALL_SCOPE = 'all';

/*
 * the bin is a scope of the same strip rather than a page of its own: a deleted ticket is still a
 * ticket, read in the same three columns, and it is only offered to an account that may destroy one
 */
export const CONTACT_INBOX_DELETED_SCOPE = 'deleted';

/**
 * How many tickets one page of the inbox holds. Larger than a table page: a page of the queue is
 * scrolled inside its column, and turning it replaces what is shown rather than growing a list
 * the reader would otherwise lose their place in.
 */
export const CONTACT_INBOX_PAGE_SIZE = 30;

/**
 * Newest activity first, always. A support queue is read from the top — the ticket someone just
 * wrote on is the one that needs an answer, whatever order the rest were created in.
 */
export const CONTACT_INBOX_SORT = { orderBy: 'lastMessageAt', order: 'desc' } as const;

/**
 * How long the inbox waits after the last keystroke before it re-queries. The queue is searched by
 * typing rather than by submitting, so without this every letter would be one round trip — the same
 * delay the list pages' own search box uses.
 */
export const CONTACT_INBOX_SEARCH_DEBOUNCE = 500;

/**
 * The canned openings an agent picks from instead of retyping the same four answers. They are
 * kept as keys rather than as text so each one is written once per language, next to every other
 * string the inbox shows.
 */
export const TICKET_QUICK_REPLY_KEYS = ['checking', 'refund', 'missingDocument', 'closing'] as const;

export const TICKET_STATUS_OPTIONS: ISelectOption<TicketStatusEnum>[] = [
  { label: i18n.t('user:contacts.statuses.open'), value: TicketStatusEnum.OPEN },
  { label: i18n.t('user:contacts.statuses.in_progress'), value: TicketStatusEnum.IN_PROGRESS },
  { label: i18n.t('user:contacts.statuses.resolved'), value: TicketStatusEnum.RESOLVED },
  { label: i18n.t('user:contacts.statuses.closed'), value: TicketStatusEnum.CLOSED },
];

export const TICKET_PRIORITY_OPTIONS: ISelectOption<TicketPriorityEnum>[] = [
  { label: i18n.t('user:contacts.priorities.low'), value: TicketPriorityEnum.LOW },
  { label: i18n.t('user:contacts.priorities.medium'), value: TicketPriorityEnum.MEDIUM },
  { label: i18n.t('user:contacts.priorities.high'), value: TicketPriorityEnum.HIGH },
  { label: i18n.t('user:contacts.priorities.urgent'), value: TicketPriorityEnum.URGENT },
];

/*
 * the "date added" filter counts in days back from today, today included: "7 days" is this week
 * so far plus the six days before it, not a window ending yesterday
 */
export const CONTACT_INBOX_PERIOD_OPTIONS: ISelectOption<number>[] = [
  { label: i18n.t('user:contacts.addedToday'), value: 1 },
  { label: i18n.t('user:contacts.addedLastDays', { count: 7 }), value: 7 },
  { label: i18n.t('user:contacts.addedLastDays', { count: 30 }), value: 30 },
];

export const TICKET_SOURCE_OPTIONS: ISelectOption<TicketSourceEnum>[] = [
  { label: i18n.t('user:contacts.sourceApp'), value: TicketSourceEnum.APP },
  { label: i18n.t('user:contacts.sourceWeb'), value: TicketSourceEnum.WEB },
  { label: i18n.t('user:contacts.sourceSos'), value: TicketSourceEnum.SOS },
];

// in the app's own picker order, so an agent finds a subject where the requester chose it
export const TICKET_SUBJECT_OPTIONS: ISelectOption<TicketSubjectEnum>[] = TICKET_SUBJECT_GROUPS
  .flatMap(({ subjects }) => subjects)
  .map((subject: TicketSubjectEnum) => ({
    label: i18n.t(`user:contacts.subjects.${subject}`),
    value: subject,
  }));

/** The i18n keys naming each source: a short label (chip, filter), a long one (detail) and a hint */
type TicketSourceLabelKeys = { label: string; long: string; hint: string };

export const TICKET_SOURCE_LABEL_KEYS: Record<TicketSourceEnum, TicketSourceLabelKeys> = {
  [TicketSourceEnum.APP]: {
    label: 'user:contacts.sourceApp', long: 'user:contacts.sourceAppLong', hint: 'user:contacts.sourceAppHint',
  },
  [TicketSourceEnum.WEB]: {
    label: 'user:contacts.sourceWeb', long: 'user:contacts.sourceWebLong', hint: 'user:contacts.sourceWebHint',
  },
  [TicketSourceEnum.SOS]: {
    label: 'user:contacts.sourceSos', long: 'user:contacts.sourceSosLong', hint: 'user:contacts.sourceSosHint',
  },
};

// the time an SOS went out, on the 24-hour clock support reads alerts in
export const SOS_TRIGGERED_TIME_FORMAT = 'HH:mm';

/*
 * synthetic notification badge key for the SOS alerts support has not closed yet — not a Parse
 * class, a `source: sos` subset of `Contact`. A badge of its own because an SOS is someone in danger
 * on a ride right now: drowned in the unread tickets count, it read as one more message to answer.
 */
export const SOS_NOTIFICATION_KEY = 'openSosTickets';

// an SOS is still somebody's to handle until it is resolved or closed
export const OPEN_SOS_TICKET_STATUSES = [TicketStatusEnum.OPEN, TicketStatusEnum.IN_PROGRESS];

/*
 * how often the open SOS alerts are recounted — faster than the other badges, and even while the
 * tab is hidden: the other queues can wait for the reader to come back, an SOS is exactly what they
 * must not miss while working in another window. One count query every 20 s per open back-office.
 */
export const SOS_COUNT_POLL_INTERVAL_MS = 20_000;

/** The i18n key naming each language a requester can write in — the one their ticket was filed in */
export const TICKET_LOCALE_LABEL_KEYS: Record<string, string> = {
  fr: 'common:lang.french',
  en: 'common:lang.english',
  mg: 'common:lang.malagasy',
};
