import Parse from 'parse';

import { locales } from '@/config/i18n';
import { IListTabCounts } from '@/types/_core/app.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchEntityList = async <TEntity extends { id: string }>(
  listCloudFunction: string,
  {
    limit, skip, orderBy, order, filters, search, include,
  }: {
    limit: number;
    skip: number;
    orderBy: string;
    order: string;
    filters?: Record<string, any>;
    search?: Record<string, any>;
    // the pointers to read along with each row, for a list endpoint that accepts them
    include?: string[];
  }
): Promise<{ results: TEntity[]; count: number; tabCounts?: IListTabCounts }> => {
  const result: Record<string, any> = await Parse.Cloud.run(listCloudFunction, {
    limit, skip, orderBy, order, filters, search, include, locales,
  });

  return {
    results: result.results.map((entity: Parse.Object) => toJSONWithId<TEntity>(entity)),
    count: result.count,
    /*
     * how many rows each tab holds — already keyed by the tab's database field, which is what the
     * strip looks a count up by (`all` standing for the unscoped tab it opens on). Absent for the
     * list endpoints that do not report it, and the strip then carries labels only.
     */
    tabCounts: result.tabCounts,
  };
};

/**
 * fetches the rows an export covers. Pagination is the caller's to state: left out, the whole
 * result set the current filters leave is fetched in one go (capped at `maxRows`); passed through
 * `queries`, only that page is fetched — which is how an export scoped to what is on screen, or to
 * what the reader ticked on it, stays a single request instead of a full-table read.
 */
export const fetchEntityListForExport = async <TEntity extends { id: string }>(
  listCloudFunction: string,
  queries: Record<string, any>,
  maxRows: number
): Promise<{ results: TEntity[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run(listCloudFunction, {
    ...queries,
    limit: queries.limit ?? maxRows,
    skip: queries.skip ?? 0,
    locales,
  });

  return {
    results: result.results.map((entity: Parse.Object) => toJSONWithId<TEntity>(entity)),
    count: result.count,
  };
};

export const softDeleteEntity = async (collection: string, entity: Record<string, any>): Promise<string> => {
  const parseEntity = Parse.Object.fromJSON({ ...entity, className: collection });

  parseEntity.set('deleted', true);
  const deletedEntity = await parseEntity.save();

  return deletedEntity.id!;
};

export const toggleEntitiesFieldByIds = async (
  collection: string,
  ids: string[],
  field: string,
  value: boolean
): Promise<void> => {
  await new Parse.Query(collection)
    .containedIn('objectId', ids)
    .select([field])
    .each(async (entity) => {
      entity.set(field, value);

      await entity.save();
    });
};
