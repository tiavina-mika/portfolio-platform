import { collections } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';

import { getMongoCollection } from '../../utils/_core/db.utils.cloud';

type DuplicateDeviceRow = { id: string; sessionToken?: string; pushToken?: string };
type DuplicateDeviceGroup = { rows: DuplicateDeviceRow[] };

/**
 * Collapses the UserSession rows that share one (user, deviceId) pair down to a single row, so the
 * unique index on that pair can be built on a database written before it existed. Kept on its own
 * (raw Mongo, no Parse object graph) because it runs from the index bootstrap at server startup.
 *
 * The row kept is the most recently updated one still bound to a session — the one the logout
 * cleanup can find — or else the most recent one; it inherits a push token from a removed row when
 * it has none, so the device keeps receiving pushes.
 * @returns the number of rows removed
 */
export const dedupeUserSessionDevicesService = async (): Promise<number> => {
  const collection = await getMongoCollection(collections.UserSession);
  const groups: DuplicateDeviceGroup[] = await collection.aggregate([
    { $match: { _p_user: { $exists: true }, deviceId: { $exists: true } } },
    { $sort: { _updated_at: -1 } },
    {
      $group: {
        _id: { user: '$_p_user', deviceId: '$deviceId' },
        rows: { $push: { id: '$_id', sessionToken: '$sessionToken', pushToken: '$pushToken' } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ], { allowDiskUse: true }).toArray();

  let removed = 0;

  for (const { rows } of groups) {
    const keeper = rows.find((row) => row.sessionToken) ?? rows[0];

    if (!keeper) continue;

    const duplicates = rows.filter((row) => row.id !== keeper.id);
    const inheritedPushToken = duplicates.find((row) => row.pushToken)?.pushToken;

    if (!keeper.pushToken && inheritedPushToken) {
      await collection.updateOne({ _id: keeper.id }, { $set: { pushToken: inheritedPushToken } });
    }

    await collection.deleteMany({ _id: { $in: duplicates.map((row) => row.id) } });
    removed += duplicates.length;
  }

  if (removed > 0) {
    logger.info(`UserSession duplicates removed before building the (user, deviceId) index: ${removed}`);
  }

  return removed;
};
