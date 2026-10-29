---
name: audit
description: Audit one feature, domain, page or technical concern of portfolio-platform (e.g. "articles", "the contact form", "newsletter", "page sections", "i18n", "the server build") across every app it touches, and write the result to docs/code/audit/en/AUDIT_<SUBJECT>.md (+ French twin in fr/) — the current state as it really works in the code, where it shows up in the interface (BO / web pages with local URLs and Storybook links), best practices and what is missing or should be improved, possible bugs, security holes and performance problems, data model and index review, test coverage, docs drift, open questions, and a prioritized TODO section with ⏳/✅/❌ markers. Use when the user asks for "an audit", "audit X", "state of the art of X", "what is missing on X", or invokes /audit.
allowed-tools: Read Write Edit Glob Grep Bash
---

Produces **one audit file per subject** in `docs/code/audit/`, written from the code as it is today.
An audit answers four questions for whoever decides what to do next: **what exists, where it is
visible, what is wrong or risky, and what to do about it — in which order**.

It is not a branch review (`branch-review` — what one branch changed), not a feature doc
(`docs/features/` — how a page works, for non-technical readers) and not a plan. It is a diagnosis
with a prioritized action list. It does **not** change code — fixing comes after, as its own task,
unless the user explicitly asks to "audit and fix".

**Language and twins.** Docs under `docs/code/` live in pairs (`pnpm check-doc-twins`): write
`docs/code/audit/en/AUDIT_<SUBJECT>.md` and its French twin `docs/code/audit/fr/AUDIT_<SUBJECT>.FR.md`
in the same task, same content. The template is shown in English; translate headings in the French
file. Create `docs/code/audit/` (with a short English `README.md`) if it does not exist.

---

## Table of contents

