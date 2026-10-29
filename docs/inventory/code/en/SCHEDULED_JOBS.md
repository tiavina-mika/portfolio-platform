# Scheduled Tasks

## Table of Contents

- [Server (node-cron)](#server-node-cron)
- [GitHub Actions schedules](#github-actions-schedules)
- [Jobs started on demand](#jobs-started-on-demand)

## Server (node-cron)

Only one `cron.schedule(...)` exists, in `apps/server/src/index.ts`.

| Schedule | What | Condition |
|---|---|---|
| `*/10 * * * *` (every 10 minutes) | Calls the server's own `/ping` route to keep the free hosting plan awake | Not in local development (`IS_LOCAL` false) |

The comment above the `/ping` route says every 14 minutes: the code runs every 10 minutes.

## GitHub Actions schedules

Times are UTC. Details in [CI workflows](CI_WORKFLOWS.md).

| Workflow | Cron | When |
|---|---|---|
| `storybook-tests.yml` | `0 2 * * *` | Every day, 02:00 |
| `chromatic.yml` | `0 3 */4 * *` | Every four days, 03:00 |
| `security.yml` | `0 5 * * 1` | Mondays, 05:00 |
| `lighthouse.yml` | `0 6 * * 1` | Mondays, 06:00 |

## Jobs started on demand

No Cloud Job is scheduled: they are started by a trigger, a service or a function (see [Cloud Code](CLOUD_FUNCTIONS.md#cloud-jobs)). In particular the recycle bin is only emptied when `clearRecycleBinInCloud` is called, there is no automatic purge.
