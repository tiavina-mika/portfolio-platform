# Scheduled Tasks

## Table of Contents

- [Server (node-cron)](#server-node-cron)
- [GitHub Actions schedules](#github-actions-schedules)
- [Jobs started on demand](#jobs-started-on-demand)

## Server (node-cron)

All `schedule(...)` calls are in `apps/server/src/config/scheduled-jobs.ts` (`scheduleJobs`, called once at boot from `apps/server/src/index.ts`). Each run goes through `runScheduledJob`, which:

- takes a Redis lock named after the job and the minute (`acquireScheduledJobLock`), so that only one server instance runs a tick when several instances are alive; if Redis cannot be reached the tick runs anyway and the failure is logged;
- runs the Cloud Job and alerts the staff (Slack and e-mail) when it fails.

The keep-awake ping runs outside local development and outside Cloud Run. The business jobs run **only in production** (`IS_PROD`, or locally with `FORCE_PROD` flipped to true): they are deliberately off in pre-production.

| Schedule (server time unless noted) | Job | What |
|---|---|---|
| `*/14 * * * *` | none (calls `/ping`) | Keeps a free hosting plan awake. Not in local development, not on Cloud Run |
| `*/2 * * * *` | `reconcilePendingPaymentsJob` | Settles the payments still waiting for their operator |
| `*/5 * * * *` | `revokeExpiredImpersonationSessionsJob` | Revokes expired "login as" sessions |
| `0 * * * *` | `processPushReceiptsJob` | Processes Expo push receipts and clears stale push tokens |
| `25 * * * *` | `retryFailedPlatformPaymentsJob` | Retries the payments owed and not sent |
| `0 2 * * *` | `expireOldNotificationsJob` | Soft-deletes notifications older than 365 days |
| `30 2 * * *` | `purgeOrphanedEditorFilesJob` | Deletes the Cloudinary images of the CMS editor that no Page or Article references (older than 24 hours only) |
| `30 3 * * *` | `purgeUnverifiedPhoneSignupsJob` | Destroys sign-ups that never confirmed their phone number |
| `40 3 * * *` | `purgeOrphanUserSessionsJob` | Destroys device rows with neither a push token nor a session |
| `30 4 * * 0` | `purgeOldNotificationsJob` | Weekly purge of old notifications (Sundays) |
| `45 4 * * 0` | `purgeOldLogsJob` | Weekly destruction of audit, moderation and ticket rows past their retention |
| `30 7 * * *` (default country time zone) | `postDailySlackSummaryJob` | Posts yesterday's figures to the staff Slack channel |
| `15 8 * * *` (default country time zone) | `liftExpiredBansJob` | Lifts expired temporary bans |

## GitHub Actions schedules

Times are UTC. Details in [CI workflows](CI_WORKFLOWS.md).

| Workflow | Cron | When |
|---|---|---|
| `storybook-tests.yml` | `0 2 * * *` | Every day, 02:00 |
| `chromatic.yml` | `0 3 */4 * *` | Every four days, 03:00 |
| `security.yml` | `0 5 * * 1` | Mondays, 05:00 |
| `lighthouse.yml` | `0 6 * * 1` | Mondays, 06:00 |

## Jobs started on demand

The other Cloud Jobs are started by a trigger, a service or a function (see [Cloud Code](CLOUD_FUNCTIONS.md#cloud-jobs)). In particular the recycle bin is only emptied when `clearRecycleBinInCloud` is called, there is no automatic purge of it.
