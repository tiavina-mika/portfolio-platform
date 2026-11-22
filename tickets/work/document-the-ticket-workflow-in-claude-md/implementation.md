## Goal

Make a new session aware of the ticket workflow by mentioning it in `CLAUDE.md`.

## Read

- The ticket, `.claude/rules/tickets.md`, `tickets/README.md`, `CLAUDE.md` (structure tree and "Detailed rules").

## Apps touched

None (`CLAUDE.md` only). No server, web or bo change is needed.

## Approach

- Add a `tickets/` line to the monorepo structure tree, after `scripts/`.
- Append `tickets` to the topic rules list and add one sentence naming the three skills. `CLAUDE.md` is
  English only and has no twin, so nothing else changes.

## Files touched

- `CLAUDE.md`.

## Steps

1. Edit the tree.
2. Edit "Detailed rules".
3. Run `pnpm lint:docs`.

## Docs and inventory

No `docs/features` or inventory change: nothing user-facing, no env variable, service or Cloud Function.

## Risks

None.
