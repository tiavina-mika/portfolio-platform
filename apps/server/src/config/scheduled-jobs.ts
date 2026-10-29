import crypto from 'crypto';

import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '@shared/constants';
import { schedule } from 'node-cron';

import { alertStaffOfFailedJob, runJob } from '@/cloud/utils/_core/job.utils.cloud';
import { getRedis } from '@/config/redis';
import {
  FORCE_PROD, IS_CLOUD_RUN, IS_LOCAL, IS_PROD,
} from '@/constants/_core/constants';
import {
  SCHEDULED_JOB_LOCK_KEY_PREFIX, SCHEDULED_JOB_LOCK_TTL_SECONDS, SCHEDULED_RUN_PARAM,
} from '@/constants/_core/job.constants';
import { logger } from '@/utils/_core/logger';
import { runWithCorrelationId } from '@/utils/_core/request-context.utils';

/**
 * Options of the jobs that address the staff in the morning: read on the clock of the default
 * country, where the team works. Left on the server's (UTC in production), "08:00" reached them at 11:00.
 */
const LOCAL_MORNING_SCHEDULE = { timezone: DEFAULT_COUNTRY.timeZone };

/**
 * Claims one tick of a scheduled job for this server instance. Every instance runs the same
 * node-cron schedule (Cloud Run keeps up to 3 of them), so without a shared lock each tick ran once
 * per instance — reminders, expirations and alerts went out two or three times. The key names the
 * job and the minute it fired for: the first instance to write it wins, the others skip that tick.
 *
 * When Redis cannot be reached the tick runs anyway, and the failure is logged as an error. Every
 * scheduled job is written to be re-runnable (guard fields such as `reminder24hSentAt`, or a status
 * filter the job itself moves rows out of), so a duplicate run during an outage is the lesser harm:
 * skipping would leave bookings unexpired, payouts unreleased and refunds unprocessed until Redis
 * came back, with nothing to catch up on the ticks that were missed.
 * @returns whether this instance should run the tick
 */
export const acquireScheduledJobLock = async (
  jobName: string,
  firedAt: Date = new Date()
): Promise<boolean> => {
  // minute precision in UTC: the same tick fired by two instances a few ms apart shares one key
  const tick = firedAt.toISOString().slice(0, 16);
  const key = `${SCHEDULED_JOB_LOCK_KEY_PREFIX}:${jobName}:${tick}`;

  try {
    const result = await getRedis().set(key, crypto.randomUUID(), {
      nx: true,
      ex: SCHEDULED_JOB_LOCK_TTL_SECONDS,
    });

    return result === 'OK';
  }
  catch (error) {
    logger.error(`[job:${jobName}] lock unavailable, running without it`, {
      error: (error as Error).message,
    });
    return true;
  }
};

/**
 * Runs a scheduled Parse Job, logging start/end with duration and catching cron-side errors
 * so one failing job never crashes the node-cron scheduler. Each run gets its own correlationId
 * so its logs (and any service call it makes) can be traced apart from other runs/requests.
 */
const runScheduledJob = async (jobName: string, params?: { countryCode: string }): Promise<void> =>
  runWithCorrelationId(crypto.randomUUID(), async () => {
    const start = Date.now();
    // one lock per country: two countries whose mornings fall on the same minute are two ticks
    const lockName = params ? `${jobName}:${params.countryCode}` : jobName;

    if (!(await acquireScheduledJobLock(lockName))) {
      logger.debug(`[job:${jobName}] skipped, another instance runs this tick`);
      return;
    }

    logger.info(`[job:${jobName}] start`);
    try {
      await runJob(jobName, { ...params, [SCHEDULED_RUN_PARAM]: true });
      logger.info(`[job:${jobName}] done in ${Date.now() - start}ms`);
    }
    catch (error) {
      logger.error(`[job:${jobName}] cron error`, { error: (error as Error).stack });
      // the job could not even start; a failure while it runs is reported by `defineJob`
      await alertStaffOfFailedJob(jobName, error);
    }
  });

/**
 * Schedules a job that notifies members in the morning once per country, each on its own clock and
 * for its own members only: the job is handed the `countryCode` it serves. A single run on one
 * clock would wake a member of another time zone in the middle of their night.
 */
export const scheduleMemberMorningJob = (
  cronExpression: string,
  jobName: string,
  countries: Country[] = Object.values(COUNTRIES)
): void => {
  countries.forEach((country) => {
    schedule(
      cronExpression,
      () => runScheduledJob(jobName, { countryCode: country.code }),
      { timezone: country.timeZone }
    );
  });
};

/**
 * Registers every node-cron background job. Called once at server startup (see index.ts).
 */
