import { LANGUAGE_CODES } from '@shared/constants';

/**
 * Every language of the platform: a notification is written in all of them. The server writes the
 * push and the clients draw the row, so none may cover fewer languages than the others.
 */
export const NOTIFICATION_MESSAGE_LOCALES = LANGUAGE_CODES;

export type NotificationMessageLocale = typeof NOTIFICATION_MESSAGE_LOCALES[number];

/** Written in French when the reader's own language is unknown — the platform's default. */
export const DEFAULT_NOTIFICATION_MESSAGE_LOCALE: NotificationMessageLocale = 'fr';

/** One sentence in every language the platform writes. */
export type LocalizedNotificationText = Record<NotificationMessageLocale, string>;

/**
 * Everything one event is written as, in one place.
 *
 * A notification is read on two surfaces that need different sentences, not different *texts*: a
 * push arrives alone on a lock screen and has to carry its own context (who, where, when), while
 * the app's row is drawn under the sender's name and above a line stating the ride and its date, so
 * repeating them there reads as noise. They used to be two catalogues in two apps — the push
 * templates on the server, the i18n keys on the phone — which is how a status ended up announced on
 * one surface and blank on the other. Here they are two fields of the same entry: a status cannot be
 * given one without the other.
 */
export type NotificationMessageEntry = {
  /** self-contained sentence, for a surface that carries no context of its own: the push */
  push: LocalizedNotificationText;
  /** the app's own line, for a notification the platform raised (no name drawn above it) */
  app: LocalizedNotificationText;
  /**
   * the app's line when a member raised it and their name is drawn just above — the sentence then
   * continues that name ("… a accepté votre réservation") instead of repeating it. Absent on an
   * event only the platform ever raises.
   */
  appWithSender?: LocalizedNotificationText;
};

/**
 * The values a sentence interpolates, written `{{name}}`. Already formatted by the caller: a date
 * belongs to the reader's timezone and an amount to their currency format, neither of which a
 * shared catalogue can know.
 */
export type NotificationMessageValues = Record<string, string | number | undefined>;

/** Which surface a sentence is being written for — they need different amounts of context. */
export enum NotificationMessageSurfaceEnum {
  /** a push arriving on its own: the sentence carries who, where and when */
  PUSH = 'push',
  /** a row in the app's notification list, drawn under a name and above the ride line */
  APP = 'app'
}

export type NotificationMessageSurface = `${NotificationMessageSurfaceEnum}`;
