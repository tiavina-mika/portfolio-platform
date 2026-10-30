import { ANNOUNCEMENT_STATUS, TICKET_NEW_REPLY_FROM_AGENT_STATUS } from '@shared/constants';
import { NotificationTypeEnum } from '@shared/types';

import { ACCOUNT_NOTIFICATION_MESSAGES, TICKET_NOTIFICATION_MESSAGES } from './account-notification-message.constants';
import {
  DEFAULT_NOTIFICATION_MESSAGE_LOCALE, NOTIFICATION_MESSAGE_LOCALES, NotificationMessageSurfaceEnum,
} from './notification-message.type';

import type {
  LocalizedNotificationText, NotificationMessageEntry, NotificationMessageLocale,
  NotificationMessageSurface, NotificationMessageValues,
} from './notification-message.type';
import type { NotificationSnapshot } from '@shared/types';

/** A departure reminder sent a day ahead reads "tomorrow" rather than a number of hours. */
const HOURS_IN_A_DAY = 24;

/** What separates a status from the variant of it a notification's own data selects. */
const VARIANT_SEPARATOR = '#';

/**
 * Everything a notification carries for its text, whatever its age: the domain objects of the
 * legacy `snapshot` and of the newer `payload`, merged by the caller. Sender and recipients are not
 * part of it — the sender's name comes in as `senderName`, already resolved.
 */
export type NotificationMessageData = Partial<Omit<NotificationSnapshot, 'from' | 'to' | 'ride'>> & {
  /** `hoursBeforeDeparture` is set on a departure reminder: "tomorrow" or "in 1 h" */
  ride?: NotificationSnapshot['ride'] & { hoursBeforeDeparture?: number };
  /** the device a "new sign-in" alert names — what lets the member recognise (or not) the login */
  device?: { name?: string };
};

/**
 * How a date and an amount are printed for the person reading. Passed in rather than done here: a
 * departure hour belongs to the reader's timezone and an amount to their currency format, and the
 * server, the app and the back-office each already own those rules.
 */
export type NotificationMessageFormatters = {
  formatDate: (value: Date | string | number) => string;
  formatPrice: (value: number) => string;
};

export type NotificationMessageInput = {
  type?: string;
  status?: string;
  data?: NotificationMessageData;
  /**
   * Who the text is written for. Several support decisions mean the opposite for each side of the
   * same booking, so the same send is worded from the reader's own position.
   */
  viewerId?: string;
  /**
   * Whether a member raised it and their name is drawn just above the text. Only ever true on the
   * app surface, where the row prints the name on its own line — a push has no such line, so its
   * sentence always names the person itself.
   */
  hasSender?: boolean;
  /** the member who raised it, as `{{driver}}`, `{{passenger}}` and `{{from}}` print them */
  senderName?: string;
};

/** What rendering one sentence needs on top of naming the event it announces. */
export type NotificationMessageRenderInput = NotificationMessageInput &
  NotificationMessageFormatters & {
    surface: NotificationMessageSurface;
    locale: NotificationMessageLocale;
  };

/**
 * The catalogue's own language for a reader's locale. A language the platform does not write
 * notifications in falls back to the default rather than yielding nothing — a notification in French
 * is worth more than an empty one, and every caller (the push, the app's list, the back-office) faces
 * the same choice, so it is made once here.
 */
export const toNotificationMessageLocale = (locale?: string): NotificationMessageLocale => (
  NOTIFICATION_MESSAGE_LOCALES.includes(locale as NotificationMessageLocale)
    ? locale as NotificationMessageLocale
    : DEFAULT_NOTIFICATION_MESSAGE_LOCALE
);

/** Interpolates `{{name}}` placeholders; a value that is not supplied leaves nothing behind. */
export const interpolateNotificationMessage = (
  template: string,
  values: NotificationMessageValues
): string => template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
  const value = values[key];

  return value == null ? '' : String(value);
});

export const localizeNotificationText = (
  text: LocalizedNotificationText | undefined,
  locale: NotificationMessageLocale
): string | undefined => text?.[locale] ?? text?.[DEFAULT_NOTIFICATION_MESSAGE_LOCALE];

/**
 * The type a notification is filed under, derived from what it carries when the row predates the
 * column. Mirrors what the app has always done to read those rows.
 */
