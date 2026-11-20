# Debt — Aldaron website prototype

> Review: [261121-feat-aldaron-web-prototype.md](../261121-feat-aldaron-web-prototype.md)
> Branch: `feat/aldaron-web-prototype` · Created 2026-11-21 at 02:32 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Legal and privacy pages still hold placeholders](#1-legal-and-privacy-pages-still-hold-placeholders)
- [2. Attachments are offered but never sent](#2-attachments-are-offered-but-never-sent)
- [3. The aldaron-web build and tests are not run by the CI](#3-the-aldaron-web-build-and-tests-are-not-run-by-the-ci)
- [4. Silent fallback rates and unchecked stored rates](#4-silent-fallback-rates-and-unchecked-stored-rates)
- [5. Sample projects are presented as delivered work](#5-sample-projects-are-presented-as-delivered-work)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🔴 High | Hole | Legal notice and privacy policy published with `[à compléter]` placeholders — ⛔ blocks the release to production | ⏳ to do |
| 2 | 🟡 Low | Bug | The contact form takes files that are never sent, without telling the visitor | ⏳ product decision |
| 3 | 🟡 Low | Regression | The production prerender and the story tests of `aldaron-web` are checked by nobody before a deploy | ⏳ to do |
| 4 | 🟡 Low | Bug | Fixed fallback currency rates used silently; stored rates read back unchecked | ⏳ to do |
| 5 | 🟡 Low | Bug | Sample projects shown as delivered work | ⏳ product decision |

## 1. Legal and privacy pages still hold placeholders

- **Severity**: 🔴 High · **Type**: Hole · **Status**: ⏳ to do — ⛔ blocks the release to production (not the merge into `develop`)
- **Concerned**: `apps/aldaron-web/translations/{fr,en,mg}/legal.json`, `apps/aldaron-web/translations/{fr,en,mg}/privacy.json`, `docs/features/aldaron-web/legal/fr/`

**What can happen** — the site goes live. `/fr/mentions-legales` shows "Forme juridique et capital : [à compléter]", "NIF/STAT : [à compléter]", "Siège social", "Directeur de la publication", "Hébergeur" and a "Dernière mise à jour : [à compléter]". `/fr/confidentialite` shows no retention period, no recipients and no cookies section, while the contact form asks the visitor to consent to that very text. Both pages are in the sitemap, so they are indexed in this state.

**Why** — the texts were written as a skeleton: the facts only the company owner knows were left as placeholders. Not a code defect, but the code publishes them as they are. The cookies section is a real obligation, not filler: the site loads Google Analytics 4 and a consent banner when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, so the text must name that tool and the `cookie_consent` cookie.

**How to check** — open both pages in each language and search for `[`.

**How to fix**

1. **(recommended)** Fill the texts with the real company information, then add a guard so it cannot happen again: a test (or a `check-i18n`-style script) that fails when a `translations/**/legal.json` or `privacy.json` value contains `[à compléter]`, `[to be completed]` or `[ampidirina]`.
   *Why*: the legal content is required for a public French/Malagasy business site and only the owner can supply it; the guard costs a few lines and stops a placeholder reaching production again.
2. Fill the texts by hand with no guard — faster, but the next new language or edit can reintroduce a placeholder unnoticed.
3. Mark both pages `noindex` and hide the footer links until filled — hides the problem without solving it, and the contact form still links to the privacy text.

## 2. Attachments are offered but never sent

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ product decision
- **Concerned**: `apps/aldaron-web/containers/contact/ContactForm.tsx`, `ContactFiles.tsx`, `utils/contact.utils.ts` (`composeQuoteMessage`, `addQuoteFiles`), `translations/*/contact.json`, `translations/*/privacy.json`

**What can happen** — a visitor attaches a specification PDF, sends the form, sees the confirmation and waits for an answer from someone who never got the file. The team only sees "Attachments (names only, the files were not received)" in the message. The privacy text also lists "attachments" as data received. The limitation is written in the feature doc for the contact page, but nowhere the visitor can see it.

**Why** — the `Contact` class has no file field and `createPublicContact` takes none; the form was built to the prototype, which has the picker.

**How to check** — in [the contact story](http://localhost:6017/?path=/story/containers-contact-contactformcontent--empty) or the page, add a file and send: the request arrives with the file name in the message only.

**How to fix**

1. **(recommended)** Hide the file picker until uploads exist, and remove "attachments" from the privacy text (and its twin in the feature docs).
   *Why*: it removes the false promise with the smallest change, no new server surface (a public upload endpoint needs size limits, a malware scan and storage — a project of its own), and the visitor can still describe the need in the text fields or reply to the first e-mail with the file.
2. Keep the picker and add a visible line under it: "Files are not sent yet — send them by e-mail to contact@aldaron.eu" (new key in `fr`/`en`/`mg`). Honest, but shows a control that does not do its job.
3. Build the upload: a Cloud Function taking the file (checked type and size, rate limit, reCAPTCHA), a `Parse.File` linked to the `Contact`, and the file shown in the back-office contact page. Right long-term answer, largest change (server + back-office + site).

## 3. The aldaron-web build and tests are not run by the CI

- **Severity**: 🟡 Low · **Type**: Regression · **Status**: ⏳ to do
- **Concerned**: `.github/workflows/ci.yml` (`--exclude=web,aldaron-web` on the build and `--exclude=server,web,aldaron-web` on the tests), `apps/aldaron-web`

**What can happen** — a change breaks the production prerender (`cacheComponents` rejects a page reading the request outside a cached scope, as happened to the loading states of about, legal, privacy and projects during this branch) and nobody sees it until a deploy fails. The typecheck, which does run, cannot detect it. The 31 story files added by the branch are never run as browser tests either.

**Why** — the build is left out on purpose: `next build` prerenders the pages and reads live content from Parse, which no runner can reach. The reason is valid for the pages that read the database; the static prototype pages do not.

**How to check** — run `pnpm nx run aldaron-web:build` locally with the network available (the fonts are downloaded at build time) and compare with what the CI covers.

**How to fix**

1. **(recommended)** Run the build in the CI with the content queries answering from a stub when no Parse server is reachable (an env flag read by `getDataForUrls` and the other queries), and run `aldaron-web:test-storybook` in the same job as `web`'s.
   *Why*: the site is mostly static now, so the build is the only check that catches prerender errors; a stub keeps the CI free of a live server.
2. Add a manual "pre-deploy" step in the release checklist that runs the build — cheap, but depends on someone remembering.
3. Un-exclude the build and give the runner access to a staging Parse API — exact result, but ties the CI to a live service and its secrets.

## 4. Silent fallback rates and unchecked stored rates

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/aldaron-web/providers/CurrencyProvider.tsx`, `utils/currency.utils.ts` (`fetchRates`, `readRates`), `utils/constants.ts` (`FALLBACK_RATES`)

**What can happen** — both services are unreachable (blocked network, outage): the visitor who picked ariary sees prices computed at a fixed `4900` Ar per euro with no hint that they may be off. Separately, the stored rates are `JSON.parse`d and used without checking the types, and a response is not checked as an HTTP success: a stored `{ "USD": "x" }` or an API answering a string makes the prices read `NaN`.

**Why** — the fallback was designed to keep the page working; the failure is not surfaced. The prices are indicative and the euro price is the reference (the pages say so), which is why this is low.

**How to check** — in the browser, block `open.er-api.com` and `cdn.jsdelivr.net`, pick ariary, and read a price; or set `localStorage['aldaron-rates']` to `{"savedAt":<now>,"USD":"a","MGA":null}` and reload.

**How to fix**

1. **(recommended)** Validate in one place: a `isValidRate` check (finite number above zero) used by both `readRates` and `readStoredRates`, a `response.ok` check in `fetchRates`, and a short "indicative rate" note shown next to the selector only while the fallback rates are in use. Add the unit tests (`convertPrices` / `readRates` with bad input).
   *Why*: small and local, removes the `NaN` price, and tells the visitor the truth in the only case it matters.
2. Validate only (no note) — fixes the `NaN`, leaves the silent fixed rates.
3. Fetch the rates on the server through a cached route — one call for all visitors, no IP sent to a third party (it also answers part of the privacy topic), but adds a server route and a cache to maintain.

## 5. Sample projects are presented as delivered work

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ product decision
- **Concerned**: `apps/aldaron-web/utils/project.constants.ts`, `utils/home.constants.ts`, `translations/*/projects.json`, `translations/*/home.json`, `docs/features/aldaron-web/projects/fr/PROJECTS.FR.md`

**What can happen** — the projects page and the home block show ten products ("Tsara Livraison", "Fanilo Santé"…) with delays and prices as delivered work, with a striped placeholder instead of a screenshot. A prospect or a consumer-protection check reads them as references that do not exist.

**Why** — the prototype is a design: the data is a placeholder kept in the code. The feature doc says "sample data"; the page does not.

**How to check** — open `/fr/projets`.

**How to fix**

1. **(recommended)** Before the site is public, replace the sample data with the real delivered projects (or remove the projects page and the home block until there are some), and keep one line on the page if some stay as illustrative examples: "Illustrative examples".
   *Why*: a reference list is a commercial claim; showing invented clients is the one thing that harms trust and can be a legal problem, and the real data costs only content.
2. Keep the samples and label them "Examples" on the page and the home block — honest and quick, but weak as a sales page.
3. Read the projects from the back-office (the `Project` collection the portfolio already has) — the long-term answer, but it needs a mapping between the two shapes and a decision on which projects are shown on this site.