export const scheduleJobs = (serverUrl: string): void => {
  /*
   * Skipped on Cloud Run: it only exists to defeat the scale-to-zero of the current host
   * (onrender)'s free tier, and would instead defeat Cloud Run's own scale-to-zero — the
   * business jobs below are unaffected and rely on prod's `--no-cpu-throttling`/
   * `--min-instances=1` instead, which keep one instance awake with CPU for node-cron to tick on.
   */
  if (!IS_LOCAL && !IS_CLOUD_RUN) {
    /*
     * Schedule a cron job to ping the app every 14 minutes
     * to keep the app awake (onrender free plan has 15 minutes inactivity limit)
     */
    schedule('*/14 * * * *', async () => {
      try {
        const response = await fetch(serverUrl + '/ping');

        logger.debug('App is awake: ' + response.status);
      }
      catch (error) {
        logger.error('Error while pinging the server', { error: (error as Error).stack });
      }
    });
  }

  /*
   * Background jobs below only run in prod (or locally with FORCE_PROD flipped to true in
   * constants.ts, to test them against a real run without waiting for the schedule to tick).
   * Deliberately excluded from preprod: an occasional missed run has no real consequence there.
   */
  const shouldCronEnabled = IS_PROD || FORCE_PROD;
  if (shouldCronEnabled) {
    /*
     * Soft-delete notifications older than 365 days — runs daily at 02:00 (server time)
     * Low-traffic window; batch is small on a steady-state DB (only the notifications from exactly 1 year ago)
     */
    schedule('0 2 * * *', () => runScheduledJob('expireOldNotificationsJob'));

    /*
     * Purge orphaned Cloudinary images inserted via the CMS (Page/Article) TipTap editor —
     * runs daily at 02:30 (server time), offset from the notifications job above
     * Only deletes files older than 24h that are not referenced by any Page/Article content,
     * so an edit still in progress (image uploaded, content not saved yet) is never touched
     */
    schedule('30 2 * * *', () => runScheduledJob('purgeOrphanedEditorFilesJob'));

    /*
     * Retry the payments the platform owes and could not send (late-cancellation compensations,
     * refunds of bookings already cancelled) — runs hourly
     * Each payment carries its own next attempt (nextAutoRetryAt, 1h / 6h / 24h apart); the admins
     * are e-mailed once every attempt is spent
     */
    schedule('25 * * * *', () => runScheduledJob('retryFailedPlatformPaymentsJob'));

    /*
     * Settle the payments still waiting for their operator — every 2 minutes
     * Mobile money is confirmed by the customer on their phone, after the call that asked for it
     * has returned: each payment carries its own next check (nextCheckAt), and fails once it is
     * PENDING_PAYMENT_TIMEOUT_MINUTES old without a confirmation
     */
    schedule('*/2 * * * *', () => runScheduledJob('reconcilePendingPaymentsJob'));

    /*
     * Post yesterday's figures (sign-ups and whatever a domain registers) to the staff's
     * Slack alert channel — runs daily at 07:30 (country time), before the 08:00 batch below, so
     * the day is counted once it is over and read when the staff starts. Does nothing in an
     * environment with no Slack channel
     */
    schedule('30 7 * * *', () => runScheduledJob('postDailySlackSummaryJob'), LOCAL_MORNING_SCHEDULE);

    /*
     * Lift expired temporary bans — runs daily at 08:15 (default country time, staff clock)
     * Clears the `banned` flag once a temporary ban's `until` date has passed; permanent bans are never lifted
     */
    schedule('15 8 * * *', () => runScheduledJob('liftExpiredBansJob'), LOCAL_MORNING_SCHEDULE);

    /*
     * Process pending Expo push receipts and clear stale device push tokens — runs hourly,
     * comfortably after PUSH_RECEIPT_MIN_AGE_MINUTES (15) so receipts are ready by the time a batch
     * is picked up, and well inside the PUSH_RECEIPT_MAX_AGE_HOURS (24) Expo keeps them for
     */
    schedule('0 * * * *', () => runScheduledJob('processPushReceiptsJob'));

    /*
     * Revoke expired impersonation ("login as") sessions — runs every 5 minutes
     * The TTL is short (IMPERSONATION_SESSION_TTL_MINUTES) by design, so a tight cadence here
     * keeps a stale support session from lingering on the member's account past its TTL
     */
    schedule('*/5 * * * *', () => runScheduledJob('revokeExpiredImpersonationSessionsJob'));

    schedule('30 4 * * 0', () => runScheduledJob('purgeOldNotificationsJob'));

    /*
     * Destroy the audit, moderation, SOS, ticket-message and expired-link rows past their retention
     * period (LOG_RETENTION_RULES) — runs weekly on Sunday at 04:45, after the purges above
     * so the heaviest deletions never overlap. Retention is counted in months, so weekly is plenty
     */
    schedule('45 4 * * 0', () => runScheduledJob('purgeOldLogsJob'));

    /*
     * Destroy sign-ups that never confirmed their phone number — runs daily at 03:30 (server
     * time), between the Sunday badge job and the morning batch. A phone sign-up claims its
     * number as `username` before the OTP, so every abandoned one holds that number hostage:
     * its real owner cannot sign up, and the abandoner cannot resume (no email to fall back on).
     */
    schedule('30 3 * * *', () => runScheduledJob('purgeUnverifiedPhoneSignupsJob'));

    /*
     * Destroy device rows that can neither be pushed to nor name a live session (no push token, no
     * session token) — runs daily at 03:40 (server time), between the two 03:30/03:45 jobs. Every
     * reinstall leaves one behind, and the push fan-out would otherwise keep paging through them.
     */
    schedule('40 3 * * *', () => runScheduledJob('purgeOrphanUserSessionsJob'));
  }
};