const resolveNotificationType = (input: NotificationMessageInput): string | undefined => {
  if (input.type) return input.type;

  const {
    ride, request, rating, ticket, vehicle,
  } = input.data ?? {};

  if (request) return NotificationTypeEnum.REQUEST;
  if (rating) return NotificationTypeEnum.RATE;
  if (ride) return NotificationTypeEnum.RIDE;
  if (ticket) return NotificationTypeEnum.TICKET;
  if (vehicle) return NotificationTypeEnum.VEHICLE;

  return NotificationTypeEnum.ACCOUNT;
};

export type NotificationMessageCatalogue = Record<string, NotificationMessageEntry>;

/**
 * What a domain adds to the values a sentence interpolates (the stops a ride change names, the car
 * of a document review). Receives what the notification carries and the language being written.
 */
export type NotificationMessageValuesBuilder = (
  input: NotificationMessageRenderInput,
  locale: NotificationMessageLocale
) => NotificationMessageValues;

/** The catalogue of each notification type; the ones that name the domain register themselves. */
const CATALOGUES_BY_TYPE: Record<string, NotificationMessageCatalogue> = {
  [NotificationTypeEnum.TICKET]: TICKET_NOTIFICATION_MESSAGES,
};

const valuesBuilders: NotificationMessageValuesBuilder[] = [];

/**
 * Files the sentences of one notification type, so the engine stays free of any domain: the app
 * registers the catalogues of its own domain at start-up, before any notification is written.
 * Registering a type again replaces its catalogue.
 */
export const registerNotificationMessageCatalogue = (
  type: string,
  catalogue: NotificationMessageCatalogue
): void => {
  CATALOGUES_BY_TYPE[type] = catalogue;
};

/** Adds the interpolated values a domain's sentences need; registering the same builder twice is a no-op. */
export const registerNotificationMessageValues = (builder: NotificationMessageValuesBuilder): void => {
  if (!valuesBuilders.includes(builder)) valuesBuilders.push(builder);
};

const getCatalogueForType = (type: string | undefined): NotificationMessageCatalogue => (
  (type && CATALOGUES_BY_TYPE[type]) || ACCOUNT_NOTIFICATION_MESSAGES
);

/**
 * The suffix a notification's own data appends to its status to pick a wording: a penalty that
 * names an amount, a reminder counted in hours, a support decision read by the side it went against.
 *
 * It exists because one status can be several sentences without being several events — splitting
 * them into statuses of their own would multiply what every client has to branch on, and what the
 * push templates would then have to cover.
 */
const resolveVariant = (input: NotificationMessageInput): string | undefined => {
  const { status, data = {}, viewerId } = input;
  const {
    ride, request, penalty, suspension, device,
  } = data;

  if (!status) return undefined;

  if (suspension?.until) return 'until';
  if (device?.name) return 'withDevice';

  if (penalty) {
    if (penalty.amount && penalty.suspensionEnd) return 'withAmountAndSuspension';
    if (penalty.amount) return 'withAmount';
    if (penalty.suspensionEnd) return 'withSuspension';
  }

  if (ride && typeof ride.hoursBeforeDeparture === 'number') {
    if (ride.hoursBeforeDeparture >= HOURS_IN_A_DAY) return 'tomorrow';

    return Math.max(1, Math.round(ride.hoursBeforeDeparture)) === 1 ? 'inHoursOne' : 'inHoursOther';
  }

  /*
   * a cancellation read by the driver who made it — the rows written before the penalty had a
   * status of its own are filed as the passengers' `CANCELED`
   */
  if (ride && !request && viewerId && ride.driverId === viewerId) return 'driver';

  // a decision that means the opposite for each side of the booking
  if (request && viewerId) return request.passengerId === viewerId ? 'passenger' : 'driver';

  return undefined;
};

/**
 * The entry a notification is written from: its status, narrowed by the variant its own data
 * selects when the catalogue has one, and the plain status otherwise.
 *
 * Sanctions and security alerts are looked up first, by status alone: they are filed under whatever
 * type raised them — a booking suspension under `REQUEST`, a lifted suspension once under `RIDE` —
 * and reading them as trip news is exactly what that lookup order prevents.
 */
