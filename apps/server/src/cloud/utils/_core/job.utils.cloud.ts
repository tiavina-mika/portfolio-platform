import { randomUUID } from 'node:crypto';

import type { Request, Response, NextFunction } from 'express';

import queue from 'async/queue.js';
import throttle from 'lodash/throttle.js';

import { translate } from '@/config/i18n';
import { getRedis } from '@/config/redis';
import { USE_MASTER_KEY, USE_READ_PREFERENCE } from '@/constants/_core/constants';
import {
  JOB_FAILURE_ALERT_INTERVAL_SECONDS, JOB_FAILURE_ALERT_KEY_PREFIX, JOB_SLOW_THRESHOLD_MS,
  SCHEDULED_JOB_RUNNING_KEY_PREFIX, SCHEDULED_JOB_RUNNING_TTL_SECONDS, SCHEDULED_RUN_PARAM,
} from '@/constants/_core/job.constants';
import { SLACK_ALERT_ICONS, SLACK_ALERT_LOCALE } from '@/constants/_core/slack.constants';
import { isSlackAlertEnabled, postSlackAlert } from '@/services/slack.service';
import { logger } from '@/utils/_core/logger';
import { buildSlackAlertText } from '@/utils/_core/slack.utils';

/**
 * What kind of error a job failed with — its class and, for a Parse error, its numeric code —
 * and nothing it says. A message quotes the data it choked on (a phone number in a duplicate-key
 * error, a URL with its token in a network error), and the Slack channel is read by all the staff:
 * the message stays in the server logs, where access is controlled.
 */
const describeErrorKind = (error: unknown): string => {
  const name = (error as Error | undefined)?.name ?? typeof error;
  const code = (error as { code?: unknown } | undefined)?.code;

  return typeof code === 'number' ? `${name}, code ${code}` : name;
};

/**
 * Posts a failed job to the staff's Slack alert channel, at most once per job per
 * `JOB_FAILURE_ALERT_INTERVAL_SECONDS`: a job failing on every tick would otherwise post on every
 * tick. The throttle key is written atomically (`NX`), so several server instances failing the same
 * job do not each post. Never throws — it runs inside the failure it reports.
 */
export const alertStaffOfFailedJob = async (jobName: string, error: unknown): Promise<void> => {
  if (!isSlackAlertEnabled()) return;

  try {
    const throttleKey = `${JOB_FAILURE_ALERT_KEY_PREFIX}:${jobName}`;
    const isFirstAlert = await getRedis().set(throttleKey, Date.now(), {
      nx: true,
      ex: JOB_FAILURE_ALERT_INTERVAL_SECONDS,
    });

    if (!isFirstAlert) return;

    await postSlackAlert(buildSlackAlertText({
      icon: SLACK_ALERT_ICONS.job,
      title: translate('slack.scheduledJobFailed', SLACK_ALERT_LOCALE, { jobName }),
      details: translate('slack.scheduledJobFailedDetails', SLACK_ALERT_LOCALE, {
        kind: describeErrorKind(error),
      }),
    }));
  }
  catch (alertError) {
    logger.error(`[job:${jobName}] failure alert could not be sent`, {
      error: (alertError as Error).message,
    });
  }
};

type JobRunningLock = { key: string; token: string };

/**
 * Claims the right to run a scheduled job while no other run of it is in progress. The per-tick
 * lock of the scheduler only stops two instances from starting the same tick; it cannot see a run
 * outlasting its interval, so the next tick used to start a second copy on top of the first. The
 * lock is released by the run itself, or expires after `SCHEDULED_JOB_RUNNING_TTL_SECONDS` if the
 * server died before it could.
 *
 * Like the tick lock, it lets the run go ahead when Redis cannot be reached: the jobs are written to
 * be re-run, and a skipped run would leave the work undone.
 * @returns the lock to release when the run ends, `null` when another run is in progress,
 * `undefined` when Redis could not be reached and there is nothing to release
 */
const acquireJobRunningLock = async (
  jobName: string,
  countryCode?: string
): Promise<JobRunningLock | null | undefined> => {
  const key = [SCHEDULED_JOB_RUNNING_KEY_PREFIX, jobName, countryCode].filter(Boolean).join(':');
  // this run's own mark: a run that outlived the expiry must not release the next run's lock
  const token = randomUUID();

  try {
    const result = await getRedis().set(key, token, {
      nx: true,
      ex: SCHEDULED_JOB_RUNNING_TTL_SECONDS,
    });

    return result === 'OK' ? { key, token } : null;
  }
  catch (error) {
    logger.error(`[job:${jobName}] running lock unavailable, running without it`, {
      error: (error as Error).message,
    });
    return undefined;
  }
};

