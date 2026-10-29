---
name: branch-review
description: Write the end-of-work review of a portfolio-platform branch in docs/code/reviews/en/<YYMMDD>-<branch-name>.md (+ French twin in fr/) — whatever its type (feat, fix, refactor, perf, chore, docs, test, ci…) — a simple, non-technical summary of what was done, one section per touched app (server, web, BO), with the collections and database fields touched, the pages and URLs changed, and local Storybook links — plus a triage of the possible bugs, regressions and security holes it finds: those that block the merge are fixed on the same branch first, the others go to a detailed debt file in docs/code/reviews/en/debt/ with how to fix each one. Use when the coding work of a branch is finished, when the user asks for "the review", "the recap" of a branch, or invokes /branch-review.
allowed-tools: Read Write Edit Glob Grep Bash
---

Produces **one Markdown file per branch** in `docs/code/reviews/`, written at the end of the coding
work — a feature, a bug fix, a refactor, a dependency upgrade or a docs-only change — for someone
who did not follow the development. It says **what changed, where to see it, and what the data looks
like now** — in plain language, never as a code walkthrough.

It is not a changelog (`.changeset/`, cumulative by version) and not a feature doc (`docs/features/`,
which describes how a page works today). It is the delivery report of one branch.

**Language and twins.** Docs under `docs/code/` live in pairs (`check-doc-twins`): write
`docs/code/reviews/en/<name>.md` and its French twin `docs/code/reviews/fr/<name>.FR.md` in the same
task, with the same content. The template below is shown in English; translate the headings in the
French file.

---

## Table of contents

