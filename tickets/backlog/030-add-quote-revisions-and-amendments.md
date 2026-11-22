---
type: feat
apps: [server, bo]
branch:
pr:
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
