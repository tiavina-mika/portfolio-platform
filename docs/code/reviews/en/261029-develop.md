# Review — Monorepo consolidation, shared libraries and bug fixes (`develop`)

- **Branch**: `develop` (compared with `main`, 12 commits + uncommitted work)
- **Type**: Maintenance, with several fixes
- **Author**: Tiavina Michael Ralainirina — `tiavinamika@gmail.com` *(GitHub: `tiavina-mika`)*
- **Created**: 2026-10-29 at 13:33
- **Apps touched**: Server, Back-office, Website (and the shared libraries `libs/shared-*`)

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [Website](#website)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

This branch tidies up the monorepo after the import of the three apps. Types and constants used by
several apps (collections, roles, languages, project technologies, file types) now live in one place,
the shared libraries, instead of being copied in each app. The apps were brought up to date with the
new versions of their tools (MUI 9, zod 4, the new Brevo email SDK), and every type and lint error was
cleaned up. Translations were aligned between the three apps. A full documentation tree was written:
architecture, decisions, feature pages for the back-office and the website, the inventory and the
external services.

The uncommitted work on top fixes several real bugs:

- The server's admin checks let any logged-in user through.
- The **Publish / Unpublish** menu entry did nothing.
- Resetting a password failed.
- **Replied** on a contact message was never saved.
- On the website:
  - Sorting articles had no effect.
  - A project's links section almost never showed.
  - A disabled or deleted page was still reachable by its address.

Nobody has to reinstall anything beyond the usual `pnpm install`, and no environment variable changed.

## Database

No database change: no new class, field or index. Existing fields are now used where they should
have been:

| Class | New? | Fields read / written differently | What it is for |
|---|---|---|---|
| `Article`, `Project`, `Category`, `Page`, `PageSection` | no | `active` *(now written by the Publish menu entry)* | put an item online or offline from its preview page |
| `Contact` | no | `replied` *(now saved, it was only changed on screen)* | remember that a message was answered |
| `Page` | no | `active`, `deleted` *(now filtered by the website)* | hide offline or deleted pages from visitors |

## Server

- **Admin checks fixed (security).** Several actions are reserved for administrators: deleting users
  for good, the admin user lists, and the user delete trigger. Their check never waited for its
  answer, so it always accepted. Only administrators get through now.
- **Owner check fixed.** The "is owner" check looked at the wrong role (Administrator instead of
  Owner). Nothing calls it today.
- **Password reset fixed.** The server now expects the encrypted email under the same name the
  back-office sends (`encryptedEmail`), for the `resetPassword` Cloud Function.
- **Emails go through the new Brevo SDK (v6).** Verification, password reset and newsletter emails, as
  well as contact sync to Brevo, use the new client. They should behave the same. Two details were
  fixed during this review: an empty phone number is no longer sent to Brevo, and attributes that
  already exist are no longer re-created on every new contact.
- No new Cloud Function, trigger, job or environment variable. The inventory pages were rewritten to
  match the code ([inventory](../../../inventory/README.md), [services](../../../services/README.md)).

## Back-office

- **Pages touched**:
  - The preview pages of an article, project, category, page and page section, where the
    **Publish / Not publish** menu entry is.
  - The contacts list, where the **Replied** action is.
  - The password reset page.
- **Publish / Not publish** now really puts the item online or offline and refreshes the preview. Before,
  it changed nothing on the item.
- **Mark as replied** on a contact message is now saved: it stays after a reload. An error now shows a
  message instead of failing silently.
- **Password reset** from the email link works again.
- The forms, tables, date pickers and selects were updated for MUI 9 and zod 4, with no visible change
  expected.
- Translations were completed: some messages that showed a raw key now show real text.
- Feature docs written for every sidebar page: [back-office feature index](../../../features/bo/README.md)
  (e.g. [article preview](../../../features/bo/articles/fr/ARTICLES_PREVIEW.FR.md),
  [contacts list](../../../features/bo/contacts/fr/CONTACTS_LIST.FR.md)).

## Website

- **Pages touched**:
  - Articles list: `http://localhost:9012/fr/articles`
  - Project detail: `http://localhost:9012/fr/projets/<slug>` (the slug of any published project)
  - Editorial page: `http://localhost:9012/fr/<slug>` (the slug of any page)
- **Articles list**: choosing a sort ("Most recent" / "Title") now changes the order and goes back to
  page 1. Before, the choice was ignored.
- **Project detail**: the **Links** section (links, GitHub, npm, CodeSandbox) now shows whenever the
  project has one of them. Before, it only showed for projects that had CodeSandbox links alone.
- **Editorial pages**: a page set offline or deleted in the back-office now shows "Page not found",
  even by its direct address.
- Feature docs written for every public page: [website feature index](../../../features/web/README.md).

## See the result locally

```bash
pnpm install
pnpm nx run server:dev   # API on http://localhost:8089
pnpm nx run bo:dev       # back-office on the Vite URL (http://localhost:5173 by default)
pnpm nx run web:dev      # website on http://localhost:9012
pnpm nx run web:sb       # Storybook on http://localhost:6016
```

Back-office (French paths, default language):

- Article preview: `http://localhost:5173/articles/<id>`, then the **Publish / Not publish** menu entry
- Project preview: `http://localhost:5173/projets/<id>`
- Category preview: `http://localhost:5173/categories/<id>`
- Page preview: `http://localhost:5173/pages/<id>`
- Page section preview: `http://localhost:5173/sections-de-page/<id>`
- Contacts: `http://localhost:5173/contacts`, open a message, then mark it as replied
- Password reset: `http://localhost:5173/compte/mot-de-passe/reinitialiser`

Website: see the URLs in [Website](#website).

Storybook: four stories only had their import path adjusted (no visual change):

- `http://localhost:6016/?path=/story/components-iconbutton--icon-button`
- `http://localhost:6016/?path=/story/components-forms--form-demo`
- `http://localhost:6016/?path=/story/components-typography-pagetitle--page-title`
- `http://localhost:6016/?path=/story/components-typography-title--h-1`

## Possible bugs, regressions and holes

Checks run during the review: typecheck (server, web, bo), lint (all projects, 0 errors) and
`pnpm check-i18n` pass. The Storybook tests were not run.

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🔴 High | Hole | Any logged-in back-office user passes the server's admin checks (user deletion, admin lists) | always, on `main` too | ✅ fixed on the branch: the check now waits for the role answer |
| 🟠 Medium | Bug | Brevo refuses a contact because of an empty phone number: contact, newsletter and sign-up sync stop, silently | every new contact without a phone number | ✅ fixed on the branch: missing values are left out |
| 🟠 Medium | Bug | Publish / Unpublish does nothing; Replied is lost on reload; password reset fails; article sort and project links ignored; offline pages reachable | always, before the uncommitted work | ✅ fixed on the branch |
| 🟡 Low | Bug | "Replied" save fails with no message | network or rights error | ✅ fixed on the branch: goes through the usual loader and error message |
| 🟡 Low | Bug | A page saved without a `deleted` value disappears from the website | pages created without a logged-in user | ✅ fixed on the branch: the website only hides pages marked deleted |
| 🟡 Low | Bug | Brevo attributes re-created (and an error logged) on every new contact | every contact creation | ✅ fixed on the branch: "already exists" counts as done |
| 🟡 Low | Bug | Pages whose publication status was never set vanish from the website | pages imported without `active` | ⏳ deferred — [debt #3](debt/261029-debt-develop.md#3-pages-with-no-publication-status-disappear-from-the-website) |
| 🟡 Low | Bug | Plural texts in the back-office always show the singular form | "3 items selected"-type messages; existed before | ⏳ deferred — [debt #1](debt/261029-debt-develop.md#1-plural-texts-always-shown-in-the-singular) |
| 🟡 Low | Regression | A role allowed to edit a page section may be refused when publishing it | roles with rights on `Page` but not `PageSection` | ⏳ deferred — [debt #2](debt/261029-debt-develop.md#2-publishing-a-page-section-checks-a-different-right-than-editing-it) |
| 🟡 Low | Bug | The fixed flows were checked in code only, not clicked through in a browser | before merging to `main` | ⏳ deferred — [debt #4](debt/261029-debt-develop.md#4-fixed-flows-not-tested-in-a-browser) |
| 🟡 Low | Hole | Two admin helpers on the server are called by nothing, so a future caller may assume they protect something | existed before | ⏳ deferred — [debt #5](debt/261029-debt-develop.md#5-dead-admin-helpers-on-the-server) |

Deferred points: [debt file](debt/261029-debt-develop.md).

## What is left to do

- Commit the uncommitted fixes (not done: commit on request only).
- Click through the fixed flows in a browser and run `pnpm nx run web:test-storybook`
  ([debt #4](debt/261029-debt-develop.md#4-fixed-flows-not-tested-in-a-browser)).
- 28 lint warnings remain (mostly missing `useEffect` dependencies), unchanged by this review.
