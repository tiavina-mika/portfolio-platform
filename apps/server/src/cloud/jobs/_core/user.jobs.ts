import dayjs from 'dayjs';

import { collections, DISABLE_TRIGGERS_CONTEXT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';
import { maskEmail, maskPhone, maskUsername } from '@/utils/_core/pii.utils';

import {
  deleteOrDestroyUserRelations, liftExpiredBans, purgeUnverifiedPhoneSignups,
} from '../../services/_core/user.service.cloud';
import { purgeOrphanUserSessionsService } from '../../services/_core/userSession.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

type DeleteOrDestroyUserRelationsParams = {
  userId?: string;
  type?: 'delete' | 'destroy';
};
defineJob('deleteOrDestroyUserRelationsJob', async (request: Parse.Cloud.JobRequest<DeleteOrDestroyUserRelationsParams>): Promise<void> => {
  const { userId, type } = request.params;

  if (!userId) return;

  const user = await new Parse.Query(Parse.User)
    .select(['objectId'])
    .get(userId, USE_MASTER_KEY);

  if (!user) return;
  await deleteOrDestroyUserRelations(user, type, request);
});

defineJob('liftExpiredBansJob', async (): Promise<void> => {
  logger.info('Starting liftExpiredBansJob', { function: 'liftExpiredBansJob' });
  await liftExpiredBans();
});

type CreateUserAuditLogParams = {
  userId?: string;
};
defineJob('createUserAuditLogJob', async (request: Parse.Cloud.JobRequest<CreateUserAuditLogParams>): Promise<void> => {
  const { userId } = request.params;

  if (!userId) return;

  const user = await new Parse.Query(Parse.User)
    .select([
      'emailBefore', 'usernameBefore', 'firstNameBefore', 'lastNameBefore', 'phoneBefore',
      'deletionReason', 'rideStats', 'requestStats', 'stats',
    ])
    .get(userId, USE_MASTER_KEY);

  if (!user) return;

  const AuditLog = Parse.Object.extend(collections.UserAuditLog);
  const auditLog = new AuditLog();

  auditLog.set('userId', userId);
  auditLog.set('action', 'account_deleted');
  auditLog.set('emailBefore', maskEmail(user.get('emailBefore')));
  auditLog.set('usernameBefore', maskUsername(user.get('usernameBefore')));
  auditLog.set('fullNameBefore', `${user.get('firstNameBefore') ?? ''} ${user.get('lastNameBefore') ?? ''}`.trim());
  auditLog.set('phoneBefore', maskPhone(user.get('phoneBefore')));
  auditLog.set('deletionReason', user.get('deletionReason') ?? 'user_requested');
  auditLog.set('deletionInitiatedBy', 'user');
  auditLog.set('accountStats', {
    totalRidesAsDriver: user.get('rideStats')?.completed ?? 0,
    totalRidesAsPassenger: user.get('requestStats')?.completed ?? 0,
    averageRating: user.get('stats')?.rating ?? null,
    reviewsCount: user.get('stats')?.reviewsCount ?? 0,
  });
  auditLog.set('timestamp', dayjs().toDate());

  await auditLog.save(null, USE_MASTER_KEY);

  // remove *Before fields from _User — source of truth is now UserAuditLog only (GDPR data minimization)
  user.unset('emailBefore');
  user.unset('usernameBefore');
  user.unset('firstNameBefore');
  user.unset('lastNameBefore');
  user.unset('phoneBefore');
  await user.save(null, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });

  logger.info(`UserAuditLog created for deleted user ${userId}`);
});

/**
 * Destroys the device rows left with neither a push token nor a session token — see
 * purgeOrphanUserSessionsService for why they pile up.
 */
defineJob('purgeOrphanUserSessionsJob', async (): Promise<void> => {
  const purged = await purgeOrphanUserSessionsService();

  logger.info(`purgeOrphanUserSessionsJob: destroyed ${purged} orphan device rows`);
});

defineJob('purgeUnverifiedPhoneSignupsJob', async (): Promise<void> => {
  logger.info('Starting purgeUnverifiedPhoneSignupsJob', { function: 'purgeUnverifiedPhoneSignupsJob' });
  await purgeUnverifiedPhoneSignups();
});
