# Debt — Full review of the public website (`apps/web`)

> Review: [261121-review-web.md](../261121-review-web.md)
> Scope: `apps/web` · Created 2026-11-21 at 03:10 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

Every point below existed before the review.

## Table of contents

- [Summary](#summary)
- [1. Failed lookups are cached for minutes or hours](#1-failed-lookups-are-cached-for-minutes-or-hours)
- [2. Site search is heavy and has no limit](#2-site-search-is-heavy-and-has-no-limit)
- [3. Unsubscribe happens as soon as the link is opened](#3-unsubscribe-happens-as-soon-as-the-link-is-opened)
- [4. Counters and newsletter actions have no per-visitor limit](#4-counters-and-newsletter-actions-have-no-per-visitor-limit)
- [5. No Content Security Policy and CORS open to every site](#5-no-content-security-policy-and-cors-open-to-every-site)
- [6. Query files marked use server expose every export](#6-query-files-marked-use-server-expose-every-export)
- [7. Dead code left in the app](#7-dead-code-left-in-the-app)
- [8. Documentation out of date or misplaced](#8-documentation-out-of-date-or-misplaced)
- [9. Test and accessibility coverage gaps](#9-test-and-accessibility-coverage-gaps)
- [10. A required variable serves no live code](#10-a-required-variable-serves-no-live-code)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Medium | Bug | A failed query is cached, so a project or article answers "not found" for up to an hour | ⏳ to do |
| 2 | 🟡 Medium | Hole | The site search has no limit and scans the full text of every article and project | ⏳ to do |
| 3 | 🟡 Medium | Bug | The unsubscribe link unsubscribes on a plain visit, so mail scanners unsubscribe readers | ⏳ to do |
| 4 | 🟡 Low | Hole | Counters and newsletter server actions can be called without limit | ⏳ to do |
| 5 | 🟡 Low | Hole | No `Content-Security-Policy`, CORS open to every origin | ⏳ to do |
| 6 | 🟡 Low | Hole | `use server` at the top of the query files makes every export a possible public entry point (to verify) | ⏳ to do |
| 7 | 🟡 Low | Maintenance | About 12 unused files and 30 unused helpers | ⏳ to do |
| 8 | 🟡 Low | Docs | `apps/web/CLAUDE.md` is out of date, two notes sit outside `docs/` | ⏳ to do |
| 9 | 🟡 Low | Tests | No unit tests, no story for any container, accessibility gate on `todo` | ⏳ to do |
| 10 | 🟡 Low | Maintenance | `REST_API_KEY` is required but only dead code reads it | ⏳ to do |

## 1. Failed lookups are cached for minutes or hours

- **Severity**: 🟡 Medium · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/web/server/queries/article.queries.ts`, `project.queries.ts`, `page.queries.ts`, `category.queries.ts`, `app.queries.ts`; the pages that call them

**What can happen** — The API server restarts or answers slowly while a visitor opens
`/fr/projets/<slug>`. `getProject` catches the error and *returns* `{ error }`. Because the function is
marked `'use cache'` (`cacheLife('hours')`), that failure is stored like a real answer. `getCachedProject`
turns it into `null`, the page calls `notFound()`, and every visitor gets a 404 for that project until the
entry expires, even though the API is back a second later. The lists do the same for minutes
(`getArticles`, `getProjects`: `{ error }` is cached, then `ProjectsData` throws it).

**Why** — In a `'use cache'` function, only a thrown error is not stored. The functions were written to
return `IServerResponse` objects, which the cache cannot tell from a success.

**How to check** — Stop the server, open a project page that is not yet in the cache, start the server
again, reload within the hour: the page is still a 404. In dev, log inside `getProject`'s `catch` to see
that the second request does not reach it.

**How to fix**

1. **(recommended)** Let the error propagate out of the cached function and catch it one level up, in a
   small uncached wrapper (`getProject` → throws; the page catches and decides 404 or error boundary).
   *Why*: it is the documented way not to cache a failure, it keeps one source of truth, and the pages
   already know how to show an error (`error.tsx` exists on the listing and detail routes). It means
   touching the callers of about 20 functions, one by one.
2. Keep the `{ error }` shape but give a failed answer a very short cache life. Smaller change, but to be
   checked first: it is not certain that the cache life can be chosen after the call has run.
3. Remove `'use cache'` from the detail pages and rely on the tag revalidation only. Simple, but every
   visit hits the API again.

## 2. Site search is heavy and has no limit

- **Severity**: 🟡 Medium · **Type**: Hole / Performance · **Status**: ⏳ to do
- **Concerned**: `apps/web/server/mutations/search.mutation.ts`, `apps/web/hooks/useSiteSearch.ts`

**What can happen** — `searchData` is a public server action. For every search it builds, per collection
(`Article`, `Project`), a query that ORs a case-insensitive, unanchored regex over `title`, `tags`,
`description` and `content` for each language (up to 16 text scans), and fetches whole documents (no
`select`). A script that posts searches in a loop costs the database a full scan each time, and nothing
stops it: the forms have a per-visitor limit, the search has none.

**Why** — Regex matches on a text field cannot use an index. The search was written without the limit
used by the forms (`createVisitorRateLimit`) and the client checks only the length of the text. The
server accepts 2 letters while the client sends 3 (`MIN_SEARCH_LENGTH`).

**How to check** — Call `searchData` 100 times in a row with different words and watch the database
load; or read the Mongo profiler for the `$or` of `matches`.

**How to fix**

1. **(recommended)** Add a per-visitor limit with the existing helper (`createVisitorRateLimit`, same
   file family as `formRateLimit.server.ts`, for example 30 searches per minute), align the server
   minimum with the client (3), and add a `.select` limited to `translated.<locale>.title`, `slug`.
   *Why*: three small changes, no new infrastructure, the cost and security gain is immediate.
2. Replace the regex scan by a Mongo text index on the translated fields and a `$text` query. Faster and
   ranked, but it needs a schema decision (index per language) and a server change, so it is a task of
   its own.
3. Drop the search from the public site. Removes the risk, removes a feature.

## 3. Unsubscribe happens as soon as the link is opened

- **Severity**: 🟡 Medium · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/web/app/[locale]/newsletter/[encryptedEmail]/unsubscribe/page.tsx`, `apps/server/src/cloud/functions/_core/app.functions.ts` (`unsubscribeNewsletter`)

**What can happen** — A reader receives a newsletter. Their mail provider (or a corporate security
scanner) opens every link of the message to check it. The page renders, calls `unsubscribeNewsletter`,
the row is set to `active: false` and the "you are unsubscribed" e-mail is sent. The reader never chose
to leave. A malformed link also makes the page throw (the `decrypt` fails inside the render), showing
the generic error page instead of "not found".

**Why** — The state change is done while rendering a page that is reached by `GET`. The same page then
offers a "resubscribe" button, so the product already treats the unsubscribe as undoable.

**How to check** — `curl` the unsubscribe URL of a test address, then look at the `Newsletter` row.

**How to fix**

1. **(recommended)** The page only checks that the link is valid (a new read-only function, or
   `unsubscribeNewsletter` with a `dryRun`), shows a "Confirm the unsubscribe" button, and the button
   calls the existing function through a server action. Catch the decrypt error and call `notFound()`.
   *Why*: it is what the mail providers recommend for one-click flows and it removes the surprise;
   cost: one click more for a real reader, a server change and a small page change, both apps.
2. Keep the immediate unsubscribe but ignore known scanners (user agents). Fragile: scanners change.
3. Keep it as it is and accept the false unsubscribes. The resubscribe button limits the damage, but
   the reader is not told why they stopped receiving mail.

## 4. Counters and newsletter actions have no per-visitor limit

- **Severity**: 🟡 Low · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/web/server/mutations/app.mutation.ts` (`incrementShareCountBySocial`, `incrementArticleViewCount`), `apps/web/server/mutations/newsletter.mutation.ts` (`resubscribeToNewsletter`, `addReasonToUnsubscribeToTheNewsletter`), `apps/web/containers/articles/ArticleViewTracker.tsx`

**What can happen** — The "once per session" of the view counter lives only in the browser
(`sessionStorage`). A script calls `incrementArticleViewCount` with a published article id in a loop and
the view count grows without bound; the same for the share counters (the server accepts only articles
and pages and a fixed list of networks, so nothing else can be written). The newsletter actions need a
valid encrypted address, so the risk is small; they could be replayed.

**Why** — Only the contact and subscribe actions call `assertNotLimited`.

**How to check** — Call the action 50 times with the same id and read `views` on the article.

**How to fix**

1. **(recommended)** Give the counters and the newsletter actions their own `createVisitorRateLimit`
   (for example 60 per hour for the view counter, 30 for the shares, 10 for the newsletter actions) in
   `formRateLimit.server.ts`, and a `assert…Allowed` for each. *Why*: same pattern as the forms, no
   server change, bounded cost.
2. Move the "once per visitor" to the server, with a short-lived key per address and article in Redis.
   Exact, but more infrastructure for a vanity number.
3. Accept it: the numbers are not used for anything but display. Cheapest, but the figure is not
   trustworthy.

## 5. No Content Security Policy and CORS open to every site

- **Severity**: 🟡 Low · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/web/next.config.mjs` (`headers`), `apps/web/server.js` (`app.use(cors())`)

**What can happen** — The site sends `nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS, but no
`Content-Security-Policy`. If a script ever gets onto a page (a compromised third-party, rich text from the
back-office), the browser does not stop it. The Express wrapper also answers every request, including the
routes of the website, with `Access-Control-Allow-Origin: *`.

**Why** — The policy needs the exact list of what the site loads (Google reCAPTCHA, Google Analytics,
Sentry, Cloudinary images, fonts) and was never written; `cors()` was added for the local API ping.

**How to check** — `curl -I` the home page and look for the header; send a request with an `Origin`
header to `/en/blog` and read the response.

**How to fix**

1. **(recommended)** Add a `Content-Security-Policy-Report-Only` header first (with the allowed hosts and
   a nonce for the inline scripts of Next.js), watch Sentry for a week, then switch it to enforcing;
   restrict `cors()` to the `/api/ping` route. *Why*: report-only shows what would break with no risk
   for visitors; it needs manual testing in a browser, which is why it was not done in the review.
2. Add an enforcing policy straight away. Faster, but a missed host breaks reCAPTCHA or analytics.
3. Leave it. The editors are trusted and the rich text is rendered by a parser, but there is no second line of defense.

## 6. Query files marked use server expose every export

- **Severity**: 🟡 Low · **Type**: Hole (to verify) · **Status**: ⏳ to do
- **Concerned**: `apps/web/server/queries/article.queries.ts`, `project.queries.ts`; `apps/web/server/mutations/app.mutation.ts` (`saveUserLanguage`)

**What can happen** — A `'use server'` file turns every exported async function into a server function
that a browser can call by POST once it has the identifier. Next.js only keeps the ones a client
component reaches, so today the query functions are probably not callable. If one day a client
component imports one of them, `getArticles`/`getProjects` would accept a `limit` of any size from the
caller. `saveUserLanguage` is exported and used nowhere.

**Why** — The directive was put at the top of files that are only read by server components, where it is
not needed (`'use cache'` is enough and is set per function).

**How to check** — In a production build, read `.next/server/server-reference-manifest.json` and look for
the query functions.

**How to fix**

1. **(recommended)** Remove the file-level `'use server'` from the two query files (queries are not
   actions) and delete `saveUserLanguage` until the login exists. Check that the build and the pages still
   work. *Why*: smallest surface, and the directive stops lying about what the files are.
2. Keep the directive and cap `limit` inside the functions. Protects the value, not the exposure.

## 7. Dead code left in the app

- **Severity**: 🟡 Low · **Type**: Maintenance · **Status**: ⏳ to do
- **Concerned**: `apps/web/components`, `hooks`, `utils`, `server`

**What can happen** — Nothing breaks, but each future reader pays for it and the project rule "no
orphaned code" is not met. Unused outside their own file, found by searching every import:

- Components: `components/animation/CountUp.tsx`, `components/animation/RevealOnView.tsx`,
  `components/Avatar.tsx`, `components/DropdownMenu.tsx` (and the `ui/DropdownMenu.tsx` it alone uses),
  `components/forms/fields/CheckboxField.tsx`, `components/IntlMessage.tsx`, `components/UnknownError.tsx`,
  `components/ui/Badge.tsx`, `components/ui/Command.tsx`, `components/ui/Popover.tsx`.
- Hooks: `hooks/useDevice.ts`, `hooks/useRevealOnView.ts`.
- `utils/file.utils.ts` (650 lines of upload helpers copied from the back-office, only the MIME helpers
  are used) and `config/http.ts` that only that file imports.
- Helpers: `setValue`, `setValues`, `setFormDataValues`, `createMockParseObject` in `parse.utils.ts`;
  `formatRideDay`, `formatRideTime` in `date.utils.ts` (words of another project); `mergeHeaders`,
  `getLocaleByPathname`, `getAllTranslatedUrls` in `next.utils.ts`; `goToArticlesByCategory`;
  `getNameInitials`; `isCleanedString`, `isServerActionLoading`, `hasServerActionFailed`, `unSlugify`,
  `getAnimationProps`, `unwrapParagraphs` in `utils.ts`; `getPaginatedPages`, `getExistingPageSlugs`;
  the constants `DISABLE_USER_ACCOUNT_CONFIRMATION`, `EMAIL`, `PHONE`, `OPTIMIZED_IMAGE_HOSTNAMES`; and
  about 40 exported types.

**Why** — The app was started from another project and from a template; the rest was never removed.

**How to check** — `pnpm nx run web:depcheck` for packages, and a search of each name above.

**How to fix**

1. **(recommended)** Delete in one change, group by group, running the type check and the lint after each
   group (a few of them may be used by a story or a dynamic import; the search included `stories/`).
   *Why*: git keeps the history, and `engineering-principles.md` asks for it.
2. Move the ones that are kept "for later" to `docs/code/todo/` and delete the rest. Only if one of them is genuinely planned.

## 8. Documentation out of date or misplaced

- **Severity**: 🟡 Low · **Type**: Docs · **Status**: ⏳ to do
- **Concerned**: `apps/web/CLAUDE.md`, `apps/web/docs/NOTE.md`, `apps/web/docs/Upgrade.md`

**What can happen** — A new developer follows the wrong map:

- `apps/web/CLAUDE.md` lists a `download-cv` route handler in `app/api/` (the CV is downloaded from the
  API server, `/download/cv.pdf`) and says translations exist in `en, fr, mg` (the website has `fr` and
  `en` only).
- `apps/web/docs/NOTE.md` and `Upgrade.md` live inside the app, where the project rules want no
  documents, are not in `docs/`, have no table of contents, and `NOTE.md` holds old hosting URLs and
  notes on `next-auth` that the website no longer uses.

**Why** — Written before the routes and the locales were reduced.

**How to check** — `ls apps/web/app/api` and `apps/web/translations`.

**How to fix**

1. **(recommended)** Correct `apps/web/CLAUDE.md` (route list, locales), move what is still true of
   `NOTE.md` and `Upgrade.md` into `docs/code/` (English and French twins with a table of contents) and
   delete the originals. *Why*: one place for documents, and the twins check covers them.
2. Delete both notes without moving anything. Quicker, but the upgrade notes may still help.

## 9. Test and accessibility coverage gaps

- **Severity**: 🟡 Low · **Type**: Tests · **Status**: ⏳ to do
- **Concerned**: `apps/web/stories`, `apps/web/vitest.config.ts`, `apps/web/.storybook/preview.tsx`

**What can happen** — A change to a pure function (pagination, slugs, JSON-LD, translated fields, cards
for link previews) or to a container is not caught. The only tests are Storybook stories: 18 story files
for 86 components and 77 containers, none for a container. The accessibility check runs with
`test: 'todo'`, so it reports without failing. The five fixes of the review have no test because there is
no place to put one.

**Why** — The only Vitest project is `storybook`.

**How to check** — `find apps/web -name "*.test.*"` finds nothing.

**How to fix**

1. **(recommended)** Add a second Vitest project (`unit`, Node environment) for the pure functions of
   `utils/` and `validations/`, starting with the five of the review, as its own task
   (`engineering-principles.md` asks not to invent a runner inside an unrelated task). Then add stories for
   the props-only containers (cards, forms) and clear the accessibility debt rule by rule before moving
   `test` to `'error'`. *Why*: pure functions are the cheapest and most valuable tests here.
2. Only extend the stories. Covers rendering, not logic.

## 10. A required variable serves no live code

- **Severity**: 🟡 Low · **Type**: Maintenance · **Status**: ⏳ to do
- **Concerned**: `apps/web/env.ts`, `apps/web/.env.example`, `apps/web/config/http.ts`, `apps/web/.storybook/storybook-env.ts`, `docs/inventory/README.md`

**What can happen** — `REST_API_KEY` must be set for the website to start (`z.string()`), but the only
reader is `config/http.ts`, which only the dead `file.utils.ts` imports. A new environment is asked for a
value that does nothing, and the value is a key of the server.

**Why** — Left over from the code that uploaded files directly to the server (see point 7).

**How to check** — Search `REST_API_KEY` in `apps/web` outside `env.ts`.

**How to fix**

1. **(recommended)** After point 7, remove the variable from `env.ts`, `.env.example`,
   `.storybook/storybook-env.ts` and from the inventory table, and tell the people who deploy the site that
   the variable can be dropped. *Why*: one secret less to carry, and the inventory rule asks for the update
   in the same change.
2. Make it `optional()` and keep it. Removes the failure at start, keeps a useless variable.
