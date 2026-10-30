import dayjs from 'dayjs';
import Parse from 'parse';

import {
  DateType, IJobStatusAttributes, IMarkAllSeenResult, IToggleSeenResult,
} from '@/types/_core/utils.type';
import { setValues } from '@/utils/_core/parse.utils';

const collection = 'App';
const App = Parse.Object.extend(collection);

/*
 * ----------------------------------------------------- //
 * ------------------- Parse queries ------------------- //
 * ----------------------------------------------------- //
 */
export const dateRangeQuery = (query: Parse.Query, field: string, range: (DateType | null)[]): void => {
  if (!Array.isArray(range)) return;
  const start = range[0];
  const end = range[1];

  // greater or equal than start date
  if (start && !end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(start).endOf('day').toDate());
  }
  // lesser or equal than end date
  if (end && !start) {
    query
      .greaterThanOrEqualTo(field, dayjs(end).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
  }
  // between 2 dates
  if (start && end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
  }
};

/**
 * query type date fields
 * @param query
 * @param search
 */
export const filtersDatesQuery = (
  query: Parse.Query,
  search: Record<string, string | (DateType | null)[]>,
  otherDateFields = []
) => {
  ['createdAt', 'updatedAt', ...otherDateFields].forEach((field) => {
    if (search[field]) {
      dateRangeQuery(query, field, search[field] as (DateType | null)[]);
    }
  });
};

export const fetchApp = async (): Promise<Parse.Object | undefined> => {
  let app = await new Parse.Query(App)
    .ascending('createdAt')
    .first();

  if (!app) {
    app = new App();
  }

  return app;
};

export const fetchAppSingleton = async (): Promise<Parse.Object | undefined> => {
  return new Parse.Query(App).ascending('createdAt').first();
};

export const fetchNotificationCount = async (className: string, status?: string): Promise<number> => {
  return Parse.Cloud.run('getObjectsCount', { className, status });
};

export const markEntityAsSeen = async (collection: string, id: string): Promise<void> => {
  const parseObj = Parse.Object.extend(collection).createWithoutData(id);

  parseObj.set('seen', true);
  await parseObj.save();
};

/**
 * Flips `seen` on the ticked rows and returns which ones actually changed, plus the collection's
 * badge count recomputed server-side. The list itself is rebuilt by the caller — see
 * `applySeenToItems`: a service talks to the API, it does not decide what a page displays.
 */
export const toggleEntitiesSeenByIds = async (
  collection: string,
  ids: string[],
  value: boolean
): Promise<IToggleSeenResult> => {
  return Parse.Cloud.run('bulkToggleEntitiesSeen', { ids, collection, value });
};

/**
 * Clears whatever is left unseen in the collection, in one pass. Returns how many rows it cleared
 * and what the badge reads afterwards — a count still above zero means the backlog was deeper than
 * the server's per-pass cap and a second pass is needed.
 */
export const markAllEntitiesSeenInCloud = async (
  collection: string
): Promise<IMarkAllSeenResult> => {
  return Parse.Cloud.run('markAllEntitiesSeen', { collection });
};

export const destroyObjectsByIds = async (ids: string[], collection: string): Promise<number> => {
  return Parse.Cloud.run('destroyObjects', { ids, collection });
};

const APP_PROPERTIES = new Set(['translated', 'image', 'imageForDarkMode']);

export const saveApp = async (
  app: Parse.Object,
  newValues: Record<string, unknown>
): Promise<Parse.Object> => {
  setValues(app, newValues, APP_PROPERTIES);
  await app.save();

  return app;
};

export const fetchJobStatus = async (): Promise<IJobStatusAttributes[]> => {
  return await Parse.Cloud.run('getJobStatus');
};
