import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { collections } from '@/constants/_core/constants';
import { dedupeUserSessionDevicesService } from '@/cloud/services/_core/userSession-dedupe.service.cloud';
import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { logger } from '@/utils/_core/logger';

type IndexOptions = {
  unique?: boolean;
  sparse?: boolean;
  /** Restricts which documents the index covers — the only way to make `unique` conditional. */
  partialFilterExpression?: Record<string, unknown>;
  name?: string;
};

type IndexDefinition = {
  spec: Record<string, 1 | -1 | '2dsphere'>;
  options?: IndexOptions;
  /**
   * One-off data fix the index cannot be built without (duplicates under a new `unique` index).
   * Run only while the index — looked up by `options.name`, so it needs one — does not exist yet.
   */
  beforeCreate?: () => Promise<unknown>;
};

/**
 * MongoDB indexes required for performance-sensitive queries, keyed by collection.
 * Add new entries here rather than creating indexes manually on Compass/Atlas, so every
 * environment (local, preprod, prod, CI) ends up with the same indexes without a manual step.
 *
 * @important these run against the raw Mongo collection (bypassing the Parse Query layer), so
 * Pointer fields must use Parse's storage-level column name (`_p_<fieldName>`), not the Parse
 * field name — e.g. the `user` Pointer field on Article is stored as `_p_user` in Mongo. The same
 * goes for the built-in dates: `createdAt` / `updatedAt` are stored as `_created_at` / `_updated_at`,
 * and an index on `createdAt` is built on a column no document has.
 */
/**
 * Indexes that used to be declared here and must now be dropped from any database that already ran
 * a build carrying them, keyed by collection. Removing the declaration is not enough — the index
 * outlives it.
 *
 * The `createdAt` entries indexed a column Parse never writes (see above): every document has the
 * same missing value there, so the index never narrowed a query and only cost write time and disk.
 * Each one is redeclared below on `_created_at`.
 */
const LEGACY_INDEXES_BY_COLLECTION: Record<string, string[]> = {
  /*
   * Both spellings of the index that tried to serve the app's unread badge by pairing the
   * recipient list with the ids of the recipients who opened the send. `to` and the id array are
   * both arrays, and MongoDB cannot index two parallel arrays — the index is accepted when it is
   * created and then rejects every subsequent write to the collection, so a database that ever ran
   * a build carrying it can no longer store a notification at all until it is dropped.
   */
  [collections.Notification]: [
    'to_1_deleted_1_receiverSeenBy_1',
    'to_1_deleted_1_receiverSeenIds_1',
    'to_1_deleted_1_createdAt_-1',
    'deleted_1_readState_1_createdAt_-1',
    'deleted_1_toCount_1_createdAt_-1',
  ],
  /*
   * the plain (user, deviceId) index, replaced by the unique one below — MongoDB refuses a second
   * index on the same keys that differs only by its options, so the old one has to go first
   */
  [collections.UserSession]: ['_p_user_1_deviceId_1'],
};

/**
 * The index every back-office badge count runs on: `getObjectsCount` filters each queue class on
 * `{ deleted: false, seen: false }`, and that count is re-issued on every LiveQuery event and on
 * every polling tick, once per collection. Without it each badge refresh is a full collection
 * scan. Field order follows the query — Mongo only uses a compound index from its leading field
 * onwards, and `deleted` is the field all of them pin first.
 */
const BADGE_COUNT_INDEX: IndexDefinition = { spec: { deleted: 1, seen: 1 } };

