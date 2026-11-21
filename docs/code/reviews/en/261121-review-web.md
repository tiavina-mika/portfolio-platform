# Review — Full review of the public website (`apps/web`)

- **Scope**: the whole `apps/web` app as it stands on `feat/aldaron-web-prototype` (no diff: every file was read or searched, the code of `apps/server` was read only where the website calls it)
- **Type**: Full app review (state of the code, risks, small fixes)
- **Author**: Tiavina Michael Ralainirina — `tiavinamika@gmail.com` *(GitHub: `tiavina-mika`)*
- **Created**: 2026-11-21 at 03:10
- **Apps touched**: Website (fixes only); Server and Back-office read, not changed

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Website](#website)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

This is a review of the whole portfolio website, not of one branch. The website is in good shape:
the type check and the lint pass, every translation key exists in French and English
(`pnpm check-i18n`), the forms are protected by reCAPTCHA and a per-visitor limit, and the content a
visitor can see is always filtered on *active*, *not deleted* and *belongs to the portfolio*.

The review looked on purpose for what could go wrong. It found **five small risks, fixed during the
review** (a title written in the back-office could break out of the page's search-engine data; the
projects list could be sorted by any field named in the address; the cache-refresh route compared its
secret in a way that can leak it and failed on a bad request; `?page=-3` showed an error page; the site
search crashed when a result was only written in the other language), and **ten points left for later**,
the most important being that a failed request is remembered by the cache for up to an hour, that the
search and the unsubscribe link have no protection against automatic traffic, and that about 12 files
and 30 helpers are no longer used. They are in the [debt file](debt/261121-review-debt-web.md).

Nobody has to reinstall anything, and no environment variable changed.

## Database

No database change: no new class, field or index. What the website reads and writes today:

| Class | Read or written | Fields used | What it is for |
|---|---|---|---|
| `Article` | read; counters written through the server | `translated`, `categories`, `previewImage`, `image`, `images`, `user`, `active`, `deleted`, `websites`, `country`, `views`, `shares`, `hasTableOfContents` | blog list and reading page, related articles, sitemap |
| `Project` | read | `translated`, `previewImage`, `image`, `technologies`, `society`, `dateStart`, `active`, `deleted` | projects list and detail |
| `Category` | read | `translated`, `entity`, `image`, `parentCategory`, `hasSubcategories`, `websites` | article filters, nested page categories (3 levels) |
| `Page`, `PageSection` | read | `translated`, `active`, `deleted`, `websites`, the link positions | content pages, menus, footer |
| `App` | read | the first row, `createdAt` order | site-wide settings |
| `Contact`, `Newsletter` | written only through Cloud Functions | — | contact form, newsletter subscription |

Cloud Functions the website calls (all on the server): `createPublicContact`, `subscribeToNewsletter`,
`confirmNewsletterSubscription`, `resubscribeNewsletter`, `unsubscribeNewsletter`,
`addReasonToUnsubscribeToTheNewsletter`, `getArticleForClient`, `getProjectForClient`,
`incrementArticleViewCount`, `incrementShareCount`, and `saveUserLanguage` (exported but not called
anywhere yet).

Queries are filtered with `active = true`, `deleted = false` and the *portfolio* website constraint
(rows saved before the `websites` field existed are kept). The website talks to Parse with no session
and no master key, so every write goes through a Cloud Function.

## Website

- **Pages touched** (fixes only): all pages that carry search-engine data (home, blog, project, content
  pages), the projects list, every list with pagination, the site search, the cache-refresh route.
- Nothing changes visually for a visitor who follows the normal links.

The pages of the app, with their local URL (French first, English in the second column):

| Page | French | English |
|---|---|---|
| Home | `http://localhost:9012/fr` | `http://localhost:9012/en` |
| Projects | `/fr/projets` | `/en/projects` |
| A project | `/fr/projets/<slug>` | `/en/projects/<slug>` — slug of any active project |
| Blog | `/fr/blog` | `/en/blog` |
| An article | `/fr/blog/<slug>` | `/en/blog/<slug>` — slug of any active article |
| Contact | `/fr/contact` | `/en/contact` |
| Site map | `/fr/plan-du-site` | `/en/sitemap` |
| Content page | `/fr/<slug>` | `/en/<slug>` — slug of any active page |
| Page category | `/fr/<slug>/<subcategory>[/<subsubcategory>]` | same |
| Unsubscribe | `/fr/newsletter/<encrypted email>/se-desabonner` | `/en/newsletter/<encrypted email>/unsubscribe` |
| Confirm subscription | `/fr/newsletter/confirmer/<token>` | `/en/newsletter/confirm/<token>` |
| Share card image | `/api/og?title=…` | same |
| Cache refresh (server to server) | `POST /api/revalidate` with the `x-revalidate-secret` header | same |

Old paths `/articles`, `/contact-me` and `/contactez-moi` redirect to `/blog` and `/contact`.
The user-facing description of each page is in [docs/features/web](../../../features/web/README.md).

## See the result locally

```bash
pnpm install
pnpm nx run server:dev   # API on http://localhost:8089
pnpm nx run web:dev      # website on http://localhost:9012
pnpm nx run web:sb       # Storybook on http://localhost:6016
```

Checks that were run for this review:

- `pnpm nx run web:typecheck`: passes.
- `pnpm nx run web:lint:check`: passes.
- `pnpm check-i18n`: passes.
- `pnpm nx run web:test-storybook`: **not run** (needs Playwright and a long browser session).

To see the five fixes:

- **Search-engine data**: open any article and view the page source, the `application/ld+json` block never contains a raw `<`.
- **Projects sort**: `http://localhost:9012/fr/projets?orderedBy=updatedAt` sorts; `?orderedBy=anyOtherField` is ignored and shows the default order.
- **Negative page**: `http://localhost:9012/fr/blog?page=-3` shows the first page instead of an error.
- **Search**: type three letters of a word that only appears in the English text of an article while the site is in French; the result is listed instead of an error.
- **Cache refresh**: `curl -X POST http://localhost:9012/api/revalidate -H "x-revalidate-secret: wrong"` answers 401; a wrong body with the right secret answers 400, not 500.

Storybook (18 story files, no story file for any container): `http://localhost:6016/?path=/docs/components-alert--docs`
and the other groups `App`, `Components/Button`, `Components/Footer`, `Components/Forms`, `Components/Icon`,
`Components/IconButton`, `Components/NavBar`, `Components/Scrollable`, `Components/TableOfContents`,
`Components/Typography`. No story was changed by this review.

## Possible bugs, regressions and holes

Worst first. Everything found existed before this review.

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟡 Medium | Bug | A short outage of the API is remembered by the cache: the project or article page answers "not found" for up to an hour, a list shows its error for minutes | each time the API is unreachable during a render | ⏳ deferred — [debt #1](debt/261121-review-debt-web.md#1-failed-lookups-are-cached-for-minutes-or-hours) |
| 🟡 Medium | Hole / Performance | The site search has no limit per visitor and runs up to 16 text scans over the full content of every article and project for each search | a script (or a fast typist) calling the search | ⏳ deferred — [debt #2](debt/261121-review-debt-web.md#2-site-search-is-heavy-and-has-no-limit) |
| 🟡 Medium | Bug | Opening the unsubscribe link unsubscribes at once and sends an e-mail: a mail scanner that opens links unsubscribes the reader | the reader's mail provider scans links | ⏳ deferred — [debt #3](debt/261121-review-debt-web.md#3-unsubscribe-happens-as-soon-as-the-link-is-opened) |
| 🟡 Medium | Hole | Content written in the back-office could close the page's `<script>` block of search-engine data and run as HTML | an editor writes `</script>` in a title or description | ✅ fixed — the `<` is now written as `<` in the block |
| 🟡 Medium | Hole | The projects list passed the `orderedBy` of the address straight to the database: any field of the class could be used as a sort, which tells a visitor about fields they cannot read | a crafted address `?orderedBy=<field>` | ✅ fixed — only `dateStart`, `createdAt`, `updatedAt` and `title` are accepted, anything else uses the default sort |
| 🟡 Medium | Bug | The site search threw when a result was matched in one language but not written in the current one, so the whole search showed an error | an article or project translated in one language only | ✅ fixed — the title falls back to the default language, and the helper no longer fails when the default language is missing too |
| 🟡 Low | Hole | The cache-refresh secret was compared with `!==` (timing leak), a body that is not JSON answered 500, and a non-text tag was passed on | a guessed or malformed request | ✅ fixed — constant-time comparison, 400 on a bad body or tag |
| 🟡 Low | Bug | `?page=-3` gave a negative skip to the database and showed the error page | an old or hand-written link | ✅ fixed — pages below 1 count as the first page |
| 🟡 Low | Hole | View counter, share counter and the newsletter actions (resubscribe, reason) can be called by anyone, with no per-visitor limit | a script | ⏳ deferred — [debt #4](debt/261121-review-debt-web.md#4-counters-and-newsletter-actions-have-no-per-visitor-limit) |
| 🟡 Low | Hole | No `Content-Security-Policy` header, and the custom server answers every origin with CORS | any injected script would not be stopped by the browser | ⏳ deferred — [debt #5](debt/261121-review-debt-web.md#5-no-content-security-policy-and-cors-open-to-every-site) |
| 🟡 Low | Hole | Query files start with `use server`: every export can become a public entry point, and `getArticles` / `getProjects` take a `limit` from the caller | to verify in a production build | ⏳ deferred — [debt #6](debt/261121-review-debt-web.md#6-query-files-marked-use-server-expose-every-export) |
| 🟡 Low | Maintenance | Unused files and helpers, among them a 650-line upload helper copied from the back-office | any future reader | ⏳ deferred — [debt #7](debt/261121-review-debt-web.md#7-dead-code-left-in-the-app) |
| 🟡 Low | Docs | `apps/web/CLAUDE.md` describes a route and a language that do not exist; two notes live outside `docs/` | any future reader | ⏳ deferred — [debt #8](debt/261121-review-debt-web.md#8-documentation-out-of-date-or-misplaced) |
| 🟡 Low | Tests | 77 containers and the server queries have no test, the accessibility check only warns | any change | ⏳ deferred — [debt #9](debt/261121-review-debt-web.md#9-test-and-accessibility-coverage-gaps) |
| 🟡 Low | Maintenance | `REST_API_KEY` is required to start the site but only dead code reads it | a new environment | ⏳ deferred — [debt #10](debt/261121-review-debt-web.md#10-a-required-variable-serves-no-live-code) |

Regressions checked for the fixes: `getPaginatedQuery` (used by the blog, projects and home lists, a
page below 1 now counts as 1), `getTranslatedField` (used by every page, only less likely to throw),
`projectSearchParamsSchema` (used by the projects page only), `JsonLd` (used by every page with
structured data) and `searchData` (used by the desktop and mobile search). No caller relies on the old
behavior. There is no unit test runner in the website (only Storybook tests), so the fixes were checked
by the type check, the lint and the steps above, not by a new test: adding a Vitest project for pure
functions is proposed in [debt #9](debt/261121-review-debt-web.md#9-test-and-accessibility-coverage-gaps).

The ten deferred points are detailed, with how to fix each one, in the
[debt file](debt/261121-review-debt-web.md).

## What is left to do

- The ten points of the [debt file](debt/261121-review-debt-web.md).
- The Storybook browser tests (`pnpm nx run web:test-storybook`) were not run in this review.
- No manual test in a browser was done: the visual behavior of the fixes was checked by reading the code.