- [1. Scope the subject](#1-scope-the-subject)
- [2. Gather the facts](#2-gather-the-facts)
- [3. File name and location](#3-file-name-and-location)
- [4. File template](#4-file-template)
- [5. How to fill each section](#5-how-to-fill-each-section)
- [6. Severity and effort scales](#6-severity-and-effort-scales)
- [7. Writing rules](#7-writing-rules)
- [8. Local URLs and Storybook links](#8-local-urls-and-storybook-links)
- [9. Lifecycle of the audit](#9-lifecycle-of-the-audit)
- [10. Final check and message to the user](#10-final-check-and-message-to-the-user)

---

## 1. Scope the subject

- **Subject type**: a domain entity (`Project`, `Article`, `Page`/`PageSection`, `Category`,
  `Contact`, `Newsletter`, `User`/`Role`), a user flow (publish an article, send a message), a page,
  or a technical concern (build, tests, perf, i18n, security, CI).
- **Apps concerned**: check all three — `server`, `bo`, `web` — plus `libs/`. A domain audit that only
  reads the server is incomplete.
- **Existing docs on the subject**: grep `docs/` (`code/`, `features/`, `inventory/`, `services/`,
  `getting-started/`). A previous audit of the same subject means **update it** (section 9). Items
  already tracked in another doc are linked, never duplicated.

Ask the user only if the subject is genuinely ambiguous. Otherwise pick the natural scope, state it
in the "Scope" block, and proceed.

## 2. Gather the facts

Never audit from memory or from existing docs — read the code. For a large subject, fan out with
`Explore` agents (one per app) and read the key files yourself afterwards.

| What | Where to look |
|---|---|
| Data model | class names and `*Attributes` interfaces (`libs/shared-domain-types`, `apps/server/src/types`), `.set(...)` calls, triggers (`apps/server/src/cloud/triggers/`), CLP / schema config, `libs/shared-domain-constants` |
| Indexes | where the server defines DB indexes/schema — compare with every `equalTo`/`containedIn`/`ascending`/`descending` used on the subject's classes |
| Server entry points | `Parse.Cloud.define` in `apps/server/src/cloud/functions/`, jobs (`cloud/jobs`), Express routes (`src/routes`), middlewares — and **who** may call each |
| BO | `apps/bo/src/pages/**`, `routes/routes.tsx`, `containers/`, `redux/`, permissions by role |
| Web | `apps/web/app/[locale]/**`, `apps/web/i18n/routes.ts`, server actions (`next-safe-action`), `components/` vs `containers/` |
| Stories | `*.stories.tsx` of the touched web components |
| Tests | Jest tests in `apps/server`, Vitest in `apps/web` — what is covered, what is not |
| i18n | `apps/bo/src/config/i18n/locales`, `apps/server/src/locales`, `apps/web/translations` (`fr`, `en`, `mg`) |
| Constants / rules | `libs/shared-constants`, `libs/shared-domain-constants`, `libs/shared-utils` |
| History | `git log --oneline -- <paths>` |
| Docs | `docs/features/**`, `docs/inventory/**`, `docs/services/**` — to spot **drift** between docs and code |

Run what is cheap and useful: `pnpm nx run <app>:test`, `pnpm nx run <app>:lint`, a grep for
`TODO`/`FIXME`/`eslint-disable` in the scope. Report honestly (pass/fail, pre-existing failures).

## 3. File name and location

- Folders: `docs/code/audit/en/` and `docs/code/audit/fr/`.
- Name: `AUDIT_<SUBJECT>.md` / `AUDIT_<SUBJECT>.FR.md`, `UPPER_SNAKE_CASE`
  (`AUDIT_ARTICLES.md`, `AUDIT_CONTACT_FORM.md`). Folder names stay English.
- An audit on the same subject already exists? Update it — section 9.

## 4. File template

Every section is kept; a section with nothing to say states it in one line ("No problem
identified.") — never an empty heading, never a silently dropped section.

```markdown
# Audit — <Subject>

> **Date**: 2026-10-29 · **Author**: <git user.name> · **Branch**: `<current branch>`
> **Scope**: `apps/server/src/...`, `apps/web/...`, `apps/bo/src/...` *(real paths)*
> **Out of scope**: what was left out on purpose, and why
> **Related docs**: [feature doc](../../../features/...), [other audit](...)
> **Overall status**: ⏳ to do

## Table of contents

- [1. Summary](#1-summary)
- [2. Current state](#2-current-state)
  - [2.1 What it does](#21-what-it-does)
  - [2.2 Architecture and flow](#22-architecture-and-flow)
  - [2.3 Data model](#23-data-model)
  - [2.4 Business rules](#24-business-rules)
- [3. Where it shows up in the interface](#3-where-it-shows-up-in-the-interface)
- [4. Best practices, gaps and improvements](#4-best-practices-gaps-and-improvements)
  - [4.1 What is well done](#41-what-is-well-done)
  - [4.2 What is missing](#42-what-is-missing)
  - [4.3 What should be improved](#43-what-should-be-improved)
- [5. Bugs, holes and performance](#5-bugs-holes-and-performance)
  - [5.1 Possible bugs](#51-possible-bugs)
  - [5.2 Security holes](#52-security-holes)
  - [5.3 Performance](#53-performance)
- [6. Quality and maintainability](#6-quality-and-maintainability)
- [7. Tests](#7-tests)
- [8. Drift from the documentation](#8-drift-from-the-documentation)
- [9. Open questions](#9-open-questions)
- [10. TODO](#10-todo)

## 1. Summary

4 to 8 sentences: what the subject covers, its maturity, the main finding, the 2–3 most urgent
points. Then a rating table (🟢 good · 🟠 gaps · 🔴 blocking):

| Axis | Rating | In one sentence |
|---|---|---|
| Functional completeness | | |
| UX / UI and accessibility | | |
| Security | | |
| Performance and SEO | | |
| Robustness (errors, edge cases) | | |
| Code quality / repo rules | | |
| Tests | | |

## 2. Current state
### 2.1 What it does
Real behavior per role (visitor, admin/editor), as the code does it.
### 2.2 Architecture and flow
Key layers and files (one path per line) and a text/mermaid sketch of the main flow.
### 2.3 Data model
| Class | Fields used | Index | Remarks |
|---|---|---|---|
### 2.4 Business rules
Figures and rules (statuses and transitions, publication, slugs, limits) with where they live.

## 3. Where it shows up in the interface

| App | Page (name as seen) | Route / path | Local URL | Who has access |
|---|---|---|---|---|
| BO | Articles | `routes.tsx` entry | … | admin, editor |
| Web | Article | `/[locale]/articles/[slug]` | http://localhost:9002/fr/... | public |

Then the entry points (menu, button, link, email) and the emails / newsletters sent, plus the
Storybook links (section 8). An unreachable page is itself a finding.

## 4. Best practices, gaps and improvements
### 4.1 What is well done
Short — what a future refactor must not break.
### 4.2 What is missing
| # | Gap | Impact | Reference (repo rule / good practice) |
|---|---|---|---|
### 4.3 What should be improved
| # | Finding | Why it is a problem | Proposal |
|---|---|---|---|

## 5. Bugs, holes and performance
Each table worst first:

| # | Severity | What can happen | When / scenario | Cause (file) | Proposed fix |
|---|---|---|---|---|---|

### 5.1 Possible bugs
### 5.2 Security holes
### 5.3 Performance

## 6. Quality and maintainability
Deviations from `.claude/rules/*` and the root `CLAUDE.md`: missing `select()`/`limit()`,
hard-coded colors or strings, duplicated logic, wrong layer, orphan code, `eslint-disable`, inline
constants, missing stories, missing i18n key in a locale, leftover TODO/FIXME.

## 7. Tests
| Layer | Covered | Not covered | File(s) |
|---|---|---|---|
Result of the suites run during the audit (command + pass/fail).

## 8. Drift from the documentation
Each doc (`docs/features`, `docs/inventory`, `docs/services`, architecture) that no longer tells the
truth, with the false sentence and what the code really does.

## 9. Open questions
Product / content / design decisions the audit cannot settle — one per line, with options and what
depends on it.

## 10. TODO

| # | Priority | Action | App(s) | Effort | Ref. | Status |
|---|---|---|---|---|---|---|
| 1 | 🔴 P0 | Check on the server that only an admin can… | server | S | [5.2 #1](#52-security-holes) | ⏳ to do |

Already tracked elsewhere: links to the existing items (not repeated here).
```

## 5. How to fill each section

- **Current state**: describe what the code **does**, not what it was meant to do. When intent
  (doc, comment, naming) and behavior disagree, write the behavior and log the gap in section 8.
  Name real files, functions, Cloud Functions and enums. Cover happy path, every status/transition,
  error handling, and what is asynchronous (triggers, jobs).
- **Interface**: one row per page actually wired to a route (read the route files). Include
  non-page surfaces: emails (contact notification, newsletter), sitemap/robots/manifest, and what
  role sees what — and whether that check is client-only or also enforced on the server.
- **Best practices**: measure against (1) the repo's own rules (`.claude/rules/*`, root and app
  `CLAUDE.md`), (2) comparable portfolio/blog/CMS practice you actually know, otherwise "to verify",
  (3) general engineering practice (validation at boundaries, idempotency, observability). Also look
  at what users hit without noticing: empty/loading/error states, `fr`/`en`/`mg` i18n, accessibility,
  SEO (metadata, sitemap, Open Graph), image weight, dark mode.
- **Bugs, holes, performance** — only real risks traced to a file:
  - Security: every Cloud Function / route in scope — session required? allowed on **this** object
    (role, owner)? protected fields writable by the client (CLP, `beforeSave`)? personal data
    returned (contact messages, newsletter emails)? public endpoints rate limited and spam-protected
    (reCAPTCHA)? input validated server-side (Zod)? HTML content sanitized? secrets in client code?
  - Bugs: rows created before a field existed, deleted referenced objects, draft vs published
    leaking, slug collisions, time zones, double submit, job run twice, missing locale fallback.
  - Performance: queries without `select()`/`limit()`, filters with no index, N+1, heavy `include`,
    missing pagination, uncached public pages, unoptimized images, bundle size of a BO/web page.
- **TODO**: **every** actionable finding of sections 4 to 8 gets exactly one row, linked back; one
  row = one concrete verifiable action; sorted by priority then effort; say which app(s); status
  `⏳ to do` at creation; items already in another doc are linked, not duplicated; an item needing a
  decision points to its question in section 9.

## 6. Severity and effort scales

| Severity / priority | Meaning |
|---|---|
| 🔴 Critical / P0 | data leak, anyone can act on others' data, crash on a main flow, public site broken — fix before next release |
| 🟠 Major / P1 | wrong behavior visitors will hit, missing feature a flow needs, clear perf problem |
| 🟡 Minor / P2 | edge case, polish, rule deviation with little impact |
| 🔵 Idea / P3 | nice to have, not needed now |

| Effort | Meaning |
|---|---|
| S | < ½ day, one or two files |
| M | ½ to 2 days, one app or a small cross-app change |
| L | > 2 days, several apps, migration, or a design/product dependency |

## 7. Writing rules

- Identifiers (files, functions, classes, fields, enums) stay as in the code, in backticks.
- **Facts from the code only**, each with its file path. Write "to verify" when something could not
  be confirmed (production data, external provider). Distinguish **observed** from **possible**.
- Point out what is good too (§4.1).
- Table of contents right after the header, anchors in sync. Relative links from
  `docs/code/audit/en/` (`../../../features/...`).
- Length follows the subject. No filler. Both languages carry the same content.

## 8. Local URLs and Storybook links

| App | Command | Local URL |
|---|---|---|
| Server | `pnpm nx run server:dev` | `http://localhost:<PORT from apps/server/.env.*>` (Cloud Functions: `POST /parse/functions/<name>`) |
| BO | `pnpm nx run bo:dev` | Vite URL + path from `apps/bo/src/routes/routes.tsx` |
| Web | `pnpm nx run web:dev` | `http://localhost:9002/<locale>/<translated path>` — `apps/web/i18n/routes.ts` |

Check the ports in `.env` / `vite.config.ts` / `apps/web/server.js` if they may have changed. For a
dynamic page, give the pattern and how to obtain a real slug/id.

Storybook exists for web only (`pnpm nx run web:sb`, `http://localhost:6006`): link format
`<base>/?path=/story/<title-id>--<story-id>` (title lowercased, non-alphanumerics → `-`; export name
split on capitals, lowercased, joined by `-`). A web component of the scope with **no story** is a
finding (§6).

## 9. Lifecycle of the audit

The audit is an action-item doc, so it must not rot:

- **Re-auditing a subject**: update the existing files. Add `> **Updated**: <date>` under the
  header, re-check every open item, mark fixed ones ✅ *(fixed)* in place (text kept), abandoned
  ones ❌ with a one-line reason, add new findings at the end of each table.
- **When items are later fixed** (in any task): mark them ✅ in the TODO table and in their section.
- **When every TODO row is ✅ or ❌**: carry the ❌ / still-open ones over to a short plan doc, then
  delete the audit (git keeps the history). An item blocked on a **product decision** gets the
  status `⏳ product decision` with the options and exactly one marked `(recommended)`.

## 10. Final check and message to the user

- [ ] All three apps (+ `libs/`) were considered; those out of scope are named in "Out of scope".
- [ ] Every finding has a file path; every actionable finding has a TODO row linking back.
- [ ] No item duplicated from another doc.
- [ ] URLs and Storybook links checked against the real route files and story titles.
- [ ] Table of contents matches the headings, in both languages.
- [ ] `pnpm check-doc-twins`, `pnpm check-doc-links`, `pnpm lint:docs` pass.
- [ ] No code was changed (unless the user asked to fix too).

Then answer briefly in the chat: the file link, the summary table, the P0 items (P1 in one line
each), and the open questions needing the user's decision. Offer to start on the P0 items — do not
start them unasked.