const INDEXES_BY_COLLECTION: Record<string, IndexDefinition[]> = {
  '_Join:users:_Role': [
    // rolesOf(user): `equalTo('users', user)` filters on relatedId; role.getUsers().query() on owningId
    { spec: { relatedId: 1 } },
    { spec: { owningId: 1 } },
  ],
  [collections.Notification]: [
    // getNotifications (notification.functions.ts) — recipient list, newest first
    { spec: { to: 1, deleted: 1, _created_at: -1 } },
    /*
     * The app's unread badge — the notifications addressed to one person that person has not
     * opened — deliberately has NO index of its own: `to` and `receiverSeenIds` are both arrays,
     * and MongoDB refuses to index two parallel arrays in one compound index (it would have to
     * store a key per pair). Adding one does not fail at creation, it fails every later write to
     * the collection with "cannot index parallel arrays". The badge runs on the `to`-leading index
     * above and filters the id array in memory, which is bounded by one person's own notifications.
     *
     * The two indexes below serve the back-office list's read-rate and send-type filters, both
     * read newest-first within the current tab. `readState` is stored rather than compared between two fields at
     * query time (see getNotificationReadState), and `toCount` is what makes "one recipient" and
     * "several" answerable at all — an array's length is not something a query can measure.
     */
    { spec: { deleted: 1, readState: 1, _created_at: -1 } },
    { spec: { deleted: 1, toCount: 1, _created_at: -1 } },
    // the category counts the filter panel states (notification-list.service.cloud.ts)
    { spec: { deleted: 1, type: 1 } },
    // purgeOldNotificationsJob (notification.service.cloud.ts)
    { spec: { deleted: 1, deletedAt: 1 } },
    /*
     * the sends of one booking, newest first — what the back-office payment page lists
     * (payment-notification.service.cloud.ts). A notification points at no booking: the booking
     * travels in its payload, whose shape is fixed per type.
     */
    { spec: { 'payload.request.id': 1, _created_at: -1 } },
    /*
     * Idempotency guarantee at the database level, same reasoning as Payment's `paymentIntentId`
     * below: `idempotencyKey` names the one notification an event may produce, and every scheduled
     * job that can replay an announcement sets it (see buildNotificationIdempotencyKey). `unique`
     * is what makes the second run a no-op rather than a second reminder in everyone's inbox — the
     * guard fields the jobs write are a separate save, so a crash between the two used to re-notify
     * the whole audience on the next tick.
     *
     * `sparse` because every notification raised by a user action leaves it unset, and a unique
     * index rejects duplicate *missing* values too unless it is sparse.
     */
    { spec: { idempotencyKey: 1 }, options: { unique: true, sparse: true } },
  ],
  [collections.NotificationResend]: [
    /*
     * getNotificationResends (notification-resend.service.cloud.ts) — one send's history, newest
     * first — and the purge that destroys it with its send. Both are storage column names: the
     * pointer is `_p_notification` and the creation date `_created_at`.
     */
    { spec: { _p_notification: 1, _created_at: -1 } },
  ],
  [collections.Invitation]: [
    // the public sign-up link looks an invitation up by its token; sparse for rows written without one
    { spec: { token: 1 }, options: { unique: true, sparse: true } },
    // re-inviting an address and the owner bootstrap look it up by e-mail
    { spec: { email: 1 } },
  ],
  [collections.Newsletter]: [
    // findByEmail-style lookups (app.functions.ts)
    { spec: { email: 1 } },
    // confirmNewsletterSubscription: the double opt-in link is looked up by its token's hash
    { spec: { confirmationTokenHash: 1 }, options: { sparse: true } },
  ],
  [collections.Payment]: [
    /*
     * Idempotency guarantee at the database level (not just applicative check-then-act):
     * `paymentIntentId` is the gateway-issued transaction reference, set once a payment
     * reaches SUCCESS (see processAndCreatePayment/retryPaymentAPI). `unique` rejects a second
     * Payment row from ever recording the same gateway transaction twice — a replayed webhook once
     * real providers are wired up. It does not stop a payment being *sent* twice: a real operator
     * issues a new reference per call, so that is `idempotencyKey`'s job, below. `sparse` because PENDING/FAILED payments (or ones that never reached the gateway)
     * have no `paymentIntentId` yet, and MongoDB unique indexes reject duplicate *missing*
     * values too unless the index is sparse.
     */
    { spec: { paymentIntentId: 1 }, options: { unique: true, sparse: true } },
    /*
     * One money movement, one payment: `collect:<requestId>` names the collection of a booking and
     * `payout:<rideId>` the payout of a ride, which never legitimately happen twice. A second
     * payment asking for the same key is answered with the first instead of being sent to the
     * operator again. `sparse` because refunds, which can repeat, carry no key.
     */
    { spec: { idempotencyKey: 1 }, options: { unique: true, sparse: true } },
    // the references of the earlier attempts of a retried payment, so a late answer still matches
    { spec: { previousReferences: 1 }, options: { sparse: true } },
    // payments failed on their deadline still read at the operator (payment-settlement.service.cloud.ts)
    { spec: { status: 1, failureCode: 1, failedAt: 1 } },
    BADGE_COUNT_INDEX,
    // the failed-payment badge counts a status subset of the same collection
    { spec: { deleted: 1, status: 1 } },
    // payments owed by the platform due for an automatic retry (payment-retry.service.cloud.ts)
    { spec: { status: 1, nextAutoRetryAt: 1 } },
    // payments waiting for their operator, due for a check (payment-settlement.service.cloud.ts)
    { spec: { status: 1, nextCheckAt: 1 } },
    /*
     * the operator's own transaction reference, known from its first answer — before the payment
     * succeeds, unlike `paymentIntentId`. What an operator's status answer or webhook is matched
     * on; `sparse` for the payments that never reached the operator.
     */
    { spec: { providerReference: 1 }, options: { unique: true, sparse: true } },
    // final payments whose follow-up never finished, taken over by the reconciliation job
    { spec: { status: 1, settledAt: 1 } },
    /*
     * a member's payment history: one branch per side of the `$or` (payer / receiver), newest
     * first; the type / status / period filters narrow inside that range
     */
    { spec: { _p_payer: 1, deleted: 1, _created_at: -1 } },
    { spec: { _p_receiver: 1, deleted: 1, _created_at: -1 } },
    // payments statistics and the overview revenue, both scoped to a type and a period
    // (payment-statistics.service.cloud.ts)
    { spec: { type: 1, status: 1, _created_at: 1 } },
    // average collection delay, bucketed on when a passenger payment succeeded
    // (payment-statistics.service.cloud.ts)
    { spec: { type: 1, status: 1, successAt: 1 } },
    // pending driver payouts: looks up a completed ride's successful payout by its ride pointer
    // (payment-statistics.service.cloud.ts)
    { spec: { _p_ride: 1, type: 1, status: 1 } },
    // the refunds of one collection, for the back-office payment page (ride-payment-cycle.service.cloud.ts)
    { spec: { _p_refundOf: 1 } },
    /*
     * The money of one booking: its collection, and the refunds that came out of it
     * (getBookingCollection, getPaymentsByRequestId, closeStalePendingRequests). Every refund of a
     * booking now starts by finding that collection, so this is on the path of every cancellation,
     * refusal and timeout — and it is what let `closeStalePendingRequests` stop looking a page of
     * rides at a time.
     */
    { spec: { _p_request: 1, type: 1, status: 1 } },
  ],
  [collections.User]: [
    BADGE_COUNT_INDEX,
    // signups per bucket and the retention cohorts (user-statistics.service.cloud.ts)
    { spec: { _created_at: 1 } },
    // the morning jobs that warn members run once per country and only read that country's accounts
    { spec: { country: 1 } },
    /*
     * Every phone login, verification code and password reset by number resolves an account
     * through `phone.number` (+ `phoneVerified` for the ones that hand out control of the
     * account). Without this each of them scanned the whole `_User` collection.
     */
    { spec: { 'phone.number': 1, phoneVerified: 1 } },
    /*
     * "one verified number = one account" was only ever enforced by application-level queries in
     * `beforeSave` and in the contact-change flow, none of them atomic — two OTPs confirmed at the
     * same moment both passed. Partial, so the accounts that never verified their number (an
     * email account types one at sign-up step 2 and leaves it unconfirmed) are simply outside it.
     */
    {
      spec: { 'phone.number': 1 },
      options: {
        name: 'verifiedPhoneNumber_unique',
        unique: true,
        /*
         * `$exists` matters as much as the flag: a soft-deleted account has its `phone` unset,
         * and without it every one of them would collide on the same missing-field key.
         */
        partialFilterExpression: { phoneVerified: true, 'phone.number': { $exists: true } },
      },
    },
    /*
     * The audience of a back-office announcement (notification-broadcast.service.cloud.ts), which is
     * counted before the operator confirms and then walked page by page while it is written — twice
     * over the whole membership per send.
     *
     * Every key the audience reads is in it, so both passes are answered from the index instead of
     * from the documents. The city is looked for inside the member's own free-text address, which no
     * index can seek on, but the scan is still over index keys rather than over fetched accounts.
     */
    { spec: { deleted: 1, banned: 1, address: 1 } },
    /*
     * The drivers who still owe the platform money, largest debt first — the Finance wallet list
     * (getDriversWithPendingDebt, driver-wallet.service.cloud.ts). Sparse: a debt is the exception,
     * and an index over every account that never had one would be mostly empty keys.
     */
    { spec: { pendingPenalty: -1 }, options: { sparse: true } },
    /*
     * The daily sweep that notifies the accounts whose suspension has run out
     * (checkAndNotifySuspensionLifted, driver.service.cloud.ts), and the back-office list of the
     * ones still suspended. Sparse for the same reason.
     */
    { spec: { isSuspendedUntil: 1 }, options: { sparse: true } },
  ],
  // Report has no `seen` field — its queue is the `pending` status (see getObjectsCount)
  [collections.Report]: [
    { spec: { deleted: 1, status: 1 } },
    // the back-office user page: the reports filed about one account, and the ones it filed
    { spec: { targetType: 1, targetId: 1, _created_at: -1 } },
    { spec: { _p_reportedBy: 1, _created_at: -1 } },
    /*
     * the reviews of one page the caller has already reported (getReviews, isReportedByMe): their
     * reports, narrowed to one reporter and a set of target ids in a single grouped read
     */
    { spec: { _p_reportedBy: 1, targetType: 1, targetId: 1 } },
    // the reports statistics: filings per bucket, and the oldest open reports (report-statistics.service.cloud.ts)
    { spec: { status: 1, _created_at: 1 } },
    { spec: { _created_at: 1 } },
    // the reports statistics: handling time of the reports decided in a period
    { spec: { resolvedAt: 1 }, options: { sparse: true } },
    // the back-office list and the reports statistics, read one country at a time
    { spec: { country: 1, status: 1, _created_at: -1 } },
  ],
  [collections.Contact]: [
    // the ticket inbox counts admin-unread tickets rather than the generic `seen`
    { spec: { deleted: 1, unreadByAdmin: 1 } },
    /*
     * the short number the app shows its author and support is quoted over the phone: unique so a
     * lost race on the sequence surfaces as a rejected save instead of two tickets sharing a
     * reference, sparse so the rows written before the sequence existed do not all collide on the
     * missing value
     */
    { spec: { reference: 1 }, options: { unique: true, sparse: true } },
    // the ticket inbox narrows its queue by subject, then by status
    { spec: { deleted: 1, subject: 1, status: 1 } },
    // the ticket inbox, read one country at a time
    { spec: { country: 1, deleted: 1, status: 1 } },
    /*
     * the app's "my requests" list: one author's tickets, latest activity first — its status,
     * last-writer and subject filters narrow what is already a single person's handful of rows
     */
    { spec: { _p_user: 1, deleted: 1, lastMessageAt: -1 } },
    /*
     * the tickets of one phone number, newest first: the cap on the texts sent to a number counts
     * its recent tickets, and the inbox's "previous tickets" of a requester with no email reads
     * them. Sparse: only the tickets that carry a number are worth an entry.
     */
    { spec: { phone: 1, _created_at: -1 }, options: { sparse: true } },
  ],
  // getTicketMessagesService — one ticket's thread, oldest first (the leading field is the pointer)
  [collections.TicketMessage]: [
    { spec: { _p_ticket: 1, deleted: 1, _created_at: 1 } },
  ],
  [collections.Category]: [
    /*
     * the technical code the apps read a category by (`equalTo('code', …).first()`): unique across
     * every category, whatever its entity, so that lookup can never land on one of two rows. Partial
     * rather than sparse: most categories carry no code, and the back-office clears one by saving an
     * empty string — `$gt: ''` only matches non-empty strings, so neither the missing values nor the
     * empty ones collide. The `beforeSave` trigger refuses a taken code first, with a readable
     * message; this index is what still holds under a concurrent save or a raw write.
     */
    { spec: { code: 1 }, options: { unique: true, partialFilterExpression: { code: { $gt: '' } } } },
  ],
  [collections.Article]: [
    /*
     * the public article read (`getArticleForClient`) and the unique-slug check at save time both look
     * an article up by `translated.<locale>.slug`, and the former ORs the current locale with the
     * default one — each branch of an `$or` needs its own index, so one per locale
     */
    { spec: { 'translated.fr.slug': 1 } },
    { spec: { 'translated.en.slug': 1 } },
    { spec: { 'translated.mg.slug': 1 } },
  ],
  [DOMAIN_COLLECTIONS.project]: [
    /*
     * the public project read (`getProjectForClient`) looks a project up by `translated.<locale>.slug`,
     * ORing the current locale with the default one — each branch of an `$or` needs its own index
     */
    { spec: { 'translated.fr.slug': 1 } },
    { spec: { 'translated.en.slug': 1 } },
    { spec: { 'translated.mg.slug': 1 } },
  ],
  [collections.Page]: [
    /*
     * the technical code the mobile app reads a page by (`CGU`, `PRIVACY_POLICY`) — same reasoning
     * and same partial filter as the Category code index above
     */
    { spec: { code: 1 }, options: { unique: true, partialFilterExpression: { code: { $gt: '' } } } },
  ],
  [collections.ContentVersion]: [
    // getContentVersions / pruneOldContentVersions — one entity's history, newest first
    { spec: { entityType: 1, entityId: 1, _created_at: -1 } },
  ],
  // one row per named sequence — the uniqueness is what makes a concurrent first draw safe
  [collections.Counter]: [{ spec: { name: 1 }, options: { unique: true } }],
  [collections.UserSession]: [
    /*
     * a member's devices (profile screen, BO "active sessions", device registration by deviceId).
     * Unique: registerSession and registerPushToken run in parallel at login, and each used to
     * create its own row for the same device — the losing one kept a push token that no logout
     * cleared. The duplicates an older database already holds are collapsed first.
     */
    {
      spec: { _p_user: 1, deviceId: 1 },
      options: {
        name: 'userDevice_unique',
        unique: true,
        partialFilterExpression: { _p_user: { $exists: true }, deviceId: { $exists: true } },
      },
      beforeCreate: dedupeUserSessionDevicesService,
    },
    // the device row behind a Parse session, when that session is revoked
    { spec: { sessionToken: 1 } },
    // the push fan-out's lookup and the token hand-over between accounts on one phone
    { spec: { pushToken: 1 }, options: { sparse: true } },
  ],
  [collections.PushReceipt]: [
    // processPushReceiptsJob: the tickets old enough for Expo to have their receipt, oldest first
    { spec: { _created_at: 1 } },
  ],
  /*
   * getUserAuditTrail (userAuditTrail.service.cloud.ts) — one member's rows of each log, newest
   * first. The logs name the member by a plain id string, except the two that hold a pointer.
   */
  [collections.UserModerationLog]: [{ spec: { _p_targetUser: 1, _created_at: -1 } }],
  [collections.SessionAuditLog]: [{ spec: { targetUserId: 1, _created_at: -1 } }],
  // the role preview reads the trail of one role, newest first
  [collections.RoleAuditLog]: [
    { spec: { targetUserId: 1, _created_at: -1 } },
    { spec: { roleName: 1, timestamp: -1 } },
  ],
  [collections.MfaAuditLog]: [{ spec: { userId: 1, _created_at: -1 } }],
  [collections.ImpersonationSession]: [
    { spec: { _p_targetUser: 1, _created_at: -1 } },
    // isImpersonatedSessionService — looked up on every payment and user save
    { spec: { sessionToken: 1 } },
  ],
  [collections.UserAuditLog]: [{ spec: { userId: 1, _created_at: -1 } }],
};

