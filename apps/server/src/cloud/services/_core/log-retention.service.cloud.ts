import { DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { LOG_RETENTION_RULES, type LogRetentionRule } from '@/constants/_core/retention.constants';
import { logger } from '@/utils/_core/logger';
import { getRetentionCutoff } from '@/utils/_core/retention.utils';

/** Pages destroyed per collection and per run: a large backlog is finished by the following weeks */
const MAX_PURGE_PAGES = 100;

const purgeCollection = async ({ collection, dateField, months }: LogRetentionRule): Promise<number> => {
  const cutoffDate = getRetentionCutoff(months);
  let destroyed = 0;

  for (let page = 0; page < MAX_PURGE_PAGES; page += 1) {
    // no skip: a destroyed page leaves the query, so the next one starts at the front
    const batch = await new Parse.Query(collection)
      .lessThan(dateField, cutoffDate)
      .select(['objectId'])
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    await Parse.Object.destroyAll(batch, USE_MASTER_KEY);
    destroyed += batch.length;

    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  return destroyed;
};

/**
 * Permanently destroys the rows of every log-like collection past its retention period
 * (LOG_RETENTION_RULES). A collection that fails is logged and does not stop the others.
 */
export const purgeOldLogs = async (): Promise<void> => {
  for (const rule of LOG_RETENTION_RULES) {
    try {
      const destroyed = await purgeCollection(rule);

      logger.info(
        `purgeOldLogsJob: destroyed ${destroyed} ${rule.collection} rows ` +
        `more than ${rule.months} months past their ${rule.dateField}`
      );
    }
    catch (error) {
      logger.error(`purgeOldLogsJob: ${rule.collection} failed`, { error: (error as Error).stack });
    }
  }
};
