---
type: fix
apps: []
branch: fix/ticket-loop-git-switch
pr:
---

## Context

`/auto` started `scripts/tickets-loop.ps1` on 2026-11-22 12:49: it logged `Loop started` and then died
silently, with no `Session` line and no `Loop finished` line. Proof: in Windows PowerShell 5.1, with
`$ErrorActionPreference = 'Stop'`, `git switch develop 2>&1 | Out-Null` throws a terminating error when
git writes `Already on 'develop'` to stderr (reproduced: `ERR: Already on 'develop'`). The same applies
to `git pull --ff-only 2>&1` ("Already up to date." is stdout, but any stderr line would throw) and
`git fetch --prune 2>&1`.

## To do

- In the clean-start block of `scripts/tickets-loop.ps1`, relax `$ErrorActionPreference` to `Continue`
  around the `git fetch`, `git switch` and `git pull` calls (as is already done for `claude`), and rely on
  `$LASTEXITCODE` for failures; check it after `git switch` too.
- Log a line and stop cleanly if the script ever dies on an unexpected error (try/catch around the loop
  writing `Loop crashed: <message>`).

## Out of scope

- Changing the loop's allow and deny lists or its stop rules.

## Acceptance criteria

- [ ] Starting the loop while already on `develop` reaches the `Session` line.
- [ ] An unexpected error in the loop writes a `Loop crashed` line in `logs/auto/loop.log`.

## Comments

- 2026-11-22: written by `/auto status` after the first loop died before its first session.
- 2026-11-22: fixed by hand on branch `fix/ticket-loop-git-switch` at the human's request (the loop itself could not run). Git calls relaxed to `Continue` with exit-code checks, `gh` calls protected, `try/catch` writes `Loop crashed`. Parse check OK; `git switch develop` while on develop returns 0. Not run end to end: next `/auto` run is the proof.
