---
name: audit-flow
description: Trace one user flow of portfolio-platform end to end (e.g. "contact form submission", "newsletter subscription", "back-office login", "publishing an article", "editing a page section") from the first page to the last server side effect, then hunt on purpose for possible bugs, security holes, performance problems and bad practices along that path, and write the result to docs/code/audit/flow/en/FLOW_<FLOW>.md (+ French twin) — a step-by-step trace (page → action → Parse/server call → triggers → async work → stored state), findings ranked by severity with an evidence level (observed / probable / to verify) and a file path each, test and doc gaps, a prioritized TODO — then the fix plan docs/code/audit/flow/en/to-fix/FLOW_<FLOW>_TO_FIX.md with one section per TODO row (explanation, implementation with a code excerpt checked against the real files, tests to write, and 2–4 variants with exactly one recommended when the fix depends on a choice). Use when the user types "/audit-flow <flow>" or asks to "audit the flow of X", "find the bugs, holes and slowness of X". For a whole domain or page inventory use the `audit` skill instead.
allowed-tools: Read Write Edit Glob Grep Bash Agent
---

Produces **two files per flow** (each with a French twin, as `docs/code/` docs live in pairs —
`pnpm check-doc-twins`), written from the code as it is today:

1. the audit — `docs/code/audit/flow/en/FLOW_<FLOW>.md` (+ `fr/FLOW_<FLOW>.FR.md`): what happens, what
   is wrong, the TODO;
2. the fix plan — `docs/code/audit/flow/en/to-fix/FLOW_<FLOW>_TO_FIX.md` (+
   `fr/to-fix/FLOW_<FLOW>_TO_FIX.FR.md`): for each TODO row, why it matters, how to implement it, the
   tests to write, and the decisions to take.

Invoked as `/audit-flow <flow in natural language>`, e.g. `/audit-flow contact form submission`.

A flow audit follows **one path a user walks** and asks, at every step: *what can go wrong here, who
could abuse it, what will be slow, and what is written in a way the repo does not accept?* It is a
hunt, not an inventory. It does **not** change code unless the user explicitly asks to "audit and fix".

| Skill | Question it answers | Output |
|---|---|---|
| `audit` | What does this domain/page look like today, what is missing? | `docs/code/audit/{en,fr}/AUDIT_<SUBJECT>` |
| `audit-flow` (this one) | Walking this path, what can break, be abused or be slow — and how to fix each? | `docs/code/audit/flow/...` |
| `security-review` | Is the pending diff safe? | chat |

---

## Table of contents

