import type { JobStatusData, MarkAllSeenResult, ToggleSeenResult } from '@/types/utils.type';

import {
  CRON_UI_RIGHT, MAX_BULK_UPDATE_LIMIT, MAX_DESTROY_OBJECTS_LIMIT, MAX_MARK_ALL_SEEN_LIMIT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  bulkToggleEntitiesSeenSchema, destroyObjectsSchema, markAllEntitiesSeenSchema,
} from '@/validations/_core/utils.validations';

import { buildClassQuery, countBadgeObjects } from '../../services/_core/badgeCount.service.cloud';
import { assertHasBoRight, assertHasRight } from '../../utils/_core/role.utils.cloud';
import { actingUserContext, fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define('getJobStatus',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<JobStatusData[]> => {
    // the interface only hides the cron tab: the server refuses a caller without its right
    await assertHasBoRight(request.user!, CRON_UI_RIGHT, request.params.locale);

    const status = await new Parse.Query('_JobStatus')
      .greaterThan('createdAt', new Date(Date.now() - (12 * 60 * 60 * 1000))) // the last 12 hours
      .select('createdAt', 'jobName', 'message', 'finishedAt', 'status')
      .addDescending('createdAt')
      .find(USE_MASTER_KEY);

    return status.map((status: Parse.Object) => {
      let data: JobStatusData = {
        objectId: status.id,
        status: status.get('status'),
        startDate: status.get('createdAt').toISOString(),
        name: status.get('jobName'),
      };

      const message = status.get('message');

      if (message) {
        if (message.startsWith('{')) {
          data = {
            ...data,
            ...JSON.parse(message),
          };
        }
        else {
          data.message = message;
        }
      }

      const finishedAt = status.get('finishedAt');

      if (finishedAt) {
        data.endDate = finishedAt.toISOString();
      }
      return data;
    });
  })
);

Parse.Cloud.define(
  'destroyObjects',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { ids, collection } = request.params;
    const objects = await buildClassQuery(collection)
      .containedIn('objectId', ids)
      .equalTo('deleted', true)
      .limit(MAX_DESTROY_OBJECTS_LIMIT)
      .find();

    const destroyedObjects = await Parse.Object.destroyAll(objects, USE_MASTER_KEY) || [];

    return destroyedObjects.length;
  }, ['destroy']),
  parseFunctionValidation(destroyObjectsSchema)
);

/**
 * Flips `seen` on the rows an admin ticked in a back-office list, in one round trip rather than
 * the N sequential client saves this replaced.
 *
 * `notEqualTo('seen', value)` is what makes it idempotent, and that matters beyond saving writes:
 * re-saving a row that already carries the value would mark the field dirty again, and the
 * `beforeSave` behind it would rewrite `seenAt` — the date of the first admin who opened the row
 * would silently become today's. It also spares the LiveQuery pub/sub an event per unchanged row,
 * each of which costs every connected back-office a badge recount.
 *
 * The recomputed badge count travels back with the result: the client used to adjust its own by
 * the number of rows it toggled, which drifts as soon as another admin is working the same queue.
 */
Parse.Cloud.define(
  'bulkToggleEntitiesSeen',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<ToggleSeenResult> => {
    const { ids, collection, value } = request.params;

    await assertHasRight(request.user!, collection, ['update'], request.params.locale);

    const objects = await buildClassQuery(collection)
      .containedIn('objectId', ids)
      .notEqualTo('seen', value)
      .select(['objectId', 'seen'])
      .limit(MAX_BULK_UPDATE_LIMIT)
      .find(USE_MASTER_KEY);

    objects.forEach((object) => object.set('seen', value));

    /*
     * the master key carries no session, so without this the `seenBy`/`unseenBy` the trigger
     * writes would name nobody — see `getActingUser`
     */
    await Parse.Object.saveAll(objects, { ...USE_MASTER_KEY, ...actingUserContext(request.user) });

    return {
      toggledIds: objects.map((object: Parse.Object): string => object.id),
      count: await countBadgeObjects(collection),
    };
  }),
  parseFunctionValidation(bulkToggleEntitiesSeenSchema)
);

/**
 * Empties a collection's queue in one action — what a notification centre's "mark all as read"
 * does, and what an admin otherwise had to do by ticking rows fifty at a time.
 *
 * Unlike the toggle above, nothing the caller passes bounds the result set, so `MAX_MARK_ALL_SEEN_LIMIT`
 * is the only thing between one click and a full-collection write; a backlog deeper than that
 * takes a second click. The count it returns is the badge value after the pass, which is what
 * tells the caller whether anything is left.
 */
Parse.Cloud.define(
  'markAllEntitiesSeen',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<MarkAllSeenResult> => {
    const { collection } = request.params;

    await assertHasRight(request.user!, collection, ['update'], request.params.locale);

    const objects = await buildClassQuery(collection)
      .equalTo('deleted', false)
      .notEqualTo('seen', true)
      .select(['objectId', 'seen'])
      .limit(MAX_MARK_ALL_SEEN_LIMIT)
      .find(USE_MASTER_KEY);

    objects.forEach((object) => object.set('seen', true));

    await Parse.Object.saveAll(objects, { ...USE_MASTER_KEY, ...actingUserContext(request.user) });

    return {
      markedCount: objects.length,
      count: await countBadgeObjects(collection),
    };
  }),
  parseFunctionValidation(markAllEntitiesSeenSchema)
);