- [1. Gather the facts](#1-gather-the-facts)
- [2. File name and location](#2-file-name-and-location)
- [3. File template](#3-file-template)
- [4. Writing rules](#4-writing-rules)
- [5. Local URLs](#5-local-urls)
- [6. Storybook links](#6-storybook-links)
- [7. Triage: fix now or defer](#7-triage-fix-now-or-defer)
- [8. Debt file](#8-debt-file)
- [9. Final check](#9-final-check)

---

## 1. Gather the facts

Never write from memory of the conversation — read the diff. From the repo root:

```bash
git rev-parse --abbrev-ref HEAD                       # branch name → file name
git log --oneline develop..HEAD                          # commits of the branch (may be empty)
git diff --stat develop...HEAD                           # committed changes
git status --porcelain                                # uncommitted changes — include them too
date "+%Y-%m-%d %H:%M"                                # date and time of the review
date "+%y%m%d"                                        # file name prefix (e.g. 261029)
gh api user --jq '.login + " " + (.email // "")'      # GitHub account (may fail: gh not logged in)
git config user.name; git config user.email           # fallback: the local git identity
git log develop..HEAD --format='%an <%ae>' | sort -u     # every author of the branch's commits
```

Then, for the touched files, find:

| What | Where to look |
|---|---|
| Apps touched | first folder under `apps/` (and `libs/` → "shared", mentioned inside the apps that use it) |
| Database entities | `Project`, `Article`, `Page`, `PageSection`, `Category`, `Contact`, `Newsletter`, `_User`/`_Role` — class names used in `apps/server/src/cloud/` and the `*Attributes` interfaces (`libs/shared-domain-types`, `apps/server/src/types`) |
| Fields added or changed | new `.set('field', …)` / `.select([...])`, new fields in the `*Attributes` interfaces, schema / index definitions in `apps/server/src` |
| Server entry points | new `Parse.Cloud.define('…')` in `apps/server/src/cloud/functions/`, triggers, jobs, Express routes in `apps/server/src/routes/` |
| Pages (BO) | changed files under `apps/bo/src/pages/**` and their route in `apps/bo/src/routes/routes.tsx` |
| Pages (web) | changed files under `apps/web/app/[locale]/**`, translated path in `apps/web/i18n/routes.ts` |
| Stories | new or changed `*.stories.tsx` (web) — read their `title` and named exports |
| Feature docs updated | `docs/features/**` in the diff — link them |
| Inventory updated | `docs/inventory/**`, `docs/services/**` in the diff (new env var, service, Cloud Function, trigger, job) |
| Author | the GitHub account's email (`gh api user`); fallback the local `git config user.email`; add the other commit authors if several |

### Adapt to the type of work

The type comes from the branch prefix (`feat/`, `fix/`, `chore/`…) or the commit type. It changes
what "In short" has to answer — the rest of the template stays the same.

| Type | "In short" answers |
|---|---|
| `feat/` | what the user can do now that they could not before |
| `fix/` | what went wrong before (as the user saw it), what happens now, who was affected |
| `refactor/` | why it was done, and that **nothing changes for the user** — say it explicitly; list any visible difference as a risk |
| `perf/` | what is faster or lighter, and by how much when measured |
| `chore/`, `ci/`, `build/` | what was updated or configured, and whether anyone has to do something (reinstall, new env var…) |
| `docs/` | which docs were written or updated, and for whom |
| `test/` | which behaviors are now covered by tests |

A section with nothing visible (e.g. a server-only refactor) still states it in one line:
"No visible change for users."

## 2. File name and location

- Folders: `docs/code/reviews/en/` and `docs/code/reviews/fr/` (create if missing).
- Name: the **creation date as `YYMMDD`**, a `-`, the **branch name with `/` replaced by `-`**,
  lowercase: `feat/project-filters` reviewed on 2026-10-29 → `261029-feat-project-filters.md`
  (French twin `261029-feat-project-filters.FR.md`).
- On `develop` (no working branch), derive it from the last commit subject: date prefix + type +
  kebab-case summary.
- A review of the same branch already exists (`docs/code/reviews/en/*-<branch-name>.md`, any date —
  glob it)? **Update that file** and keep its name. Keep the first "Created", set "Updated" to now,
  add what changed since.

## 3. File template

Only the sections of the apps actually touched are kept — drop the others entirely.

```markdown
# Review — <readable title of the work>

- **Branch**: `feat/project-filters`
- **Type**: New feature *(or Fix, Refactor, Performance, Maintenance…)*
- **Author**: First Last — `email@example.com` *(GitHub: `login`; other commit authors after)*
- **Created**: 2026-10-29 at 16:42
- **Updated**: 2026-10-29 at 18:05 *(only if the review was redone)*
- **Apps touched**: Server, Web

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
3 to 6 sentences, per the type table.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Project` | no | `featured` *(added)* | pin a project on the home page |

Indexes added: one line per index, with the query it speeds up.
Nothing touched: "No database change."

## Server
What the server can do in addition, in plain sentences. New Cloud Function names in parentheses,
once, so a developer can find them. Mention new env variables / services (and the `docs/inventory/`
entry).

## Back-office
- **Pages touched**: name as the admin sees it + local URL
- What the admin sees / can do now.

## Website
- **Pages touched**: name + local URL (default locale), plus translated URLs for a new page
- What the visitor sees.

## See the result locally
Commands to run, then the list of links (pages and stories) — sections 5 and 6.

## Possible bugs, regressions and holes

What **could** go wrong because of this branch, even if nothing was observed. A table, worst first:

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🔴 High | Hole | … | … | ✅ fixed on the branch |
| 🟡 Low | Bug | … | … | ⏳ deferred — [debt #2](../debt/…#2-…) |

"Follow-up" comes from the triage of section 7: **✅ fixed on the branch** (one sentence on the
fix), or **⏳ deferred** with a link to its entry in the debt file. A blocking point that could not be
fixed is written **⛔ blocks the merge** with the reason. "No risk identified." if truly none —
never an empty section. With at least one deferred point, link the debt file under the table.

## What is left to do
What was not done or not tested, with a link to the plan doc if any. "Nothing" if all is done.
```

## 4. Writing rules

- **Simple, non-technical**: a sentence explaining a behavior beats a list of file names. Paths only
  where they help someone find something (a route, a story).
- **Facts from the diff only**; unfinished parts go in "What is left to do".
- Class names, fields, Cloud Functions and routes stay **as in the code**, in backticks.
- Short: the whole picture in 2–3 minutes.
- Link the feature docs updated by the branch with relative links from `docs/code/reviews/en/`.
- Table of contents right after the header block.

### Finding the possible bugs, regressions and security holes

Look for them on purpose — it is not a list of what was already fixed:

- **Security holes**: new public (no session) entry points and what they return; rights checked on
  every new Cloud Function (who may call it, on whose data); public forms (contact, newsletter) and
  their rate limit / spam protection (reCAPTCHA); personal data returned to the public site; fields a
  client can write directly (CLP, protected fields); content rendered as HTML (XSS in articles).
- **Regressions**: every shared component, hook, util, reducer, `libs/shared-*` export or server
  service **modified** (not created) — list its other callers; existing tests that fail after the
  branch (run the suites of the touched apps; say whether a failure also exists on `develop`).
- **Bugs**: data that may be missing or old (rows created before the branch, optional fields,
  deleted objects), dates and time zones, a value computed once and stored while its source changes,
  a missing locale (`fr`/`en`/`mg`), unpublished vs published content leaking to the public site,
  concurrent edits in the BO.
- Only real, specific risks traced to the diff — never generic advice.

## 5. Local URLs

Build every "page touched" URL from these (read the real ports in `.env`, `vite.config.ts`,
`apps/web/server.js` — they may have changed), in the default locale unless the page is
locale-specific:

| App | Command | Local URL |
|---|---|---|
| Server (API) | `pnpm nx run server:dev` | `http://localhost:<PORT from apps/server/.env.*>` (Cloud Functions: `POST /parse/functions/<name>`) |
| BO | `pnpm nx run bo:dev` | Vite URL + path from `apps/bo/src/routes/routes.tsx` |
| Web | `pnpm nx run web:dev` | `http://localhost:9012/<locale>/<translated path>` — see `apps/web/i18n/routes.ts` |

For a dynamic page, give the pattern and how to get a real value (`/fr/articles/<slug>` — "the slug
of any published article").

## 6. Storybook links

Only the web app has Storybook (`pnpm nx run web:sb`, base URL `http://localhost:6016`). For every
story file added or changed by the branch:

`http://localhost:6016/?path=/story/<title-id>--<story-id>`

- `title-id` = the story's `title`, lowercased, every `/` and run of non-alphanumeric characters
  replaced by `-`: `Containers/Project/ProjectCard` → `containers-project-projectcard`.
- `story-id` = the named export split on its capitals, lowercased, joined by `-`:
  `WithImage` → `with-image`, `Default` → `default`.

One link per variant that shows something new, with one line saying what it shows. No story
changed → omit the section.

## 7. Triage: fix now or defer

A risk found at review time is cheapest to fix **now, on the same branch**, while the code is fresh.
The debt file is for what genuinely cannot or should not be done in this branch.

| The risk is… | Decision |
|---|---|
| 🔴 High, whatever its type | **Fix on the branch** before the review is finished |
| A security hole with a small, local fix (missing rights check, null guard, a field that should not be returned) | **Fix on the branch** |
| A regression the branch introduced (a shared component it changed, a test it broke) | **Fix on the branch** |
| A bug with a small, local, testable fix in code the branch wrote | **Fix on the branch** |
| Needs a product, content or design decision | **Defer** → debt file |
| Needs a manual test (browser, device) before anyone knows what to fix | **Defer** → debt file |
| Needs a change outside the branch's scope (new service, CI, another app's config) | **Defer** → debt file |
| Existed before the branch | **Defer** → debt file, flagged "existed before the branch" |
| 🟡 Low edge case whose fix costs more than the risk | **Defer** → debt file |

How to apply it:

1. List every risk (section 4), then decide fix / defer for each.
2. **Fix** the "fix on the branch" ones in the same task: code + a test proving it, lint and the
   app's tests re-run, following the project rules (feature docs, i18n in every locale, inventory).
3. A must-fix risk that cannot be fixed now: write it **⛔ blocks the merge**, put it in the debt file
   anyway, and tell the user explicitly — never downgrade it silently to "deferred".
4. Fixed risks stay in the review table as **✅ fixed on the branch**; deferred ones link to the debt
   file.
5. Ask before fixing only when a fix changes a visible behavior nobody asked for, or is large (more
   than a few files).

A deferred item that is really unfinished planned work belongs in a plan/todo doc, not in the debt
file. Never write the same item in both.

## 8. Debt file

When the triage leaves **at least one risk deferred or blocking**, also write a **debt file**
(English + French twin) in `docs/code/reviews/en/debt/` and `fr/debt/`. Fixed risks do **not** go in it.

- Name: the review's file name with **`debt` inserted right after the type**:
  `261029-feat-project-filters.md` → `debt/261029-feat-debt-project-filters.md`.
- An existing debt file of the branch is updated, never duplicated; a risk fixed since is marked ✅
  in place (text kept), a dropped one ❌ with the reason.
- No deferred risk → no debt file. The review links the debt file and vice versa.

This file is **for developers**: file paths, function names and code-level causes are welcome.

```markdown
# Debt — <review title>

> Review: [<review file name>](../<review file name>)
> Branch: `feat/project-filters` · Created 2026-10-29 at 16:10 · Author: `email@example.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. <short risk title>](#1-short-risk-title)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🔴 High | Hole | … | ⏳ to do |

## 1. <short risk title>

- **Severity**: 🔴 High · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/...`, `apps/web/...`

**What can happen** — the concrete scenario, step by step.

**Why** — the cause in the code (missing check, frozen value, changed shared component); say if it
existed before the branch.

**How to check** — steps to reproduce, or the test that would show it.

**How to fix** — the options, each step by step (files, function to add or reuse, test to write).

1. **(recommended)** <chosen option>
   *Why*: one or two sentences, the deciding criteria.
2. <other option> — what it costs or leaves unsolved.
```

Every "How to fix" carries **exactly one `**(recommended)**` option**, first, with a *Why* line.
Choose it on: **security** (fixed on the server, smallest exposed surface), **UX** (what the
visitor/admin experiences), **what comparable sites/CMS do** (only when known), **performance and
cost** (queries, indexes, third-party quotas) and **engineering** (`.claude/rules/`, reuse, KISS,
testability, size of change vs size of risk).

## 9. Final check

- [ ] File name = `YYMMDD-` + branch name with `/` → `-`, in `docs/code/reviews/en/` and its `fr/` twin
- [ ] Date **and** time filled in (from `date`, not guessed)
- [ ] Author email from `gh api user` or `git config user.email` — never guessed
- [ ] One section per touched app, none for untouched apps
- [ ] "Database" lists every new class field and index — or says there is none
- [ ] Every touched page has its local URL; every new/changed story has its Storybook link
- [ ] No claim that is not in the diff
- [ ] "Possible bugs, regressions and holes" filled after the search of section 4
- [ ] Table of contents matches the headings
- [ ] Every risk triaged; the review shows ✅ fixed / ⏳ deferred / ⛔ blocks the merge
- [ ] Deferred risk → debt file written, linked both ways, each with exactly one `(recommended)` fix
- [ ] `pnpm check-doc-twins`, `pnpm check-doc-links` and `pnpm lint:docs` pass

Then tell the user the path of the file (and of the debt file), what was fixed on the branch during
the review, and any ⛔ risk that still blocks the merge. Do not commit it unless asked.
