import type { Request, Response, NextFunction } from 'express';

import queue from 'async/queue.js';
import throttle from 'lodash/throttle.js';

import { USE_MASTER_KEY, USE_READ_PREFERENCE } from '../../utils/constants';

/**
 * run a job
 * see https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Cloud.html#.startJob
 * @param jobName
 * @param [params]
 * @returns {Promise<string>} jobStatusId
 */
export const runJob = async (jobName: string, params?: Record<string, any>) => {
  const job = await Parse.Cloud.startJob(jobName, params);

  return job;
};

/**
 * use as (express) API middleware to run a job
 * ex: app.get('/my-api', runJobMiddleware('my-job-name', { title: "my-title" }));
 * @param jobName
 * @param params
 * @returns
 */
export const runJobMiddleware = (jobName: string, params: Record<string, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await runJob(jobName, { ...params, ...req.params });
      res
        .status(200) // otherwise it can be 304 and GCP doesn't like it (it's an error for him)
        .send('Job Started, name : "' + jobName + '", with params: "' + JSON.stringify({ ...params, ...req.params }) + '"');
    }
    catch (error) {
      console.log('runJobMiddleware error :', error);
      next(error);
    }
  };
};

/**
 * format job message
 * @param data
 * @returns {string}
 */
const dataToJobMessage = (data: Record<string, any>) => {
  const { endMessage, ...otherValues } = data;

  if (Number.isInteger(otherValues.totalCount)) {
    data.count = otherValues.totalCount;
    delete data.totalCount;
  }
  if (Number.isInteger(otherValues.successCount)) {
    data.success = otherValues.successCount;
    delete data.successCount;
  }
  if (Number.isInteger(otherValues.errorCount)) {
    data.error = otherValues.errorCount;
    delete data.errorCount;

    if (data.error !== data.count - data.success) {
      data.error = data.count - data.success;
    }
  }

  if (!otherValues.message && endMessage) {
    data.message = endMessage;
    delete data.endMessage;
  }
  return JSON.stringify(data);
};

/**
 * run parallel job
 * @param array
 * @param query
 * @param worker
 * @param [concurrency]
 * @param request
 * @param [endMessage]
 * @param [otherValues]
 * @param [log]
 * @returns {Promise<{success: number, count: number, error: number}>}
 */
type ParallelJobData = {
  success: number;
  count: number;
  error: number;
  message?: string;
  otherValues?: Record<string, any>;

};
type RunParallelJobInput<T> = {
  array?: T[];
  query?: Parse.Query;
  worker: (item: any) => Promise<void>;
  concurrency?: number;
  request: any;
  endMessage?: string;
  otherValues?: Record<string, any>;
  log?: any;
};
export const runParallelJob = async <T = Parse.Object>({
  array,
  query,
  worker,
  concurrency = 10,
  request,
  endMessage,
  otherValues,
  log,
}: RunParallelJobInput<T>) => {
  const data: ParallelJobData = {
    count: -1,
    success: 0,
    error: 0,
  };

  if (array) {
    data.count = array.length;
  }
  else if (query) {
    data.count = await query.count(USE_MASTER_KEY);
  }

  const totalCount = data.count;

  if (log) {
    log.info('Starting function runParallelJob', { totalCount, concurrency });
  }

  const message = throttle(() => request.message(JSON.stringify(data)), 2000);

  const q = queue(async (item: T) => {
    try {
      await worker(item);
      data.success++;

      const processedCount = data.success + data.error;

      if (processedCount === data.count && endMessage) {
        data.message = endMessage;
      }

      if (processedCount >= 1 && otherValues) {
        Object.keys(otherValues).forEach((key: string) => {
          (data as any)[key] = otherValues[key];
        });
      }

      message();
    }
    catch (error) {
      console.error('runParallelJob error', error);
      if (log) {
        log.error('error while treating item', { errStack: (error as Error).stack, errMsg: (error as Error).message || error });
      }
      data.error++;
    }
  }, concurrency);

  const treatItem = async (item: T) => {
    /*
     * we wait for a free concurrent "slot"
     * we don't want to used the "queue part" of the queue
     */
    if (q.running() === concurrency) {
      await q.unsaturated();
    }
    q.push(item);
  };

  if (array) {
    if (log) {
      log.info('trying to execute function on array items');
    }
    for (const item of array) {
      await treatItem(item);
    }
  }
  else if (query) {
    if (log) {
      log.info('trying to execute function on query');
    }
    await query.each(async (parseObj) => {
      await treatItem(parseObj as T);
    }, {
      ...USE_MASTER_KEY,
      ...USE_READ_PREFERENCE,
      batchSize: 500,
    });
  }

  if (totalCount) {
    /*
     * --------------------- //
     * ----- with count ---- //
     * --------------------- //
     */
    if (log) {
      log.warning('tasks are running', { totalCount, concurrency });
    }
    // all tasks have been added to the queue and are running
    await q.drain();
    // all tasks' treatment have ended
    message.flush();
  }
  else {
    /*
     * --------------------- //
     * ----- no item ------- //
     * --------------------- //
     */
    if (log) {
      log.warning('there is no item', { totalCount });
    }
    data.message = endMessage;
    data.otherValues = otherValues;
    request.message(dataToJobMessage(data));
  }

  if (log) {
    log.info('Ending function runParallelJob', { data, concurrency });
  }

  return data;
};
