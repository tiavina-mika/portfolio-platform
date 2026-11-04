/** Redis key prefix of the per-tick lock that lets only one server instance run a scheduled job. */
export const SCHEDULED_JOB_LOCK_KEY_PREFIX = 'cron-lock';

/*
 * The lock key already names the tick it belongs to, so the expiry is only there to let Redis
 * reclaim the key — it just has to outlive the few seconds of clock skew between instances.
 */
export const SCHEDULED_JOB_LOCK_TTL_SECONDS = 60 * 60;

/**
 * Param the scheduler adds to the run it starts, so `defineJob` can tell it from a run started by a
 * trigger (which must never wait for another) or by hand from the BO
 */
export const SCHEDULED_RUN_PARAM = 'isScheduledRun';

/** Redis key prefix of the lock held for as long as a scheduled job is running. */
export const SCHEDULED_JOB_RUNNING_KEY_PREFIX = 'cron-running';

/*
 * What a crashed run keeps its job from starting again for. Longer than any scheduled job should
 * take, short enough that a server killed mid-run leaves the job idle for a few minutes at most
 */
export const SCHEDULED_JOB_RUNNING_TTL_SECONDS = 10 * 60;

/*
 * A job running longer than this is logged as a warning with its duration: it is the one to look at
 * first when deciding which cadence to loosen or which query to index
 */
export const JOB_SLOW_THRESHOLD_MS = 30 * 1000;
