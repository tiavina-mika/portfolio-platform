import type { NotificationChannel, NotificationPreferences } from '@/types/notification.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  BROADCAST_UI_RIGHT, collections, MAX_BULK_UPDATE_LIMIT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { NotificationChannelEnum, NotificationResendReasonEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import {
  bulkRestoreNotificationsSchema, bulkSetNotificationsReceiverSeenSchema,
  bulkSoftDeleteNotificationsSchema, destroyNotificationsSchema, getNotificationBroadcastHistorySchema,
  getNotificationResendsSchema,
  markAllMyNotificationsSeenSchema, previewNotificationBroadcastSchema, updateNotificationPreferencesSchema,
  getNotificationsSchema, getNotificationSchema, getNotificationSmsDailyCountsSchema,
  resendNotificationFailedDeliveriesSchema,
  resendNotificationSchema, sendNotificationBroadcastSchema, setNotificationReceiverSeenSchema,
} from '@/validations/_core/notification.validations';

import {
  type BroadcastHistoryEntry, countBroadcastAudience, getNotificationBroadcastHistory,
  sendNotificationBroadcast,
} from '../../services/_core/notification-broadcast.service.cloud';
import {
  applyNotificationReadStateFilter, getNotificationListCounts, getNotificationSenderSearchQuery,
  getNotificationTextSearchQuery,
} from '../../services/_core/notification-list.service.cloud';
import {
  attachNotificationResendSummaries, getNotificationResends, isNotificationChannelResendable,
  logNotificationResend, resendNotificationChannel,
} from '../../services/_core/notification-resend.service.cloud';
import {
  getNotificationSmsDailyCounts, type NotificationSmsDailyCount,
} from '../../services/_core/notification-sms-stats.service.cloud';
import {
  destroyNotificationsByIds, getFailedChannelRecipientIds, Notification,
  setNotificationSeenForRecipient, setNotificationsDeleted, setNotificationsSeenForAllRecipients,
  setUnseenNotificationsSeenForRecipient,
} from '../../services/_core/notification.service.cloud';
import {
  convertIdToPointer, filtersDatesQuery,
} from '../../utils/_core/parse.utils.cloud';
import { assertHasBoRight } from '../../utils/_core/role.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * what the back-office list renders per row. `channels` and `receiverSeenIds` are what the delivery
 * and read columns are drawn from, and `message`/`payload` are read without leaving the list — the
 * row opens onto its own content rather than into a page per notification.
 */
const NOTIFICATION_LIST_FIELDS = [
  'from', 'to', 'type', 'status', 'message', 'payload', 'channels', 'toCount',
  'receiverSeen', 'receiverSeenAt', 'receiverSeenIds', 'readState', 'deleted', 'createdAt',
];

/*
 * the two shapes of send the list separates: one addressed to a single person, and one fanned out
 * to several. They read completely differently — a delivery failure on a single send is that
 * person's problem to solve, on a fan-out it is one line of a batch — which is why the filter
 * exists and why the recipient count is stored rather than derived from the array's length, which
 * no query can measure.
 */
const SEND_TYPE_SINGLE = 'single';
const SEND_TYPE_MULTIPLE = 'multiple';

/*
 * a send with no `from` at all was raised by the platform itself (a job, a trigger) rather than by
 * a person — which is what the back-office list calls a system send. Every other one names the
 * account behind it.
 */
const SENDER_TYPE_SYSTEM = 'system';
const SENDER_TYPE_USER = 'user';

