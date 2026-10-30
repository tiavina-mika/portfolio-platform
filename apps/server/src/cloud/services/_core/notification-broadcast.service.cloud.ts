import { randomUUID } from 'node:crypto';

import { ANNOUNCEMENT_STATUS } from '@shared/constants';

import type { BroadcastSegment } from '@/constants/_core/broadcast.constants';

import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { getUserFullName } from '@/cloud/utils/_core/user.utils.cloud';
import {
  BROADCAST_AUDIENCE_PAGE_SIZE, BROADCAST_HISTORY_LIMIT, BROADCAST_RECIPIENTS_PER_NOTIFICATION,
  BroadcastSegmentEnum,
} from '@/constants/_core/broadcast.constants';
import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { ANNOUNCEMENT_NOTIFICATION_TYPE } from '@/constants/_core/notification.constants';
import { logger } from '@/utils/_core/logger';

import { createNotification } from './notification.service.cloud';
import { scopeToAgentCountries } from '../../utils/_core/parse.utils.cloud';

export type BroadcastAudience = {
  segment: BroadcastSegment;
  /** the city the segment is narrowed to — required by, and only read for, the `city` segment */
  city?: string;
};

export type NotificationBroadcastInput = {
  /** what an operator typed, one entry per language the back-office offered */
  title: Record<string, string>;
  body: Record<string, string>;
  /** the back-office account behind the send, kept on every row it writes */
  sentBy?: Parse.User;
} & BroadcastAudience;

/** Escapes what an operator typed before it is used as a pattern — a city is data, not a regex. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The members an announcement is addressed to.
 *
 * An agent whose roles cover only some countries reaches the members of those countries only.
 *
 * Deleted and banned accounts are left out: one is gone and the other cannot open the app, so
 * writing to either produces a row nobody will ever read and a push to a device that is no longer
 * signed in.
 *
 * The city segment reads the address the member typed on their own profile, which is the only thing
 * an account says about where they are — and it is one free-text line, not a structured place. So
 * the city is looked for inside it rather than compared to a field of its own: an account reading
 * "Lot II M 12 Bis, Antananarivo" belongs to Antananarivo, and no amount of exact matching would
 * find it. Case-insensitive for the same reason. The cost of that shape is that a city whose name
 * appears inside another one's addresses would catch both, which is why the operator is shown the
 * count and asked to confirm it before anything leaves.
 */
const buildAudienceQuery = ({ segment, city }: BroadcastAudience): Parse.Query => {
  // an agent whose roles cover only some countries writes to the members of those countries
  const query = scopeToAgentCountries(new Parse.Query(Parse.User))
    .notEqualTo('deleted', true)
    .notEqualTo('banned', true);

  if (segment === BroadcastSegmentEnum.CITY && city) {
    query.matches('address', new RegExp(escapeRegExp(city)), 'i');
  }

  return query;
};

/**
 * How many members an announcement would reach, as the back-office states it before asking the
 * operator to confirm. Counted rather than estimated: "this will be sent to 14 327 people" is the
 * whole point of the confirmation, and a wrong number would make it theatre.
 */
export const countBroadcastAudience = async (audience: BroadcastAudience): Promise<number> => (
  buildAudienceQuery(audience).count(USE_MASTER_KEY)
);

export type BroadcastHistoryEntry = {
  /** the send's own id — the one shared by every row of it, or the row's id for a send that predates it */
  id: string;
  title: Record<string, string>;
  segment: BroadcastSegment;
  city?: string;
  recipientCount: number;
  sentAt: Date;
  /** the operator's full name, empty when the account no longer exists */
  sentBy: string;
};

type BroadcastHistoryRow = {
  _id: unknown;
  announcement: { title?: Record<string, string>; segment?: BroadcastSegment; city?: string };
  recipientCount: number;
  sentAt: Date;
  sentById?: string;
};

// how a user pointer is stored in Mongo, which is what the raw aggregate reads back
const USER_POINTER_PREFIX = '_User$';

/**
 * The announcements sent most recently, newest first, each stated once.
 *
 * A send is written as several rows (see `BROADCAST_RECIPIENTS_PER_NOTIFICATION`), so the list is
 * grouped on the id they share and the recipients are summed — reading the rows themselves would
 * list one announcement a hundred members at a time. Rows written before that id existed have none,
 * and stand alone under their own id: their count is the slice they addressed, not the whole send.
 * Sends the operator binned from the notification list are left out.
 */
