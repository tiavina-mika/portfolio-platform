# ADR 003 - Next.js for the public site, a Vite single-page app for the back-office

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Consequences](#consequences)

**Status**: Accepted (recorded from the code)

## Context

The public site is read by visitors and search engines: it needs server rendering, per-locale URLs, metadata and a sitemap. The back-office is used by logged-in users behind a login: it needs a rich interface, not indexing.

## Decision

- `apps/web` is a [Next.js](https://nextjs.org) app (App Router) with next-intl for locale-prefixed routes, Tailwind CSS and shadcn/ui. Pages and queries run on the server and read Parse through `parse/node`; writes are `next-safe-action` server actions. It has no login and no Redux.
- `apps/bo` is a [Vite](https://vite.dev) React single-page app with Material UI, TanStack Router and Redux Toolkit, talking to Parse from the browser. Its build is copied into `apps/server/clientBuild/bo/<env>` and served by Express, so the back-office and the API share one origin and one deployment.

## Consequences

- The website can be indexed and shared (sitemap, Open Graph, per-locale slugs); its build needs a reachable Parse server because pages are prerendered from the CMS.
- The back-office needs no Node runtime of its own, but every back-office release goes through the copy step of the server, and `VITE_*` values are in the public bundle.
- Two UI stacks coexist, so a component is written once per client; only logic and constants are shared through `libs/`.
