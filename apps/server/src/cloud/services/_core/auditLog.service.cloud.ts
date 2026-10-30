import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText } from '@/utils/_core/utils';

import { filtersDatesQuery } from '../../utils/_core/parse.utils.cloud';

type GetAuditLogsParams = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  search?: Record<string, any>;
};

const AUDIT_LOG_FIELDS = [
  'userId', 'action', 'emailBefore', 'usernameBefore', 'fullNameBefore',
  'phoneBefore', 'deletionReason', 'deletionInitiatedBy', 'adminId',
  'accountStats', 'timestamp',
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