- [1. Scope the flow](#1-scope-the-flow)
- [2. Search: trace the flow](#2-search-trace-the-flow)
- [3. Hunt: the four lenses](#3-hunt-the-four-lenses)
- [4. Verify every finding](#4-verify-every-finding)
- [5. File name, location and index](#5-file-name-location-and-index)
- [6. Audit file template](#6-audit-file-template)
- [7. The to-fix file](#7-the-to-fix-file)
- [8. Severity, evidence and effort](#8-severity-evidence-and-effort)
- [9. Writing rules](#9-writing-rules)
- [10. Lifecycle](#10-lifecycle)
- [11. Final check and message to the user](#11-final-check-and-message-to-the-user)

---

## 1. Scope the flow

- **Name** of the flow as the product says it ("Contact form").
- **Start and end**: the first page/entry point and the state that means "done" (message stored and
  notified, subscriber confirmed, article visible on the public site). Include abandon and retry
  paths — a flow is not only its happy path.
- **Actors**: visitor, admin/editor, the server itself (triggers, jobs), third parties (email
  provider, reCAPTCHA, storage, Google services).
- **Apps on the path**: check `web`, `server`, `bo`, `libs/`. A flow that starts on the public site
  usually ends on the server; the BO counts when it reads or acts on what the flow wrote.
- **Existing material**: search `docs/` (`code/audit/`, `features/`, `inventory/`, `services/`). A
  previous audit of the same flow means **update it** (section 10). Never trust these docs as facts —
  they are claims to check.

Ask the user only if the flow is truly ambiguous. Otherwise state the chosen scope in the header.

## 2. Search: trace the flow

Read the code in the order the user's request travels. Never reconstruct it from memory or docs. For
a flow crossing several apps, fan out with one `Explore`/`Agent` per app for *locating* files, then
read the key files yourself — an agent's summary is never evidence for a finding. Use
`git ls-files <dir> | grep -iE "<keywords>"` if `Glob` is slow.

Record, for **every step**, the file and function:

| Layer | What to record |
|---|---|
| Route / page | which route (`apps/web/app/[locale]/**`, `apps/bo/src/routes`), which guard decides it is reachable |
| Form / validation | the Zod schema client side, and what the server re-validates |
| Action / state | the server action (`next-safe-action`) or Redux thunk, what is stored and persisted |
| Network call | Parse SDK call (`Parse.Cloud.run('x')`, `query.find`, `user.logIn`) or REST |
| Server entry | Cloud Function / trigger / route in `apps/server/src`, the rate limiter on its path, the caller identity checked |
| Server work | services (`email.service.ts`, `files.service.ts`…), queries (`select`/`limit`/index), third-party calls, and whether each is **awaited** in the request |
| Async effects | `afterSave` follow-ups, jobs, emails sent |
| State after | which fields were written, by whom (client vs master key), what the next step reads |

Also trace the **state machine** the flow keeps (a `status`, a published flag): every value, who may
set it, which transitions are enforced **on the server** and which only by the client UI.

Output: the step table and the state diagram of the template (sections 2.1–2.4). It must let someone
who never opened the code understand what runs when the user clicks the button.

## 3. Hunt: the four lenses

After the trace, go through the flow **once per lens**, step by step. Only record risks tied to a
file and a scenario — no generic advice.

### 3.1 Bugs
- **Abandon and retry**: refresh/close at each step — is every value the next step needs still there?
  Dead ends? Half-created data (orphan rows)?
- **Trust boundary**: a step "enforced" by the client (route guard, disabled button) but not by the
  server is not enforced.
- **Error paths**: is each failure shown **where the user is looking**? Silent failures, raw English
  server messages in a `fr`/`mg` UI, stale errors.
- **Concurrency and repeats**: double submit, retry creating a duplicate, two admins editing the
  same page, a trigger or job running twice.
- **Data shape**: field missing on old rows, `null` vs absent, case/trimming of identifiers
  (emails, slugs), time zones, missing locale.

### 3.2 Security
- **Who may call this?** For every Cloud Function/route on the path: session required? caller allowed
  on **this** object (role)? Reachable without the intended page?
- **Client-writable fields**: which fields can the client set, and does a `beforeSave`/CLP revert or
  validate each? Draft/published or role fields set out of order?
- **Enumeration**: do responses reveal whether an email exists (newsletter, login)?
- **Abuse and cost**: anything that sends an email or calls a paid API per request — what caps it
  (per IP/target), and is the **key of the cap trustworthy** (`req.ip` behind a proxy without
  `trust proxy`, a raw `x-forwarded-for`)? Is reCAPTCHA verified **server-side**?
- **Injection / XSS**: user or editor content rendered as HTML (articles, rich text from Tiptap),
  uploaded file types and sizes.
- **Data exposure**: PII in responses, logs, error messages, `protectedFields`.
- **Secrets and config**: keys in the client bundle, test bypass flags reaching production.

### 3.3 Performance
- **Latency on the user's wait**: what is awaited in the request the user stares at (email sending,
  several sequential writes, N+1 queries).
- **Queries**: `select()` and `limit()` present, every filter/sort covered by an index, jobs
  scanning whole collections.
- **Public site**: caching/revalidation of the pages, image sizes, bundle weight, SEO metadata.
- **Write amplification**: many saves of one document, each firing triggers.

### 3.4 Bad practices
Measure against the repo's own rules: `.claude/rules/*.md`, the root and per-app `CLAUDE.md`.
Typical hits: layer violations, duplicated logic, inline constants instead of `libs/shared-*`,
`any`, hard-coded colors/strings, a new UI string missing from a locale (`fr`/`en`/`mg`), missing
story, `eslint-disable`, orphan code, a new env variable/Cloud Function/job missing from
`docs/inventory/`, a test-only branch in production code.

## 4. Verify every finding

1. **Try to disprove it**: read the callers and guards above and below; grep for a second place that
   already handles it (a trigger, a middleware, a Parse option, an index).
2. **Set the evidence level** (section 8). Say what would confirm it.
3. **Run what is cheap**: existing tests of the flow (`pnpm nx run <app>:test`), a lint of the
   touched folder. Report pass/fail honestly, and say plainly when nothing was run. Do not start the
   app or exploit anything against a real environment.
4. **One finding = one scenario**: who does what, in which order, and what they get.

## 5. File name, location and index

- Folders: `docs/code/audit/flow/en/` and `docs/code/audit/flow/fr/`; fix plans in `to-fix/` under each.
- Name: `FLOW_<FLOW>.md` / `FLOW_<FLOW>.FR.md`, `UPPER_SNAKE_CASE` (`FLOW_CONTACT_FORM.md`). A
  same-flow file already there → update it.
- Keep the index `docs/code/audit/flow/en/README.md` (+ French twin `fr/README.FR.md`) in sync: one
  row per flow (flow, app, date, open P0/P1, audit link, fix-plan link, status). Create it if missing.
- If `docs/README.md` has no line for the audits, add one.

## 6. Audit file template

Every section is kept; one with nothing to say states it in one line. Table of contents right after
the title.

```markdown
# Flow audit — <Flow>

> **Date**: 2026-10-29 · **Author**: <git user.name> · **Branch**: `<current branch>`
> **Flow**: from <entry point> to <final state>, including abandon and retry
> **Apps crossed**: `apps/web`, `apps/server` *(real paths)*
> **Out of scope**: what was left out, and why
> **Related docs**: [domain audit](...), [feature doc](...)
> **Fix plan**: [FLOW_<FLOW>_TO_FIX.md](to-fix/FLOW_<FLOW>_TO_FIX.md)
> **Evidence**: code reading only — no test run *(or: tests run, result)*
> **Overall status**: ⏳ to do

## Table of contents

- [1. Summary](#1-summary)
- [2. Research: the flow as it works](#2-research-the-flow-as-it-works)
  - [2.1 The flow in short](#21-the-flow-in-short)
  - [2.2 Step-by-step trace](#22-step-by-step-trace)
  - [2.3 States and transitions](#23-states-and-transitions)
  - [2.4 What is written, by whom](#24-what-is-written-by-whom)
- [3. What is well done](#3-what-is-well-done)
- [4. Possible bugs](#4-possible-bugs)
- [5. Security holes](#5-security-holes)
- [6. Performance](#6-performance)
- [7. Bad practices](#7-bad-practices)
- [8. Tests](#8-tests)
- [9. Drift from the documentation](#9-drift-from-the-documentation)
- [10. Open questions](#10-open-questions)
- [11. TODO](#11-todo)
- [12. Fix plan](#12-fix-plan)

## 1. Summary
4 to 8 sentences, then:

| Axis | Rating | In one sentence |
|---|---|---|
| Robustness (abandon, retry, errors) | 🟢 / 🟠 / 🔴 | |
| Security | | |
| Performance | | |
| Code quality / repo rules | | |
| Tests | | |

Count: `🔴 P0: n · 🟠 P1: n · 🟡 P2: n · 🔵 P3: n`.

## 2. Research: the flow as it works
### 2.1 The flow in short
A text or mermaid sketch: pages, server calls, async effects, end.
### 2.2 Step-by-step trace
| # | Step (what the user sees) | Page / route | Action → service | Network call | Server side | Async effects | State after |
|---|---|---|---|---|---|---|---|
### 2.3 States and transitions
Each value of the flow's state, who may set it (client / server), which transitions the server
really enforces.
### 2.4 What is written, by whom
| Data / field | Written by (client / trigger / job) | Protected server side? | Persisted where |
|---|---|---|---|

## 3. What is well done
Short: what a future refactor must not break.

## 4. Possible bugs
## 5. Security holes
## 6. Performance
## 7. Bad practices
Same table in all four, worst first:

| # | Severity | Evidence | What can happen | Scenario | Cause (file:line) | Proposed fix |
|---|---|---|---|---|---|---|
| B1 | 🔴 P0 | Observed / Probable / To verify | … | 1. … 2. … 3. … | `apps/…/x.ts:42` | … |

Stable ids: `B` (bugs), `S` (security), `P` (performance), `Q` (quality).

## 8. Tests
| Layer | Covered | Not covered | File(s) |
|---|---|---|---|
Result of the suites run (command + pass/fail), or "no test run".

## 9. Drift from the documentation
Each doc that no longer tells the truth: the false sentence, what the code does, the action.

## 10. Open questions
Product decisions the audit cannot settle — one line each, linking to its section in the fix plan.

## 11. TODO
| # | Priority | Action | App(s) | Effort | Ref. | Detail | Status |
|---|---|---|---|---|---|---|---|
| 1 | 🔴 P0 | … | server | S | [S1](#5-security-holes) | [T1](to-fix/FLOW_<FLOW>_TO_FIX.md#t1-…) | ⏳ to do |

## 12. Fix plan
➡️ **[FLOW_<FLOW>_TO_FIX.md](to-fix/FLOW_<FLOW>_TO_FIX.md)** — one sentence on what it contains.
```

The audit links to its fix plan in **four places**: the header, a line under the summary table, the
`Detail` column of the TODO, and section 12. Every finding that needs action gets exactly one TODO
row; one row = one concrete verifiable action, never a theme. Sorted by priority, then effort.

## 7. The to-fix file

Written **right after the audit is complete**, from its TODO table. The audit says *what* is wrong;
this file says *how to fix it* so that whoever picks an item up can start without re-investigating.

### 7.1 Rules

- **Location and name**: `docs/code/audit/flow/en/to-fix/FLOW_<FLOW>_TO_FIX.md` (+ French twin).
- **One section per TODO row, none skipped**, numbered `T<n>` like the TODO `#`.
- **Every excerpt is checked against the real code.** Re-open the target file right before writing
  it: names, imports, export style, the layer's rules. Follow the repo's rules (`async/await`,
  constants in `libs/shared-*`, `select()` and `limit()` on Parse queries, no `eslint-disable`, 110
  columns, English identifiers; UI strings through i18n in `fr`, `en`, `mg`). Show only the changing
  lines (`// before` / `// after`), ~30 lines max per excerpt. It is a proposal: **not applied** and
  not guaranteed to compile as pasted — say so in the header.
- **Never invent an API.** Check the installed version in `node_modules` or the docs, or say "to verify".
- **Tests are part of the fix**: name the regression test(s) in behavior form
  (`it('should refuse a contact message without a valid captcha')`), the file they belong in, and
  what they assert.
- **Cross-app completeness**: when the fix touches the server, say what web/BO must change too, and
  the i18n keys, stories, `docs/features/` and `docs/inventory/` entries to update.
- Open with an **execution-order table** and group items touching the same file.

### 7.2 Template

````markdown
# Fix plan — <Flow>

> **Source**: [FLOW_<FLOW>.md](../FLOW_<FLOW>.md) · **Date**: 2026-10-29
> **Overall status**: ⏳ to do — <n> items, <n> waiting on a decision
> The code excerpts are **proposals** re-read against today's code: not applied, they may need
> adjustments (imports, types).

## Table of contents

- [Recommended order](#recommended-order)
- [Decisions to take](#decisions-to-take)
- [T1. <action>](#t1-action)

## Recommended order

| Order | Item | Why at this point | Depends on |
|---|---|---|---|

## Decisions to take

| Item | Question | Recommended variant |
|---|---|---|
(Omit if none: "No decision pending.")

## T1. <action, in the TODO's words>

- **Priority**: 🔴 P0 · **Effort**: S · **App(s)**: server · **Status**: ⏳ to do
- **Finding**: [S2](../FLOW_<FLOW>.md#5-security-holes)

### What is wrong
Two to six sentences for someone who has not read the audit: scenario, what is obtained, why the
current code allows it (file:line).

### How to implement
1. Clear step (file, function).

```ts
// apps/server/src/cloud/functions/contact.functions.ts
// before
…
// after
…
```

Web / BO side: what changes too (or "nothing"). i18n keys, story, docs to update.

### Tests to write
- `<test file>` — `it('should …')`: what it checks.

### Pitfalls
Existing data migration, deploy order server / BO / web, rows created before the field, backward
compatibility.

### Decision to take
(only for an item that needs one — see 7.3)
````

### 7.3 Decisions: variants and the recommended one

An item needs a decision when the fix depends on a choice the code cannot make: a product rule, a UX
trade-off, a cost, a policy. Do **not** invent a decision where the fix is unambiguous. For each:

- **Question to settle** — one sentence a non-developer can answer.
- **Variants** — 2 to 4 (A, B, C…), each with what the user sees, pros, cons, and which comparable
  sites/products do it (only if you actually know; else "*(to verify)*" or "none known").
- **Exactly one variant marked `(recommended)`** in its label — the best for the product, not merely
  the cheapest; a cheaper stopgap can be named in the recommendation.
- **What the leaders do** — two lines, and whether the recommended variant follows.
- **Recommendation** — the variant and *why*, plus the safeguard and any stopgap.
- **Impact of each variant on the code** — apps and files, roughly how much. The implementation
  excerpt shows the **recommended** variant; the others get a one-line description.

The item's status is `⏳ product decision` until answered. Once the user decides, write
`> Decision of <YYYY-MM-DD>: variant B` under the recommendation, switch to `⏳ to do`, and rewrite
the excerpt if the chosen one is not the recommended. Never delete the other variants.

## 8. Severity, evidence and effort

| Severity | Meaning |
|---|---|
| 🔴 P0 | data leak, anyone can act on others' data, dead end on a main flow — fix before the next release |
| 🟠 P1 | wrong behavior real visitors/admins will hit, missing guard, clear cost or perf problem |
| 🟡 P2 | edge case, polish, rule deviation with little impact |
| 🔵 P3 | nice to have, hardening, cleanup |

| Evidence | Meaning |
|---|---|
| **Observed** | the code alone settles it |
| **Probable** | the scenario is traced through the code and every link holds, but was not run |
| **To verify** | depends on the browser, the production config, real data or a provider — say what confirms it |

Effort: **S** < ½ day, one or two files · **M** ½–2 days, one app or small cross-app · **L** > 2 days,
several apps, migration, or product dependency.

## 9. Writing rules

- Identifiers stay as in the code, in backticks. Reference code as `path/to/file.ts:42`.
- **Facts from the code only**; the evidence column exists for guesses. A mitigated risk is written
  as mitigated.
- Never cite a doc as proof of how the code behaves; the code wins and the doc goes to section 9.
- Do not paste an exploit meant to run against a deployed environment; describe the scenario at the
  level needed to write a regression test.
- Relative links from `docs/code/audit/flow/en/` and one level deeper from `to-fix/`.
- The audit holds the evidence, the plan holds the remedy. Link, do not copy. Both languages carry
  the same content.

## 10. Lifecycle

- **Re-auditing a flow**: update both files. In the audit, add `> **Updated**: <date>`, re-check
  every open finding against today's code, mark fixed ones ✅ *(fixed)* in place, abandoned ones ❌
  with a reason, add new findings at the end of each table. In the plan, add a `T<n>` for every new
  TODO row and re-check the open excerpts (they go stale).
- **When findings are fixed** (in any task): mark them ✅ in the audit section, the TODO table
  **and** the `T<n>` section.
- **When every TODO row is ✅ or ❌**: carry the ❌ / open ones into a short remaining-work doc
  (`⏳ product decision` ones with their variants), then delete the audit and its plan (git keeps
  them) and update the index.

## 11. Final check and message to the user

- [ ] Every step of the trace has a file; abandon and retry were traced, not only the happy path.
- [ ] The four lenses were applied; empty ones say so in one line.
- [ ] Every finding has a file:line, a scenario, an evidence level and a severity; every actionable
      finding has exactly one TODO row.
- [ ] Each finding was challenged (section 4).
- [ ] The to-fix file has one `T<n>` per TODO row with a "why", an implementation excerpt re-read
      against the real file, and its tests.
- [ ] Every item waiting on a choice has 2–4 variants and **exactly one** `(recommended)`.
- [ ] The execution-order table respects dependencies.
- [ ] Tables of contents match the headings in all four files; index README updated.
- [ ] `pnpm check-doc-twins`, `pnpm check-doc-links`, `pnpm lint:docs` pass; no code changed.

Then answer briefly in the chat: links to both files, the summary table with the P0/P1 count, the P0
items one line each (with evidence level), what was **not** verified, and the decisions waiting for
the user with their recommended variant. Offer to start on the P0 items — do not start them unasked.
