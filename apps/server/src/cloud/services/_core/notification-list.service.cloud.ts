import { NotificationChannelStatusEnum, NotificationReadStateEnum } from '@shared/types';

import { collections, LOCALES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText } from '@/utils/_core/utils';

/**
 * How many notifications each tab of the back-office list holds, keyed by the tab's own database
 * field with `all` for the unscoped one. The figures are the size of each scope rather than of the
 * current search — they say how much there is to switch to, so narrowing the list does not shrink
 * the tab the reader is not on.
 */
export type NotificationTabCounts = {
  all: number;
  deleted: number;
};

export type NotificationListCounts = {
  tabCounts: NotificationTabCounts;
  /**
   * How many active sends each category holds, for the category filter. The filter states the
   * size of every category at once — including the ones the current search has narrowed away —
   * so an operator can see there is nothing to find under a category before switching to it.
   */
  typeCounts: Record<string, number>;
  /**
   * Sends a provider rejected on at least one channel for at least one recipient. It is the one
   * figure the list cannot show per row and that says whether the delivery pipeline itself is
   * healthy — every other non-delivery reason is a recipient's own setting, not an incident.
   */
  failedSendsCount: number;
};

/**
 * Counted through an aggregate rather than with a query per channel: the outcome sits inside
 * `channels.<channel>` as an array of per-recipient entries, so only `$elemMatch` can ask for
 * "one recipient this channel was rejected for" — an `equalTo` on the array would match a send
 * whose push succeeded and whose e-mail is the rejected one, and counting per channel and adding
 * the totals up would count the same send once per channel it failed on.
 */
const getFailedSendsCount = async (): Promise<number> => {
  const failedForOneRecipient = { $elemMatch: { status: NotificationChannelStatusEnum.FAILED } };

  const pipeline = [
    {
      $match: {
        deleted: { $ne: true },
        $or: [
          { 'channels.push': failedForOneRecipient },
          { 'channels.email': failedForOneRecipient },
          { 'channels.sms': failedForOneRecipient },
        ],
      },
    },
    { $group: { _id: null, count: { $sum: 1 } } },
  ];

  const groups: { count: number }[] = await new Parse.Query(collections.Notification)
    .aggregate(pipeline as any);

  return groups[0]?.count ?? 0;
};

/**
 * How many active sends each category holds. Grouped in one pass rather than counted per category:
 * the set of categories is open — any domain may register a notification type of its own — so a
 * query per known type would silently miss whichever type was added last.
 */
const getTypeCounts = async (): Promise<Record<string, number>> => {
  const pipeline = [
    { $match: { deleted: { $ne: true } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ];

  const groups: { objectId?: unknown; _id?: unknown; count: number }[] = await new Parse.Query(
    collections.Notification
  ).aggregate(pipeline as any);

  return groups.reduce<Record<string, number>>((counts, group) => {
    const type = group.objectId ?? group._id;

    if (typeof type !== 'string' || !type) return counts;

    return { ...counts, [type]: group.count };
  }, {});
};

/**
 * Every figure the notification list shows outside its rows. Read in one go alongside the page of
 * results: none of them can be derived from the rows just fetched, and the tab strip and the
 * filter panel state them next to that page.
 */
export const getNotificationListCounts = async (): Promise<NotificationListCounts> => {
  const [all, deleted, typeCounts, failedSendsCount] = await Promise.all([
    new Parse.Query(collections.Notification).equalTo('deleted', false).count(USE_MASTER_KEY),
    new Parse.Query(collections.Notification).equalTo('deleted', true).count(USE_MASTER_KEY),
    getTypeCounts(),
    getFailedSendsCount(),
  ]);

  return {
    tabCounts: { all, deleted },
    typeCounts,
    failedSendsCount,
  };
};

/**
 * Narrows a notification query to how far its sends have got through their recipients.
 *
 * The comparison the filter expresses — "opened by some but not all of them" — is between two
 * values of the same row, which a database query cannot state, so the answer is computed when the
 * row is written and stored in `readState`. Rows written before per-recipient tracking existed
 * carry no value for it at all and Mongo matches an absent field with nothing, which is why the
 * one-off backfill below exists.
 */
export const applyNotificationReadStateFilter = (
  query: Parse.Query,
  readStates: string[]
): void => {
  const accepted = readStates.filter((state): state is NotificationReadStateEnum => (
    Object.values(NotificationReadStateEnum).includes(state as NotificationReadStateEnum)
  ));

  if (accepted.length === 0) return;

  query.containedIn('readState', accepted);
};

/*
 * the sender as the snapshot stores them: first name, last name and e-mail, never a combined `name`
 * — matching a `name` key that no snapshot holds is what made the search look up the e-mail alone
 */
const SENDER_SNAPSHOT_SEARCH_FIELDS = [
  'snapshot.from.firstName', 'snapshot.from.lastName', 'snapshot.from.email',
];

const matchesAnyField = (fields: string[], text: string): Parse.Query => {
  const pattern = escapeText(text);

  return Parse.Query.or(
    ...fields.map((field) => new Parse.Query(collections.Notification).matches(field, pattern))
  );
};

/** Sends whose sender's first name, last name or e-mail contains the text. */
export const getNotificationSenderSearchQuery = (text: string): Parse.Query => (
  matchesAnyField(SENDER_SNAPSHOT_SEARCH_FIELDS, text)
);

/**
 * The back-office quick search: an operator has the sender's name, a phrase from the message or a
 * status code in hand, and should not have to say which one before typing — so the text is matched
 * against all three, the message in every language it is stored in.
 */
export const getNotificationTextSearchQuery = (text: string): Parse.Query => (
  matchesAnyField([
    ...SENDER_SNAPSHOT_SEARCH_FIELDS,
    ...LOCALES.map((locale) => `message.${locale}`),
    'status',
  ], text)
);