Parse.Cloud.define(
  'getNotifications',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      include = [],
    } = request.params;

    let query = new Parse.Query(Notification);

    /*
     * every search key is handled by name below: a catch-all loop over the remaining keys used to
     * turn the date range into a `containedIn('createdAt', [from, to])` on top of the range itself,
     * which no row can satisfy — the "sent between" filter returned nothing, ever
     */
    if (search) {
      /*
       * the two text searches are combined with `and` rather than each replacing the base query:
       * an OR query has to be the base the other constraints are added to, and the second one used
       * to overwrite the first when both were filled
       */
      const textQueries: Parse.Query[] = [];

      if (search.from) textQueries.push(getNotificationSenderSearchQuery(search.from));
      if (search.text) textQueries.push(getNotificationTextSearchQuery(search.text));
      if (textQueries.length > 0) query = Parse.Query.and(...textQueries);

      // search in an array user of pointers
      if (search.to) {
        const toText = escapeText(search.to);
        let userQuery = new Parse.Query(Parse.User);

        userQuery = Parse.Query.or(
          new Parse.Query(Parse.User).matches('email', toText),
          new Parse.Query(Parse.User).matches('firstName', toText),
          new Parse.Query(Parse.User).matches('lastName', toText)
        );

        query.matchesQuery('to', userQuery);
      }

      // array values
      for (const field of ['status', 'type']) {
        const value = search?.[field];

        if (value) {
          query.containedIn(field, value);
        }
      }

      if (search.readState) {
        applyNotificationReadStateFilter(query, search.readState);
      }

      if (search.sendType === SEND_TYPE_SINGLE) {
        query.equalTo('toCount', 1);
      }
      if (search.sendType === SEND_TYPE_MULTIPLE) {
        query.greaterThan('toCount', 1);
      }

      /*
       * `from` is absent on a send the platform raised by itself, so the two sender kinds are told
       * apart by the pointer existing rather than by a value stored next to it — there is nothing
       * to keep in sync, and a send can never claim to be automated while naming an author
       */
      if (search.senderType === SENDER_TYPE_SYSTEM) {
        query.doesNotExist('from');
      }
      if (search.senderType === SENDER_TYPE_USER) {
        query.exists('from');
      }

      filtersDatesQuery(query, search);
    }

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .select(NOTIFICATION_LIST_FIELDS)
      .include(['from', 'to', ...include]);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      /*
       * the sends one account was among the recipients of, named by id — read from that account's
       * own page; `to` is an array of pointers, so this matches any send that includes them
       */
      if (filters.toId) {
        query.equalTo('to', convertIdToPointer(collections.User, filters.toId));
      }
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    // what each row states about resends: what it can go out on again, and how often it already did
    result.results = await attachNotificationResendSummaries(result.results);

    /*
     * the size of each tab, of each category and of the delivery backlog — none of them can be
     * derived from the page of rows just fetched, and the tab strip and the filter panel state
     * them next to that page
     */
    const counts = await getNotificationListCounts();

    result.tabCounts = counts.tabCounts;
    result.typeCounts = counts.typeCounts;
    result.failedSendsCount = counts.failedSendsCount;

    return result;
  }, ['find'], collections.Notification),
  parseFunctionValidation(getNotificationsSchema)
);

Parse.Cloud.define(
  'getNotification',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const notification = await new Parse.Query(Notification)
      .equalTo('objectId', id)
      /*
       * the back-office notification page: list fields (see getNotifications) plus `updatedAt`,
       * `deletedAt`/`deletedBy` for its history, `receiverSeenDates` for when each recipient opened
       * it, and `ride`/`request`/`rating` — live Parse pointers
       * only pre-"decoupling" notifications ever had set (see INotificationAttributes in the BO) —
       * matching the field name the BO reads
       */
      .select([
        ...NOTIFICATION_LIST_FIELDS, 'updatedAt', 'deletedAt', 'deletedBy', 'undeletedAt', 'undeletedBy',
        'receiverSeenDates', 'ride', 'request', 'rating',
        /*
         * the back-office account behind a hand-written announcement — the one notification nobody
         * raised automatically, and the only one whose history has an author to name
         */
        'broadcastBy',
      ])
      .include([
        'from', 'to', 'deletedBy', 'undeletedBy', 'broadcastBy', 'ride', 'request', 'rating', ...include,
      ])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!notification) return false;

    /*
     * the same resend summary the list rows carry, so the list can refresh one row from here after
     * a resend without losing what that row states about its resends
     */
    const [withSummary] = await attachNotificationResendSummaries([notification]);

    return withSummary ?? notification;
  }, ['get'], collections.Notification),
  parseFunctionValidation(getNotificationSchema)
);

/*
 * what a resend reads: the recipients and their channel entries to pick the targets from, and what a
 * channel is rebuilt out of — the push body is the notification's own message, an e-mail or an SMS
 * is written again from its type, status and payload
 */
const NOTIFICATION_RESEND_FIELDS = ['to', 'from', 'type', 'status', 'payload', 'message', 'channels'];

