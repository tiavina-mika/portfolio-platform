# Upstash Redis

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

Upstash Redis is a hosted Redis. The server uses it for the rate limits of its public routes, for Parse Server (cache, rate limit, LiveQuery pub/sub), and for the lock that lets only one server instance run each scheduled job tick. The website uses it for the per-visitor rate limit of the contact and newsletter forms.

## Where the code is

- `apps/server/src/config/redis.ts`: the REST client (`getRedis`), built lazily because the variables are loaded after the imports.
- `apps/server/src/config/scheduled-jobs.ts`: `acquireScheduledJobLock` (key prefix `cron-lock`, one hour expiry).
- `apps/server/src/index.ts`: `UPSTASH_REDIS_URL` is given to Parse Server.
- `apps/web/server/formRateLimit.server.ts` and `visitorRateLimit.server.ts`: the website limits.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server (required at boot), web (optional) | REST access |
| `UPSTASH_REDIS_URL` | server (required at boot) | Redis protocol URL used by Parse Server |

## Setup

1. Create a Redis database on Upstash and copy its REST URL, REST token and Redis URL.
2. Set the three variables in `apps/server/.env.preprod` or on the host; set the two REST ones on the web host if the form limit is wanted.
3. Use one database per environment.

## Gotchas

- The server refuses to boot without the three variables, even locally.
- When Redis cannot be reached, a scheduled job tick runs anyway (a duplicate run is judged less harmful than a missed one) and the failure is logged.
- Without the web variables the website does not limit visitors; the server still applies its own limit.