export const getNotificationMessageEntry = (
  input: NotificationMessageInput
): NotificationMessageEntry | undefined => {
  const { status } = input;

  if (!status) {
    /* a ticket row written before the status was set is an agent's answer — the only one there was */
    return input.data?.ticket
      ? TICKET_NOTIFICATION_MESSAGES[TICKET_NEW_REPLY_FROM_AGENT_STATUS]
      : undefined;
  }

  const variant = resolveVariant(input);
  const catalogues = [ACCOUNT_NOTIFICATION_MESSAGES, getCatalogueForType(resolveNotificationType(input))];

  for (const catalogue of catalogues) {
    const withVariant = variant && catalogue[`${status}${VARIANT_SEPARATOR}${variant}`];

    if (withVariant) return withVariant;
    if (catalogue[status]) return catalogue[status];
  }

  return undefined;
};

/**
 * Everything a sentence of the catalogue can interpolate, built once from what the notification
 * carries. Values it has nothing for are left out rather than set to an empty string, so a template
 * naming one of them is visibly wrong in a test instead of silently rendering a hole.
 */
const buildMessageValues = (
  input: NotificationMessageRenderInput,
  locale: NotificationMessageLocale
): NotificationMessageValues => {
  const {
    data = {}, senderName, formatDate, formatPrice,
  } = input;
  const {
    ride, request, rating, penalty, refund, suspension, device,
  } = data;
  const entity = ride ?? request;
  const departure = entity?.departure;
  const destination = entity?.destination;
  const rawDate = entity?.date ?? request?.createdAt;
  const hours = ride?.hoursBeforeDeparture;

  return {
    ...(departure && { departure }),
    ...(destination && { destination }),
    ...(rawDate && { date: formatDate(rawDate as Date | string) }),
    ...(request?.pickup || departure ? { pickup: request?.pickup ?? departure } : {}),
    ...(request?.dropoff || destination ? { dropoff: request?.dropoff ?? destination } : {}),
    ...(senderName && { from: senderName, driver: senderName, passenger: senderName }),
    ...(typeof rating?.value === 'number' && { value: rating.value }),
    ...(typeof penalty?.amount === 'number' && { amount: formatPrice(penalty.amount) }),
    ...(typeof refund?.amount === 'number' && { amount: formatPrice(refund.amount) }),
    ...(penalty?.suspensionEnd && { date: formatDate(penalty.suspensionEnd as Date | string) }),
    ...(suspension?.until && { date: formatDate(suspension.until as Date | string) }),
    ...(device?.name && { device: device.name }),
    ...(typeof hours === 'number' && { count: Math.max(1, Math.round(hours)) }),
    ...Object.assign({}, ...valuesBuilders.map((build) => build(input, locale))),
  };
};

/**
 * The sentence one notification is read as on one surface, in one language — the single entry point
 * the server's push, the app's list and the back-office all go through.
 *
 * Returns `undefined` when nothing in the catalogue covers the event, which is what each caller
 * turns into its own fallback: the push skips the send rather than pushing an empty body, the app
 * draws its generic line. A status reaching this with no entry is a bug, and the shared catalogue is
 * what makes it one bug instead of one per app.
 */
export const getNotificationMessageText = (
  input: NotificationMessageRenderInput
): string | undefined => {
  const { surface, locale } = input;

  /*
   * an announcement is the one notification whose words are data: an operator typed them in the
   * back-office, so there is no template to look up — only the language to pick
   */
  if (input.status === ANNOUNCEMENT_STATUS) {
    const announcement = input.data?.announcement;

    return localizeNotificationText(announcement?.body as LocalizedNotificationText | undefined, locale) || undefined;
  }

  const entry = getNotificationMessageEntry(input);

  if (!entry) return undefined;

  const template = surface === NotificationMessageSurfaceEnum.PUSH
    ? localizeNotificationText(entry.push, locale)
    : localizeNotificationText(input.hasSender && entry.appWithSender ? entry.appWithSender : entry.app, locale);

  if (!template) return undefined;

  return interpolateNotificationMessage(template, buildMessageValues(input, locale));
};

/**
 * The title an announcement is pushed under, in the reader's language — the only notification that
 * carries one of its own, the rest being pushed under the app's name.
 */
export const getAnnouncementTitle = (
  data: NotificationMessageData | undefined,
  locale: NotificationMessageLocale
): string | undefined => localizeNotificationText(
  data?.announcement?.title as LocalizedNotificationText | undefined,
  locale
) || undefined;