// `indexExists` throws when the collection itself does not exist yet (fresh database)
const indexExistsSafely = async (collection: any, indexName: string): Promise<boolean> => {
  try {
    return await collection.indexExists(indexName);
  }
  catch {
    return false;
  }
};

/**
 * Ensures the indexes declared in `INDEXES_BY_COLLECTION` exist.
 * `createIndex` is idempotent — safe to call on every server start.
 */
export const ensureDatabaseIndexes = async (): Promise<void> => {
  for (const [className, indexes] of Object.entries(INDEXES_BY_COLLECTION)) {
    const collection = await getMongoCollection(className);

    for (const legacyIndexName of LEGACY_INDEXES_BY_COLLECTION[className] ?? []) {
      try {
        // indexExists throws when the collection itself doesn't exist yet (fresh database)
        if (await collection.indexExists(legacyIndexName)) {
          await collection.dropIndex(legacyIndexName);
          logger.info(`Legacy database index dropped: ${className}.${legacyIndexName}`);
        }
      } catch {
        // nothing to drop on a collection that was never created
      }
    }

    for (const { spec, options, beforeCreate } of indexes) {
      /*
       * One index that cannot be built must not take the whole server down with it: a `unique`
       * index is rejected outright when the data already holds a duplicate, and this runs during
       * startup. The error is logged loudly instead — the constraint is missing until the
       * duplicates are resolved, which is a data problem to fix, not a reason to refuse to boot.
       */
      try {
        if (beforeCreate && options?.name && !(await indexExistsSafely(collection, options.name))) {
          await beforeCreate();
        }

        const indexName = await collection.createIndex(spec, options);

        logger.info(`Database index ensured: ${className}.${indexName}`);
      }
      catch (error) {
        logger.error(`Database index could NOT be created: ${className}.${JSON.stringify(spec)}`, {
          error: (error as Error).message,
        });
      }
    }
  }
};
