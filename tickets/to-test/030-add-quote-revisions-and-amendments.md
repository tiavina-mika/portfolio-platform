---
type: feat
apps: [server, bo]
branch: feat/quote-revisions-and-amendments
pr: https://github.com/tiavina-mika/portfolio-platform/pull/43
---

## Context

A quote that left `draft` is never edited: it is revised, or amended after acceptance. Depends on
`020-add-the-quote-collection-to-the-aldaron-workspace`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, section "Devis" (`version`, `parentQuote`).

## To do

- Server: `version` and `parentQuote`; a "revise" function on a `sent` quote that creates a `draft` copy
  with the same `number`, `version` + 1, and sets the previous version to `expired`; an amendment is a new
  quote with its own `number` and a `parentQuote` pointing to the accepted quote. An accepted quote is
  never revised. Unique index on `number` + `version`.
- Bo: "Revise" action on a `sent` quote, "Create an amendment" on an accepted one, parent link shown on
  the detail, locales.
- Docs: update the quotes feature page.

## Out of scope

- Payments of an amendment (they follow the generic rule of `060-…`).

## Acceptance criteria

- [ ] Revising a sent quote creates a draft with the same number and the next version
- [ ] The revised version becomes `expired`
- [ ] An accepted quote cannot be revised
- [ ] An amendment has its own number and points to the accepted quote it completes
- [ ] The detail of a quote shows the quote it revises or amends

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (first ticket of `backlog/`, `todo/` empty).

### 2026-11-23 · Claude · to-test
**What changed**: a sent quote can be revised (new Cloud Function `reviseQuote`: a draft copy under the
same number, next version, the sent version expires); an accepted quote can be amended (`createQuote` with
`parentQuote`, own number). The quote trigger decides from the parent's status and keeps the parent's
client. The bo list gets "Revise" (with a confirmation) and "Create an amendment" (form prefilled, client
locked), and shows the version and the parent quote under each title. Feature page, design note,
inventory and changeset updated.

**Branch**: `feat/quote-revisions-and-amendments` (PR linked in the front matter).

**What Claude ran**: `pnpm nx run-many -t typecheck lint test -p server bo shared-domain-utils` ok (server
87 tests); `pnpm nx run-many -t build -p server bo` ok; `pnpm check-i18n`, `pnpm lint:docs`,
`pnpm check-doc-links`, `pnpm check-doc-twins --worktree` ok.

**How to test** (pre-production, Aldaron workspace, Quotes): revise a sent quote → a `· v2` draft and the
old version expired; an accepted quote offers "Create an amendment" and no "Revise"; the amendment gets
its own number and shows "Amendment to …". Detail: `tickets/work/add-quote-revisions-and-amendments/tc-manual.md`.

**Not verified**: every live case (no local database), so no criterion is ticked: the rules are proved by
the server tests only.

**Decisions to validate**: `tickets/work/add-quote-revisions-and-amendments/recommendation.md` (the list
row is the quote's detail, what a revision copies, what an amendment prefills, confirmation, rights,
locked client).

**What is left** (`tickets/work/add-quote-revisions-and-amendments/remaining.md`): the live cases; the
decisions above; payments of an amendment (`060-add-quote-payments-with-the-30-40-30-schedule`); two
deferred low risks in `docs/code/reviews/en/debt/261123-feat-debt-quote-revisions-and-amendments.md`.
No `TODO(link:...)` left open by this ticket.
