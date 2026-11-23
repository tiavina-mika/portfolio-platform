import Parse from 'parse';

import type { TargetEnum } from '@shared/types';

import { Locale } from '@/types/_core/setting.type';
import { IClient, IClientInput } from '@/types/_domain/client.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

/*
 * Every client call goes through a Cloud Function: the server checks the Aldaron workspace there,
 * which a direct query could not. The workspace and the language travel with each call — the
 * language for the refusals, the workspace for the list query it belongs to.
 */
type RequestContext = { locale: Locale; workspace: TargetEnum };

export const fetchClients = async ({
  limit, skip, orderBy, order, filters, search, locale, workspace,
}: {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
} & RequestContext): Promise<{ results: IClient[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getClients', {
    limit, skip, orderBy, order, filters, search, locale, workspace,
  });

  return {
    results: result.results.map((client: Parse.Object) => toJSONWithId<IClient>(client)),
    count: result.count,
  };
};

export const createClient = async (values: IClientInput, context: RequestContext): Promise<IClient> => {
  const client = await Parse.Cloud.run('createClient', { ...values, ...context });

  return toJSONWithId<IClient>(client);
};

export const updateClient = async (
  id: string, values: IClientInput, context: RequestContext
): Promise<IClient> => {
  const client = await Parse.Cloud.run('updateClient', { id, ...values, ...context });

  return toJSONWithId<IClient>(client);
};

export const archiveClient = async (
  id: string, archived: boolean, context: RequestContext
): Promise<IClient> => {
  const client = await Parse.Cloud.run('archiveClient', { id, archived, ...context });

  return toJSONWithId<IClient>(client);
};