/**
 * Sends a notification again on one channel — to all of its recipients, or to the ones the caller
 * names — and records the resend in the send's history.
 *
 * A message is sent once, at creation, and a phone that was offline, a mailbox that bounced or a
 * number that was briefly unreachable simply never gets it. Support had no answer to "I never
 * received it" beyond asking the person to look again; this is it. The notification itself is not
 * rewritten: the same send goes out a second time, and the channel's entries record how it ended.
 *
 * `toIds` is what makes the narrower resends possible — the recipients a provider rejected, the
 * ones who have not opened it, one person picked from the grid — without re-alerting everybody the
 * first send did reach. Returns how many recipients it went to: 0 when the channel cannot be rebuilt
 * for this send, or when nobody named was addressed on it.
 */
Parse.Cloud.define(
  'resendNotification',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const {
      id, channel = NotificationChannelEnum.PUSH, toIds, reason,
    } = request.params;

    const notification = await new Parse.Query(Notification)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .select(NOTIFICATION_RESEND_FIELDS)
      .include(['to'])
      .first(USE_MASTER_KEY);

    if (!notification) return 0;

    const recipients: Parse.User[] = notification.get('to') || [];
    /*
     * an explicit list is narrowed against the send's own recipients rather than trusted: a stale
     * id — a recipient removed from the send since the page was loaded — would otherwise send a
     * message about a notification that is no longer addressed to them
     */
    const targets = toIds?.length
      ? recipients.filter((recipient) => toIds.includes(recipient.id))
      : recipients;
    const resentIds = await resendNotificationChannel(notification, channel, targets);

    await logNotificationResend({
      notification,
      channel,
      reason: reason ?? (toIds?.length
        ? NotificationResendReasonEnum.RECIPIENT
        : NotificationResendReasonEnum.ALL),
      toIds: resentIds,
      resentBy: request.user,
    });

    return resentIds.length;
  }, ['update'], collections.Notification),
  parseFunctionValidation(resendNotificationSchema)
);

/**
 * Sends every send in the selection again, to the recipients a provider rejected it for, on every
 * channel that was refused and can be rebuilt.
 *
 * Only `failed` is retried. Every other non-delivery reason — no device registered, no phone number,
 * the recipient turned the channel off — says there was nothing to send in the first place, so
 * retrying them would either fail identically or override a choice the recipient made. Returns how
 * many recipients each channel went to, which is what tells the caller whether there was anything
 * to retry and on what — an SMS costs credits, a push does not.
 */
Parse.Cloud.define(
  'resendNotificationFailedDeliveries',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<NotificationChannel, number>> => {
    const { ids } = request.params;

    const notifications = await new Parse.Query(Notification)
      .containedIn('objectId', ids)
      .notEqualTo('deleted', true)
      .select(NOTIFICATION_RESEND_FIELDS)
      .include(['to'])
      .limit(MAX_BULK_UPDATE_LIMIT)
      .find(USE_MASTER_KEY);

    const resentCounts: Record<NotificationChannel, number> = {
      [NotificationChannelEnum.PUSH]: 0,
      [NotificationChannelEnum.EMAIL]: 0,
      [NotificationChannelEnum.SMS]: 0,
    };

    for (const notification of notifications) {
      const recipients: Parse.User[] = notification.get('to') || [];

      for (const channel of Object.values(NotificationChannelEnum)) {
        const failedIds = getFailedChannelRecipientIds(notification, channel);

        if (failedIds.length === 0) continue;

        const resentIds = await resendNotificationChannel(
          notification,
          channel,
          recipients.filter((recipient) => failedIds.includes(recipient.id))
        );

        resentCounts[channel] += resentIds.length;

        await logNotificationResend({
          notification,
          channel,
          reason: NotificationResendReasonEnum.FAILED,
          toIds: resentIds,
          resentBy: request.user,
        });
      }
    }

    return resentCounts;
  }, ['update'], collections.Notification),
  parseFunctionValidation(resendNotificationFailedDeliveriesSchema)
);

/**
 * What the back-office page needs to state a send's resends and to offer new ones: every resend so
 * far, newest first, with the account behind it, and the channels this send can be sent again on —
 * the push always, an e-mail or an SMS only when the domain that raised it registered how to write
 * it again.
 */
