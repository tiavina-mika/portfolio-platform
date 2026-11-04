import Parse from 'parse';

import type { IQueriesInput } from '@/types/_core/app.type';
import type { IUserAuditLog } from '@/types/_core/auditLog.type';

import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchAuditLogs = async ({
  limit,
  skip,
  orderBy,
  order,
  search,
}: IQueriesInput): Promise<{ results: IUserAuditLog[]; count: number }> => {
  const result: { results: Parse.Object[]; count: number } = await Parse.Cloud.run('getAuditLogs', {
    limit,
    skip,
    orderBy,
    order,
    search,
  });

  return {
    count: result.count,
    results: result.results.map((log) => toJSONWithId<IUserAuditLog>(log)),
  };
};

export const fetchAuditLogByUserId = async (userId: string): Promise<IUserAuditLog | undefined> => {
  const log = await Parse.Cloud.run('getAuditLogByUserId', { userId });

  return log?.toJSON ? toJSONWithId<IUserAuditLog>(log) : log;
};