const releaseJobRunningLock = async (jobName: string, { key, token }: JobRunningLock): Promise<void> => {
  try {
    /*
     * only while it is still this run's: past the expiry, a later run may hold it, and deleting it
     * would let a third run start on top of that one
     */
    if (await getRedis().get(key) === token) await getRedis().del(key);
  }
  catch (error) {
    // the key expires on its own
    logger.error(`[job:${jobName}] running lock could not be released`, {
      error: (error as Error).message,
    });
  }
};

/**
 * Registers a Parse Job, like `Parse.Cloud.job`, whose failure reaches the staff on Slack. Parse
 * only records a failed run in `_JobStatus`, which nobody reads, and the scheduler cannot see it:
 * `runJob` returns as soon as the job has started. The error is rethrown, so the run is still marked
 * failed in `_JobStatus`.
 *
 * A run started by the scheduler (`SCHEDULED_RUN_PARAM`) is skipped when the previous run of the same
 * job, for the same country, is still going. Runs started by a trigger or by hand never wait.
 *
 * The run time is logged (debug, or warn above `JOB_SLOW_THRESHOLD_MS`): the scheduler's own log
 * only sees the job start, so this is where the real cost of a job shows up.
 */
export const defineJob = <T extends Parse.Cloud.Params = Parse.Cloud.Params>(
  jobName: string,
  handler: (request: Parse.Cloud.JobRequest<T>) => unknown
): void => {
  Parse.Cloud.job(jobName, async (request): Promise<void> => {
    const start = Date.now();
    const params: Record<string, unknown> = request.params ?? {};
    let runningLock: JobRunningLock | null | undefined;

    if (params[SCHEDULED_RUN_PARAM]) {
      runningLock = await acquireJobRunningLock(jobName, params.countryCode as string | undefined);

      if (runningLock === null) {
        logger.warn(`[job:${jobName}] skipped, the previous run is still in progress`);
        return;
      }
    }

    try {
      await handler(request as Parse.Cloud.JobRequest<T>);

      const durationMs = Date.now() - start;

      if (durationMs > JOB_SLOW_THRESHOLD_MS) {
        logger.warn(`[job:${jobName}] slow run`, { durationMs });
      }
      else {
        logger.debug(`[job:${jobName}] handler done`, { durationMs });
      }
    }
    catch (error) {
      logger.error(`[job:${jobName}] failed`, { error: (error as Error)?.stack ?? String(error) });
      await alertStaffOfFailedJob(jobName, error);
      throw error;
    }
    finally {
      if (runningLock) await releaseJobRunningLock(jobName, runningLock);
    }
  });
};

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
      logger.error('runJobMiddleware error', { error: (error as Error).stack });
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
export type ParallelJobData = {
  success: number;
  count: number;
  error: number;
  message?: string;
  otherValues?: Record<string, any>;

};
export type RunParallelJobInput<T = string> = {
  /**
   * array of items to treat
   * @default undefined
   */
  array?: T[];
  /**
   * query to get items to treat
   * @default undefined
   */
  query?: Parse.Query;
  /**
   * worker function to treat each item
   * @required
   */
  worker: (item: any) => Promise<void>;
  /**
   * number of concurrent tasks to run at the same time
   * @default 10
   */
  concurrency?: number;
  /**
   * request object to send message
   * mainly used for parse server job
   * @default undefined
   */
  request?: any;
  /**
   * message to send when all tasks are done
   * @default undefined
   */
  endMessage?: string;
  /**
   * other values to send in the message
   * @default undefined
   */
  otherValues?: Record<string, any>;
  /**
   * logger
   * @default undefined
   */
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

  // --------- count --------- //
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

  let message = null;

  if (request) {
    message = throttle(() => request.message(JSON.stringify(data)), 2000);
  }

  /*
   * --------- queue --------- //
   * add concurrency to the queue
   * e.g. if concurrency is 10, 10 tasks will run at the same time
   */
  const q = queue(async (item: T) => {
    try {
      await worker(item);
      data.success++; // treated without error

      const processedCount = data.success + data.error;

      // all tasks have been treated
      if (processedCount === data.count && endMessage) {
        data.message = endMessage;
      }

      // all tasks have been treated and we have other values to send
      if (processedCount >= 1 && otherValues) {
        Object.keys(otherValues).forEach((key: string) => {
          (data as any)[key] = otherValues[key];
        });
      }

      // send message to the request
      message?.();
    }
    catch (error) {
      logger.error('runParallelJob error', { error: (error as Error).stack });
      if (log) {
        log.error('error while treating item', { errStack: (error as Error).stack, errMsg: (error as Error).message || error });
      }
      data.error++; // treated with error
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
    q.push(item); // add item to the queue
  };

  // array processing
  if (array) {
    if (log) {
      log.info('trying to execute function on array items');
    }
    for (const item of array) {
      await treatItem(item);
    }
  }
  // parse query processing
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
    message?.flush();
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
    request?.message(dataToJobMessage(data));
  }

  if (log) {
    log.info('Ending function runParallelJob', { data, concurrency });
  }

  return data;
};
