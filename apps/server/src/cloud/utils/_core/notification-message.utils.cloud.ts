import { type Country } from '@shared/constants';
import { formatAmount, type NotificationMessageData } from '@shared/utils';
import omit from 'lodash/omit.js';


import { formatDateInAppTimezone } from '@/utils/_core/date.utils';

/**
 * Everything a notification carries for its text, whatever its age: the domain objects the older
 * rows kept in `snapshot` merged with the `payload` the newer ones carry. Sender and recipients are
 * left out — they are not domain data, and the sender's name is resolved separately.
 */
export const getNotificationMessageData = (notification: Parse.Object): NotificationMessageData => ({
  ...omit(notification.get('snapshot') ?? {}, ['from', 'to']),
  ...(notification.get('payload') ?? {}),
});

/**
 * A date as the members read it: in their own timezone, since the server clock is UTC and a
 * departure hour printed from it is off by three hours on every push.
 *
 * A date nested inside a generic JSON payload comes back from Mongo as Parse's own
 * `{ __type: 'Date', iso }` wrapper rather than a `Date`, so it is unwrapped here — where every
 * notification text goes through — instead of in each domain that writes one.
 */
export const formatNotificationDate = (value: Date | string | number): string => {
  const raw = (value as unknown as { iso?: string })?.iso ?? value;

  return formatDateInAppTimezone(raw);
};

/**
 * An amount as the app prints it — grouped thousands followed by the currency — so a penalty reads
 * the same in a notification as it does on the screen it sends the member to. Written in the
 * currency of the recipient's country.
 */
export const formatNotificationPrice = (value: number, country?: Country): string => (
  formatAmount(value, country)
);