Parse.Cloud.define(
  'getNotificationResends',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, unknown> | false> => {
    const { id } = request.params;
    const notification = await new Parse.Query(Notification)
      .equalTo('objectId', id)
      .select(['type'])
      .first(USE_MASTER_KEY);

    // false rather than undefined: the client reads a plain `undefined` return as a success
    if (!notification) return false;

    return {
      resends: await getNotificationResends(notification),
      resendableChannels: Object.values(NotificationChannelEnum)
        .filter((channel) => isNotificationChannelResendable(notification, channel)),
    };
  }, ['get'], collections.Notification),
  parseFunctionValidation(getNotificationResendsSchema)
);

/**
 * Records that the caller has opened (or re-hidden) a notification addressed to them.
 *
 * The app used to write `receiverSeen` straight through the SDK, which was a single flag for the
 * whole send: the first of four passengers to open a cancellation marked it read for all of them.
 * Going through a Cloud Function is what lets the recipient be taken from the session instead of
 * from the request, so nobody can state what someone else has read.
 */
Parse.Cloud.define(
  'setNotificationReceiverSeen',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, value, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      return Promise.reject(new Error(translate('error.pleaseLogin', locale)));
    }

    const notification = await setNotificationSeenForRecipient(id, user, value);

    // false rather than undefined: the client reads a plain `undefined` return as a success
    return notification ?? false;
  }),
  parseFunctionValidation(setNotificationReceiverSeenSchema)
);

/**
 * "Mark all as read" from the app's notification list: every notification addressed to the caller
 * that they have not opened yet. Only the caller's own entry is written — the other recipients of a
 * shared send keep their own read state.
 * @returns how many notifications were marked
 */
Parse.Cloud.define(
  'markAllMyNotificationsSeen',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) throw new Error(translate('error.pleaseLogin', locale));

    return setUnseenNotificationsSeenForRecipient(user);
  }),
  parseFunctionValidation(markAllMyNotificationsSeenSchema)
);

/**
 * Saves what the caller chose to receive by push and e-mail. The only way to write
 * `notificationPreferences`: the `_User` trigger reverts a direct write, which used to accept any
 * shape the client sent and was then read by every push and e-mail sender.
 * @returns the preferences as saved
 */
Parse.Cloud.define(
  'updateNotificationPreferences',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<NotificationPreferences> => {
    const { preferences, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) throw new Error(translate('error.pleaseLogin', locale));

    const account = await new Parse.Query(Parse.User)
      .select(['notificationPreferences'])
      .get(user.id, USE_MASTER_KEY);
    const saved: NotificationPreferences = { ...account.get('notificationPreferences'), ...preferences };

    account.set('notificationPreferences', saved);
    await account.save(null, USE_MASTER_KEY);

    return saved;
  }),
  parseFunctionValidation(updateNotificationPreferencesSchema)
);

/*
 * batches what used to be N sequential client -> Parse Server save() calls
 * (apps/bo/src/services/_core/notification.service.ts, one .each() per selected row) into a
 * single round trip — the server loop below still touches the database once per row, but over an
 * internal connection instead of the client's network round trip per row
 */
Parse.Cloud.define(
  'bulkSetNotificationsReceiverSeen',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object[]> => {
    const { ids, value } = request.params;

    return setNotificationsSeenForAllRecipients(ids, value);
  }, ['update'], collections.Notification),
  parseFunctionValidation(bulkSetNotificationsReceiverSeenSchema)
);

Parse.Cloud.define(
  'bulkSoftDeleteNotifications',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { ids } = request.params;

    // the acting admin is what `setBooleanFields` records as `deletedBy`
    const saved = await setNotificationsDeleted(ids, true, request.user);

    return saved.length;
  }, ['delete'], collections.Notification),
  parseFunctionValidation(bulkSoftDeleteNotificationsSchema)
);

/**
 * Takes binned sends back out of the recycle bin.
 *
 * The bin used to be a one-way door: a send binned by mistake — a whole selection mis-clicked — could
 * only be destroyed, never put back, while the back-office documentation said otherwise. It is the
 * same soft-delete flag, flipped, and the trigger records who flipped it (`undeletedAt`/`undeletedBy`)
 * exactly as it records who binned it.
 * @returns how many sends were taken out of the bin
 */
Parse.Cloud.define(
  'bulkRestoreNotifications',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { ids } = request.params;

    const saved = await setNotificationsDeleted(ids, false, request.user);

    return saved.length;
  }, ['update'], collections.Notification),
  parseFunctionValidation(bulkRestoreNotificationsSchema)
);

