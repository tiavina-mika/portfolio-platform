import Parse from 'parse';

import type { IQueriesInput } from '@/types/_core/app.type';
import type { IRoleAuditLog } from '@/types/_core/roleAuditLog.type';

import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchRoleAuditLogs = async ({
  limit,
  skip,
  orderBy,
  order,
  roleName,
}: IQueriesInput & { roleName?: string }): Promise<{ results: IRoleAuditLog[]; count: number }> => {
  const result: { results: Parse.Object[]; count: number } = await Parse.Cloud.run('getRoleAuditLogs', {
    limit,
    skip,
    orderBy,
    order,
    roleName,
  });

  return {
    count: result.count,
    results: result.results.map((log) => toJSONWithId<IRoleAuditLog>(log)),
  };
};
