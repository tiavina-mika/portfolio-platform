import Parse from 'parse';

import type { IQueriesInput } from '@/types/_core/app.type';
import type { IRoleAuditLog } from '@/types/_core/roleAuditLog.type';
import type { TargetEnum } from '@shared/types';

import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchRoleAuditLogs = async ({
  limit,
  skip,
  orderBy,
  order,
  roleName,
  workspace,
}: IQueriesInput & { roleName?: string; workspace: TargetEnum }): Promise<{
  results: IRoleAuditLog[]; count: number;
}> => {
  const result: { results: Parse.Object[]; count: number } = await Parse.Cloud.run('getRoleAuditLogs', {
    limit,
    skip,
    orderBy,
    order,
    roleName,
    workspace,
  });

  return {
    count: result.count,
    results: result.results.map((log) => toJSONWithId<IRoleAuditLog>(log)),
  };
};
