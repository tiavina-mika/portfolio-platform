import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText } from '@/utils/_core/utils';

import { filtersDatesQuery } from '../../utils/_core/parse.utils.cloud';

type GetAuditLogsParams = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  search?: Record<string, any>;
  // only the accounts still in the recycle bin: the ones erased for good keep their log, not their bin row
  inBin?: boolean;
};

const AUDIT_LOG_FIELDS = [
  'userId', 'action', 'emailBefore', 'usernameBefore', 'fullNameBefore',
  'phoneBefore', 'deletionReason', 'deletionReasonDetails', 'deletionInitiatedBy', 'adminId',
  'timestamp', 'destroyedAt',
];

export const getAuditLogByUserId = async (userId: string): Promise<Parse.Object | undefined> => {
  return new Parse.Query(collections.UserAuditLog)
    .equalTo('userId', userId)
    .select(AUDIT_LOG_FIELDS)
    .first(USE_MASTER_KEY);
};

export const getAuditLogs = async ({
  limit = DEFAULT_QUERY_LIMIT,
  skip = 0,
  orderBy = 'timestamp',
  order = 'desc',
  search,
  inBin,
}: GetAuditLogsParams): Promise<{ results: Parse.Object[]; count: number }> => {
  let query = new Parse.Query(collections.UserAuditLog);

  if (search?.text) {
    const text = escapeText(search.text);

    query = Parse.Query.or(
      new Parse.Query(collections.UserAuditLog).matches('fullNameBefore', text),
      new Parse.Query(collections.UserAuditLog).matches('emailBefore', text),
      new Parse.Query(collections.UserAuditLog).matches('usernameBefore', text)
    );
  }

  if (search?.deletionInitiatedBy?.length) {
    query.containedIn('deletionInitiatedBy', search.deletionInitiatedBy);
  }

  if (search) {
    filtersDatesQuery(query, search, ['timestamp']);
  }

  if (inBin) {
    query.doesNotExist('destroyedAt');
  }

  query.select(AUDIT_LOG_FIELDS)
    .limit(limit)
    .skip(skip);

  if (order === 'desc') {
    query.descending(orderBy);
  }
  else {
    query.ascending(orderBy);
  }

  const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

  return { results: result.results, count: result.count };
};

/**
 * Records on their deletion log that these accounts were erased for good. The log itself stays — it
 * is the trace that the account existed and why it was closed — but the account is no longer in the
 * recycle bin, so it must stop being offered there.
 * @param userIds the accounts just erased
 * @param actorId the back-office user who erased them
 */
export const markAuditLogsAsDestroyed = async (userIds: string[], actorId: string): Promise<void> => {
  if (!userIds.length) return;

  const logs = await new Parse.Query(collections.UserAuditLog)
    .containedIn('userId', userIds)
    .doesNotExist('destroyedAt')
    .select(['objectId'])
    // an account restored then deleted again carries one log per deletion, hence the margin
    .limit(userIds.length + DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  const destroyedAt = new Date();

  logs.forEach((log) => {
    log.set('destroyedAt', destroyedAt);
    log.set('destroyedById', actorId);
  });

  await Parse.Object.saveAll(logs, USE_MASTER_KEY);
};
