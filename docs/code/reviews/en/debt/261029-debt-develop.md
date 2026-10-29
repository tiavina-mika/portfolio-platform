# Debt — Monorepo consolidation, shared libraries and bug fixes (`develop`)

> Review: [261029-develop.md](../261029-develop.md)
> Branch: `develop` · Created 2026-10-29 at 13:33 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Plural texts always shown in the singular](#1-plural-texts-always-shown-in-the-singular)
- [2. Publishing a page section checks a different right than editing it](#2-publishing-a-page-section-checks-a-different-right-than-editing-it)
- [3. Pages with no publication status disappear from the website](#3-pages-with-no-publication-status-disappear-from-the-website)
- [4. Fixed flows not tested in a browser](#4-fixed-flows-not-tested-in-a-browser)
- [5. Dead admin helpers on the server](#5-dead-admin-helpers-on-the-server)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | BO plural texts always singular (existed before the branch) | ⏳ to do |
| 2 | 🟡 Low | Regression | Publishing a page section checks `PageSection` rights, editing it checks `Page` rights | ⏳ to do |
| 3 | 🟡 Low | Bug | Pages without `active` are now hidden on the website | ⏳ to do |
| 4 | 🟡 Low | Bug | Fixed flows only verified in code | ⏳ to do |
| 5 | 🟡 Low | Hole | `cloudValidationRules` and `isOwner` have no caller (existed before the branch) | ⏳ to do |

## 1. Plural texts always shown in the singular

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/config/i18n/locales/{en,fr,mg}/common.json`, `.../user.json`

**What can happen** — an admin selects 3 rows; the confirmation reads the singular sentence (e.g.
"Are you sure you want to delete this item?") instead of the plural one.

**Why** — the locales use the old `key_plural` suffix (3 keys per file: `sureToDeleteSelected`,
`selectedCount`, `newCount`, `removeRolesForThisUserSuccessfully`…). `i18next` `^26` only knows the
`Intl.PluralRules` suffixes (`_one`, `_other`), and no `compatibilityJSON` option is set. Commit
6d23988 only reformatted these keys: the bug existed before the branch.

**How to check** — in the users list, select two users and open the delete dialog; or call
`i18n.t('common:sureToDeleteSelected', { count: 2 })` in the console.

**How to fix**

1. **(recommended)** Rename `key` / `key_plural` to `key_one` / `key_other` in the three locales (for
   `mg`, `_one` and `_other` too), then run `pnpm check-i18n`.
   *Why*: it is the format of the installed i18next, with no compatibility flag to carry; a few keys only.
2. Set `compatibilityJSON: 'v3'` in `apps/bo/src/config/i18n/index.ts` — no longer supported by recent
   i18next versions, so it postpones the problem.

## 2. Publishing a page section checks a different right than editing it

- **Severity**: 🟡 Low · **Type**: Regression · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/pages/pages/sections/PageSection.tsx`, `apps/bo/src/redux/actions/pageSection.action.ts`

**What can happen** — a role with `update` rights on `Page` but not on `PageSection` can edit a
section (the edit action checks `collection: 'Page'`) but gets "no right" when using **Publish / Not
publish** on it (the new `toggleActive` call passes `collection: 'PageSection'`). Admins and owners are
not affected (they bypass the check in `canAccessTo`).

**Why** — `pageSection.action.ts` mixes both: create / update / delete check `Page`, list / get check
`PageSection`. The new call followed the class name.

**How to check** — create a role with `Page` find/get/update and `PageSection` find/get only, log in
with it, open a section preview and publish it.

**How to fix**

1. **(recommended)** Pass `collection: 'Page'` in the `toggleActive` call of `PageSection.tsx`, like the
   other write actions on sections.
   *Why*: one line; a section is edited as part of its page, so the same right should cover it.
2. Give roles explicit `PageSection` rights and move every section write action to `PageSection` — more
   precise, but a rights model change that needs a decision and a data update of existing roles.

## 3. Pages with no publication status disappear from the website

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/web/server/queries/page.queries.ts` (`getPage`), Mongo `Page` collection

**What can happen** — a page imported from the old portfolio without an `active` value shows "Page not
found" on the website, while before this change it was displayed.

**Why** — `getPage` now filters `.equalTo('active', true)`. The server `beforeSave` sets `deleted` on
creation but never a default `active`; a page created in the back-office gets it from the form, an
imported one may not. (The `deleted` filter was relaxed to `notEqualTo('deleted', true)` during the
review for the same reason.)

**How to check** — in Mongo: `db.Page.countDocuments({ active: { $exists: false } })`.

**How to fix**

1. **(recommended)** Run the count above; if it is not 0, set `active: true` on those pages once
   (one-off script or Mongo update), and keep the filter.
   *Why*: an offline page must never leak to visitors; fixing the data keeps the rule simple.
2. Filter with `notEqualTo('active', false)` — shows pages with no status, but then a page that never
   chose a status is public by default.

## 4. Fixed flows not tested in a browser

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: BO preview pages (`toggleActive` in `apps/bo/src/redux/actions/app.action.ts`), contacts
  (`setContactAsReplied`), password reset (`auth.action.ts` ↔ `auth.functions.ts`), Brevo
  (`apps/server/src/services/email.service.ts`), web `Sort.tsx` and project detail

**What can happen** — a fix that is right in code fails at runtime, for example a class-level
permission refusing the client-side `save()` of `active` or `replied`, or Brevo rejecting a payload.

**Why** — the fixes were checked by typecheck, lint and reading, not by running the apps; `apps/bo` and
`apps/server` have no tests, and the web Storybook tests were not run.

**How to check** — the list in the review's "See the result locally" section, then
`pnpm nx run web:test-storybook`. For Brevo, create a contact without a phone number and check the
server log for `create contact success`.

**How to fix**

1. **(recommended)** Click through each flow once in local before merging `develop` into `main`, and fix
   what fails on the same branch.
   *Why*: cheapest way to catch runtime-only errors; no test setup exists for these apps yet.
2. Set up a test runner for `apps/server` (Cloud Functions) as its own task — worth it, but outside this
   review.

## 5. Dead admin helpers on the server

- **Severity**: 🟡 Low · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/utils/utils.cloud.ts` (`cloudValidationRules`),
  `apps/server/src/cloud/utils/role.utils.cloud.ts` (`isOwner`)

**What can happen** — a developer adds `validator: cloudValidationRules` to a Cloud Function believing it
has been protecting others; nothing has ever exercised it. Both were fixed (missing `await`, wrong role
index) but are called by nothing.

**Why** — existed before the branch; the uncommitted work fixed their logic without wiring them.

**How to check** — `grep -rn "cloudValidationRules\|isOwner(" apps/server/src`: only the definitions.

**How to fix**

1. **(recommended)** Delete both helpers.
   *Why*: no caller (YAGNI, no orphaned code); admin checks already go through `isAdministrator` /
   `isAdministratorOrBetter`.
2. Keep them and wire them where an owner-only or admin-only check is really needed — only if such a
   use case exists today.
