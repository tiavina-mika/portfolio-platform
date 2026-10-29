import { collections, USE_MASTER_KEY, DEFAULT_QUERY_LIMIT } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';

import { endImpersonationSessionService } from '../../services/_core/impersonation.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

defineJob('revokeExpiredImpersonationSessionsJob', async (): Promise<void> => {
  const expiredLogs = await new Parse.Query(collections.ImpersonationSession)
    .lessThan('expiresAt', new Date())
    .equalTo('revokedAt', undefined)
    .select(['objectId'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  await Promise.all(expiredLogs.map((log) => endImpersonationSessionService(log.id)));

  logger.info(`revokeExpiredImpersonationSessionsJob revoked ${expiredLogs.length} session(s)`);
});
