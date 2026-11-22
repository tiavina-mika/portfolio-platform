---
type: docs
apps: []
branch:
pr:
---

## Context

Without a PDF and a way to send it, a quote is only a record: the biggest functional gap of the Aldaron
design note (`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Tâches séparées"). It needs its
own note before any code. Depends on `020-…` being designed, not built.

## To do

- Write `docs/code/design/en/ALDARON_QUOTE_PDF.md` and its French twin: how a PDF is produced, where it is
  stored (the note suggests Cloudinary), the Brevo email template, the new env variables and services for
  the inventory, the translations, and options with one marked recommended.
- Follow `markdown-docs.md` (table of contents, twins) and `design-studies.md` is not concerned (no mockup).

## Out of scope

- Any code.

## Acceptance criteria

- [ ] The note exists in English and French with matching sections
- [ ] It lists options for generation, storage and sending, with exactly one recommended
- [ ] It names the env variables, services and inventory entries a build would add
- [ ] `pnpm lint:docs`, `pnpm check-doc-links` and `pnpm check-doc-twins` pass

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
