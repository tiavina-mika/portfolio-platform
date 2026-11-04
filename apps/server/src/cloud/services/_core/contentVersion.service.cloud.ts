import { CONTENT_VERSION_RETENTION_LIMIT, CONTENT_VERSION_SNAPSHOT_FIELDS } from '@/constants/_core/cms.constants';
import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';

export type ContentVersionEntityType = 'Article' | 'Page';

/**
 * a save only touched bookkeeping fields (delete flag, a...) — not the fields a
 * version restore would actually bring back — so no history row is worth creating for it
 */
export const shouldSnapshotContentVersion = (
  entityType: ContentVersionEntityType,
  dirtyKeys: string[]
): boolean => dirtyKeys.some((key) => CONTENT_VERSION_SNAPSHOT_FIELDS[entityType].includes(key));

const pruneOldContentVersions = async (
  entityType: ContentVersionEntityType,
  entityId: string
): Promise<void> => {
  const oldVersions = await new Parse.Query(collections.ContentVersion)
    .equalTo('entityType', entityType)
    .equalTo('entityId', entityId)
    .select(['createdAt'])
    .descending('createdAt')
    .skip(CONTENT_VERSION_RETENTION_LIMIT)
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  if (oldVersions.length === 0) return;
  await Parse.Object.destroyAll(oldVersions, USE_MASTER_KEY);
};

/**
 * snapshots the previous state of an Article/Page before an update overwrites it, so an admin
 * can later restore it (version history / undo on content). Called from the afterSave trigger with
 * `request.original` (the state being replaced), guarded by `shouldSnapshotContentVersion`.
 */
export const createContentVersion = async (
  entityType: ContentVersionEntityType,
  entity: Parse.Object,
  user?: Parse.User
): Promise<void> => {
  const snapshot: Record<string, any> = {};

  CONTENT_VERSION_SNAPSHOT_FIELDS[entityType].forEach((field) => {
    const value = entity.get(field);

    if (value != null) snapshot[field] = value;
  });

  const ContentVersion = Parse.Object.extend(collections.ContentVersion);
  const version = new ContentVersion();

  version.set('entityType', entityType);
  version.set('entityId', entity.id);
  version.set('snapshot', snapshot);
  if (user) version.set('createdBy', user);

  await version.save(null, USE_MASTER_KEY);
  await pruneOldContentVersions(entityType, entity.id);
};

export const getContentVersions = async ({
  entityType,
  entityId,
  limit = DEFAULT_QUERY_LIMIT,
  skip = 0,
}: {
  entityType: ContentVersionEntityType;
  entityId: string;
  limit?: number;
  skip?: number;
}): Promise<Record<string, any>> => {
  const query = new Parse.Query(collections.ContentVersion)
    .equalTo('entityType', entityType)
    .equalTo('entityId', entityId)
    .select(['entityType', 'entityId', 'createdBy', 'createdAt'])
    .include('createdBy')
    .descending('createdAt')
    .limit(limit)
    .skip(skip);

  return query.withCount().find(USE_MASTER_KEY);
};

export const getContentVersionSnapshot = async ({
  entityType,
  entityId,
  versionId,
}: {
  entityType: ContentVersionEntityType;
  entityId: string;
  versionId: string;
}): Promise<Record<string, any> | undefined> => {
  const version = await new Parse.Query(collections.ContentVersion)
    .equalTo('entityType', entityType)
    .equalTo('entityId', entityId)
    .equalTo('objectId', versionId)
    .select(['snapshot'])
    .first(USE_MASTER_KEY);

  return version?.get('snapshot');
};
