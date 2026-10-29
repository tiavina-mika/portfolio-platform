import Parse from 'parse';

import { ContentVersionEntityType, IContentVersion } from '@/types/_core/contentVersion.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchContentVersions = async (
  entityType: ContentVersionEntityType,
  entityId: string,
  limit: number,
  skip: number
): Promise<{ results: IContentVersion[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getContentVersions', {
    entityType, entityId, limit, skip,
  });

  return {
    results: result.results.map((version: Parse.Object) => toJSONWithId<IContentVersion>(version)),
    count: result.count,
  };
};

export const fetchContentVersionSnapshot = async (
  entityType: ContentVersionEntityType,
  entityId: string,
  versionId: string
): Promise<Record<string, any>> => {
  return Parse.Cloud.run('getContentVersionSnapshot', { entityType, entityId, versionId });
};
