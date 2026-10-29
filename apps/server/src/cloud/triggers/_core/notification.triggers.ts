/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';
import omit from 'lodash/omit.js';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { NotificationReadStateEnum } from '@/types/notification.type';
import {
  getNotificationReadState, getNotificationSeenDates, getNotificationSeenRecipientIds,
} from '@/utils/_core/notification.utils';

import { getNotificationMessageTemplate } from '../../services/_core/notification.service.cloud';
import { sendPushNotificationsForNotification } from '../../services/_core/push.service.cloud';
import { getUserSnapshotsById } from '../../utils/_core/user-snapshot.utils.cloud';
import {
  getActingUser, parseFunction, setBooleanFields, shouldSkipTriggerCascade,
} from '../../utils/_core/utils.cloud';

/**
 * Keeps the three values the back-office list reads off one another: who has opened the send
 * (`receiverSeenIds`, the truth, written one recipient at a time), how far it has got
 * (`readState`, what the list filters on) and whether everyone has (`receiverSeen`, the flag that
 * predates per-recipient tracking and that the app and the export still read).
 *
 * `receiverSeen` is derived rather than written directly, because the two disagreed before: it was
 * a single boolean for the whole send, so the first passenger of four who opened a cancellation
 * flipped it for all of them and the row then claimed the other three had read it.
 *
 * Each opening is also dated, one recipient at a time (`receiverSeenDates`).
 */
const syncNotificationReadState = (notification: Parse.Object): void => {
  const recipients: Parse.User[] | undefined = notification.get('to');

  /*
   * a save that never loaded `to` (every bulk action selects `objectId` alone) says nothing about
   * who the send was addressed to — recomputing from an absent list would reset the row to
   * "addressed to nobody, opened by nobody" on an edit that had nothing to do with reading
   */
  if (!Array.isArray(recipients)) return;

  const recipientIds = recipients.map((recipient) => recipient.id);
  const seenIds = getNotificationSeenRecipientIds(recipientIds, notification.get('receiverSeenIds'));
  const readState = getNotificationReadState(recipientIds.length, seenIds.length);
  const isFullyRead = readState === NotificationReadStateEnum.READ;

  /*
   * written only once there is something to write, or once the column already exists: Parse Server
   * infers a new column's type from the first value it is given, and an empty array carries no
   * type to infer — the whole save is rejected. A send nobody has opened simply has no entry.
   */
  if (seenIds.length > 0 || Array.isArray(notification.get('receiverSeenIds'))) {
    notification.set('receiverSeenIds', seenIds);
  }

  const previousSeenDates = notification.get('receiverSeenDates');

  // the same first-value rule as the ids above: nothing is written until someone has opened it
  if (seenIds.length > 0 || Array.isArray(previousSeenDates)) {
    notification.set(
      'receiverSeenDates',
      getNotificationSeenDates(seenIds, previousSeenDates, dayjs().toDate())
    );
  }
  notification.set('toCount', recipientIds.length);
  notification.set('readState', readState);
  notification.set('receiverSeen', isFullyRead);

  /*
   * the moment the last recipient opened it. A send that goes back to partial (a recipient marking
   * it unread again) clears the date rather than keeping one that no longer corresponds to
   * anything — but only when there is one to clear: writing `null` into a column the class has
   * never held a value for gives Parse Server no type to infer and the whole save fails.
   */
  if (isFullyRead && !notification.get('receiverSeenAt')) {
    notification.set('receiverSeenAt', dayjs().toDate());
  }
  if (!isFullyRead && notification.get('receiverSeenAt')) {
    notification.set('receiverSeenAt', null);
  }
};

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  collections.Notification,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const notification = request.object;

    /*
     * every legitimate write (creation by a domain service, reading, resend, soft delete) runs
     * with the master key — a client saving a row directly could rewrite its message or
     * recipients and have the afterSave push that text to them, so it is refused whatever the CLP
     */
    if (!request.master) {
      throw new Error(translate('error.notificationReadOnly', DEFAULT_LANGUAGE));
    }

    /*
     * never `request.user`: almost every notification is written by Cloud Code with the master key
     * and no session, so a `request.user` guard here would skip the defaults, the message template
     * and the push fan-out for every notification a job or a trigger creates. `getActingUser` is
     * the admin/user the caller declared through the context when there is one, and simply absent
     * for a job — which is a legitimate author, not a reason to stop.
     */
    const user = getActingUser(request);
    const dirtyKeys = notification.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;

    if (shouldSkipTriggerCascade(request)) return;

    // ----------- update ----------- //
    if (notification.existed()) {
      if (dirtyKeys.includes('receiverSeenIds') || dirtyKeys.includes('to')) {
        syncNotificationReadState(notification);
      }

      // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
      setBooleanFields(notification, request);
      return;
    }

    // ----------- creation ----------- //
    if (!notification.has('from') && user) {
      notification.set('from', user);
    }
    notification.set('seen', false);
    notification.set('deleted', false);
    syncNotificationReadState(notification);

    const type = notification.get('type');
    const status = notification.get('status');
    const message = getNotificationMessageTemplate(type, status);

    if (message) {
      notification.set('message', message);
    }
  })
);

/**
 * Generic denormalization: only `from`/`to` (User pointers) are core/generic concerns.
 * Domain-specific data (ride, request, rating…) is set directly in `payload` by each
 * domain's notification service at creation time — this trigger never knows about it.
 */
Parse.Cloud.afterSave(
  collections.Notification,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const notification = request.object;
    const context = request.context;
    const dirtyKeys: string[] = Array.isArray(context.dirtyKeys) ? context.dirtyKeys : [];

    if (shouldSkipTriggerCascade(request)) return;

    const to: Parse.User[] = dirtyKeys.includes('to') ? notification.get('to') || [] : [];
    const from: Parse.User | undefined = dirtyKeys.includes('from') ? notification.get('from') : undefined;

    if (to.length === 0 && !from) return;

    // `from`/`to` arrive here as unfetched pointers, so their identity fields are loaded once
    const snapshotsById = await getUserSnapshotsById([...to, ...(from ? [from] : [])]);
    const snapshot: Record<string, any> = notification.get('snapshot') || {};

    if (to.length > 0) {
      /*
       * every recipient reads the whole row, so what it says about the others is limited to what a
       * co-passenger already sees in the app — a name and a photo, never their e-mail address
       */
      snapshot.to = to.map((recipient) => omit(snapshotsById.get(recipient.id), ['email']));

      const push = sendPushNotificationsForNotification(notification);

      /*
       * fire-and-forget — must never delay/block notification creation, see push.service.cloud.ts —
       * unless the master-key caller asked to wait: it is about to destroy the sessions the push
       * reads its device tokens from. The push never throws, so waiting cannot fail the save.
       */
      if (request.master && context.awaitPush === true) await push;
      else void push;
    }

    if (from) {
      snapshot.from = snapshotsById.get(from.id);
    }

    notification.set('snapshot', snapshot);
    await notification.save(null, USE_MASTER_KEY);
  })
);
