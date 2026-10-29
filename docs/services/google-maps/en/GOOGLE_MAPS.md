# Google Maps

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

The Maps JavaScript API displays an interactive map (marker and info window) on the public website.

## Where the code is

`apps/web/components/Map.tsx` loads the API with `useJsApiLoader` (`@react-google-maps/api`) and the key from `apps/web/env.ts`. Only `apps/web` uses it.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | web | Maps JavaScript API key. Exposed to the browser by design, so it is protected by restrictions, not by secrecy. Required by `env.ts` |

## Setup

1. In Google Cloud, create a project and enable the Maps JavaScript API (a billing account is required, even within the free monthly credit).
2. Create an API key and restrict it to the Maps JavaScript API and to the HTTP referrers of the website (`localhost` for local work, pre-production and production domains).
3. Put the key in `apps/web/.env.local` or on the host.

## Gotchas

- An unrestricted key is readable in the page source and can be abused on your bill: always restrict it.
- `env.ts` requires the variable, so the web app does not start without a key even in an environment that shows no map.
- A referrer restriction that misses a domain shows the map greyed out with the error in the browser console.