export const getNotificationBroadcastHistory = async (): Promise<BroadcastHistoryEntry[]> => {
  const collection = await getMongoCollection(collections.Notification);

  const rows: BroadcastHistoryRow[] = await collection.aggregate([
    {
      $match: {
        type: ANNOUNCEMENT_NOTIFICATION_TYPE,
        status: ANNOUNCEMENT_STATUS,
        deleted: { $ne: true },
        _p_broadcastBy: { $exists: true },
      },
    },
    {
      $group: {
        _id: { $ifNull: ['$payload.announcement.broadcastId', '$_id'] },
        announcement: { $first: '$payload.announcement' },
        recipientCount: { $sum: { $size: { $ifNull: ['$to', []] } } },
        sentAt: { $max: '$_created_at' },
        sentById: { $first: '$_p_broadcastBy' },
      },
    },
    { $sort: { sentAt: -1 } },
    { $limit: BROADCAST_HISTORY_LIMIT },
  ]).toArray();

  const senderIds = [...new Set(rows.map(({ sentById }) => sentById?.replace(USER_POINTER_PREFIX, '')))]
    .filter((id): id is string => !!id);
  const senders = senderIds.length
    ? await new Parse.Query(Parse.User)
      .containedIn('objectId', senderIds)
      .select(['firstName', 'lastName'])
      .limit(senderIds.length)
      .find(USE_MASTER_KEY)
    : [];
  const senderNameById = new Map(senders.map((sender) => [sender.id, getUserFullName(sender)]));

  return rows.map(({
    _id, announcement, recipientCount, sentAt, sentById,
  }) => ({
    id: String(_id),
    title: announcement?.title ?? {},
    segment: announcement?.segment ?? BroadcastSegmentEnum.ALL,
    ...(announcement?.city && { city: announcement.city }),
    recipientCount,
    sentAt,
    sentBy: senderNameById.get(sentById?.replace(USER_POINTER_PREFIX, '') ?? '') ?? '',
  }));
};

/**
 * Writes an announcement to every member of a segment.
 *
 * One notification per slice of recipients rather than one for the whole audience: the recipients
 * are stored as a pointer array with a delivery outcome per recipient beside them, so a single row
 * for a hundred thousand members would be a document no page can draw and no push pass can retry.
 * Each slice pushes on its own, which also means a provider refusing one slice costs that slice
 * only.
 *
 * The rows carry no `from`: an announcement is the platform speaking, not the operator who typed it,
 * and naming them would put a support agent's name on every phone in the country. `broadcastBy` is
 * where the account behind it is recorded, which is what makes the notification list a log of who
 * sent what.
 *
 * @returns how many members it was written to
 */
export const sendNotificationBroadcast = async ({
  segment,
  city,
  title,
  body,
  sentBy,
}: NotificationBroadcastInput): Promise<number> => {
  const announcement = {
    title,
    body,
    segment,
    ...(city && { city }),
    // ties the rows of one send together, so the history can state it as the one event it was
    broadcastId: randomUUID(),
  };
  let sentAt = 0;
  let skip = 0;

  while (true) {
    const members = await buildAudienceQuery({ segment, city })
      .select(['objectId'])
      .ascending('createdAt')
      .skip(skip)
      .limit(BROADCAST_AUDIENCE_PAGE_SIZE)
      .find(USE_MASTER_KEY);

    if (members.length === 0) break;

    for (let index = 0; index < members.length; index += BROADCAST_RECIPIENTS_PER_NOTIFICATION) {
      const recipients = members.slice(index, index + BROADCAST_RECIPIENTS_PER_NOTIFICATION);

      try {
        await createNotification({
          type: ANNOUNCEMENT_NOTIFICATION_TYPE,
          to: recipients as Parse.User[],
          status: ANNOUNCEMENT_STATUS,
          payload: { announcement },
          ...(sentBy && { broadcastBy: sentBy }),
        });
        sentAt += recipients.length;
      }
      catch (error) {
        /*
         * one slice failing must not stop the announcement: an incident notice that reached four
         * fifths of the country is worth far more than one that stopped at the first error
         */
        logger.error('sendNotificationBroadcast: a slice of the audience was not written', {
          error: (error as Error).message,
          segment,
          city,
          skip: skip + index,
        });
      }
    }

    skip += members.length;

    if (members.length < BROADCAST_AUDIENCE_PAGE_SIZE) break;
  }

  logger.info(`sendNotificationBroadcast: announcement written to ${sentAt} member(s)`, {
    segment,
    city,
    sentById: sentBy?.id,
  });

  return sentAt;
};