/**
 * Destroys binned sends for good, with the resend history that names who each one went to.
 *
 * Its own function rather than the generic `destroyObjects`: that one knows nothing about the
 * `NotificationResend` rows hanging off a send, and would leave them behind naming recipients of a
 * notification that no longer exists — which is exactly what the retention purge cascades to avoid.
 * Only rows already in the bin are destroyed, so the list itself can never erase anything.
 * @returns how many sends were destroyed
 */
Parse.Cloud.define(
  'destroyNotifications',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { ids } = request.params;

    return destroyNotificationsByIds(ids);
  }, ['destroy'], collections.Notification),
  parseFunctionValidation(destroyNotificationsSchema)
);

/**
 * How many members an announcement would reach, before anyone is asked to confirm sending it.
 *
 * Its own call rather than a number the back-office guesses from a filter: the operator is about to
 * write to a segment of the membership at once, and the one figure that makes that decision
 * reviewable is how many people are actually in it.
 */
Parse.Cloud.define(
  'previewNotificationBroadcast',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ recipientCount: number }> => {
    const { segment, city, locale = DEFAULT_LANGUAGE } = request.params;

    await assertHasBoRight(request.user!, BROADCAST_UI_RIGHT, locale);

    return { recipientCount: await countBroadcastAudience({ segment, city }) };
  }, undefined, undefined),
  parseFunctionValidation(previewNotificationBroadcastSchema)
);

/**
 * Sends an announcement written in the back-office to a segment of the members.
 *
 * Three things stand between an operator and every phone in the country, and all three are here
 * rather than in the interface: a dedicated back-office right, which the `update` right on
 * notifications deliberately does not grant; a recipient count the caller has to have seen and sent
 * back, so a send can never reach an audience nobody reviewed; and the audience being recounted at
 * send time and compared against it, since a broadcast cannot be taken back.
 *
 * @returns how many members it was written to
 */
Parse.Cloud.define(
  'sendNotificationBroadcast',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ recipientCount: number }> => {
    const {
      segment, city, title, body, expectedRecipientCount, locale = DEFAULT_LANGUAGE,
    } = request.params;

    await assertHasBoRight(request.user!, BROADCAST_UI_RIGHT, locale);

    const recipientCount = await countBroadcastAudience({ segment, city });

    /*
     * the audience moved between the preview and the confirmation — a sign-up wave, a city typed
     * differently. Refused rather than sent: the operator confirmed a number, and this is no longer
     * the send they confirmed.
     */
    if (recipientCount !== expectedRecipientCount) {
      throw new Error(translate('error.notificationBroadcastAudienceChanged', locale, {
        expected: String(expectedRecipientCount),
        actual: String(recipientCount),
      }));
    }

    const sentCount = await sendNotificationBroadcast({
      segment, city, title, body, sentBy: request.user,
    });

    logger.info(`Announcement broadcast to ${sentCount} member(s) by ${request.user?.id}`, {
      segment,
      city,
    });

    return { recipientCount: sentCount };
  }, undefined, undefined),
  parseFunctionValidation(sendNotificationBroadcastSchema)
);

/**
 * The announcements sent most recently, for the list under the broadcast form. Behind the same
 * right as the send: it names who wrote to the membership and what they said.
 */
Parse.Cloud.define(
  'getNotificationBroadcastHistory',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<BroadcastHistoryEntry[]> => {
    const { locale = DEFAULT_LANGUAGE } = request.params;

    await assertHasBoRight(request.user!, BROADCAST_UI_RIGHT, locale);

    return getNotificationBroadcastHistory();
  }, undefined, undefined),
  parseFunctionValidation(getNotificationBroadcastHistorySchema)
);

/**
 * How many SMS the notifications sent each day, with what they cost and how many were held back by
 * the daily allowance — the measure the fallback SMS events are judged on before widening the list.
 */
Parse.Cloud.define(
  'getNotificationSmsDailyCounts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<NotificationSmsDailyCount[]> => {
    const { days } = request.params;

    return getNotificationSmsDailyCounts(days);
  }, ['find'], collections.Notification),
  parseFunctionValidation(getNotificationSmsDailyCountsSchema)
);
