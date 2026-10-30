import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

/**
 * Business domains declare which of their own collections hold data belonging to a user, and
 * which fields are safe to include in a GDPR export (art. 15/20) — keeps this generic aggregator
 * free of ride/request/vehicle-specific knowledge, mirroring the account-deletion registry pattern.
 */
export type UserDataExportTarget = {
  key: string;
  className: string;
  field: string;
  select: string[];
};

const coreUserDataExportTargets: UserDataExportTarget[] = [
  {
    key: 'contactMessages',
    className: collections.Contact,
    field: 'user',
    select: ['title', 'message', 'platform', 'createdAt'],
  },
];

const domainUserDataExportTargets: UserDataExportTarget[] = [];

export const registerUserDataExportTarget = (target: UserDataExportTarget): void => {
  domainUserDataExportTargets.push(target);
};

const toRecord = (object: Parse.Object): Record<string, any> => ({ id: object.id, ...object.toJSON() });

const exportUserRelation = async (
  user: Parse.User,
  { className, field, select }: UserDataExportTarget
): Promise<Record<string, any>[]> => {
  const records: Record<string, any>[] = [];

  await new Parse.Query(className)
    .equalTo(field, user)
    .select(select)
    .each((object: Parse.Object) => {
      records.push(toRecord(object));
    }, USE_MASTER_KEY);

  return records;
};

/**
 * Whitelisted `_User` fields for self-export — excludes internal moderation/system bookkeeping
 * not meaningful to the data subject (e.g. `deletionReason`, `*Before` anonymization snapshots).
 */
const USER_SELF_EXPORT_FIELDS = [
  'email', 'username', 'firstName', 'lastName', 'phone', 'birthday', 'sex', 'address', 'aboutMe',
  'locale', 'image', 'requestStats', 'rideStats', 'stats', 'pendingPenalty', 'isSuspendedUntil',
  'banned', 'bans', 'consentVersion', 'acceptedTermsAt', 'emailVerified', 'phoneVerified',
  'paymentPhones', 'emergencyContact', 'notificationPreferences', 'profileVisibility', 'hasSeenOnboarding',
  'platforms', 'createdAt', 'updatedAt',
];

const exportUserProfile = (user: Parse.User): Record<string, any> => {
  const json = user.toJSON();
  const profile: Record<string, any> = { id: user.id };

  for (const field of USER_SELF_EXPORT_FIELDS) {
    if (field in json) profile[field] = json[field];
  }

  return profile;
};

const exportUserRatings = async (user: Parse.User): Promise<Record<string, any>[]> => {
  const records: Record<string, any>[] = [];

  await Parse.Query.or(
    new Parse.Query(collections.Rating).equalTo('from', user),
    new Parse.Query(collections.Rating).equalTo('to', user)
  )
    .select(['value', 'comment', 'from', 'to', 'createdAt'])
    .each((object: Parse.Object) => {
      records.push(toRecord(object));
    }, USE_MASTER_KEY);

  return records;
};

const exportUserPayments = async (user: Parse.User): Promise<Record<string, any>[]> => {
  const records: Record<string, any>[] = [];

  await Parse.Query.or(
    new Parse.Query(collections.Payment).equalTo('payer', user),
    new Parse.Query(collections.Payment).equalTo('receiver', user)
  )
    .select(['type', 'status', 'amount', 'currency', 'source', 'destination', 'createdAt'])
    .each((object: Parse.Object) => {
      records.push(toRecord(object));
    }, USE_MASTER_KEY);

  return records;
};

const exportUserNotifications = async (user: Parse.User): Promise<Record<string, any>[]> => {
  const records: Record<string, any>[] = [];

  await new Parse.Query(collections.Notification)
    .equalTo('to', user)
    .equalTo('deleted', false)
    .select(['type', 'status', 'snapshot', 'createdAt'])
    .each((object: Parse.Object) => {
      records.push(toRecord(object));
    }, USE_MASTER_KEY);

  return records;
};

/**
 * Aggregates every piece of personal data Portfolio holds about a user into a single JSON-portable
 * payload, for the GDPR right of access/portability (art. 15/20). Read-only — never mutates data.
 */
export const getUserDataExport = async (user: Parse.User): Promise<Record<string, any>> => {
  const targets = [...coreUserDataExportTargets, ...domainUserDataExportTargets];

  const [ratings, payments, notifications, ...relations] = await Promise.all([
    exportUserRatings(user),
    exportUserPayments(user),
    exportUserNotifications(user),
    ...targets.map((target) => exportUserRelation(user, target)),
  ]);

  const relationsByKey: Record<string, Record<string, any>[]> = {};

  targets.forEach((target, index) => {
    relationsByKey[target.key] = relations[index] ?? [];
  });

  return {
    exportedAt: new Date().toISOString(),
    profile: exportUserProfile(user),
    ratingsGivenAndReceived: ratings,
    payments,
    notificationsReceived: notifications,
    ...relationsByKey,
  };
};
