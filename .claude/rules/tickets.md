# Tickets (Markdown files) and Git

Tickets live in `tickets/` (format and folders: [tickets/README.md](../../tickets/README.md)). The **file
name is the ticket title**, the **folder is its status**: `backlog`, `todo`, `in-progress`, `to-test`,
`blocked`, `done`. Moving a ticket = `git mv tickets/<from>/<name>.md tickets/<to>/<name>.md`, then a
dated entry in its `## Comments`. Folder names must be exact.

Branch names follow `git-branches.md` (`<type>/<short-kebab-description>`, type = the ticket's `type`,
description = the file name without its numeric prefix, shortened to 2–5 words if long, recorded in the
ticket's `branch:` field). Commits follow Conventional Commits (`git-branches.md`).

## What Claude does and does not do

| Claude | Human only |
|---|---|
| Write tickets in `backlog/` | Prioritise (`backlog/` → `todo/`) |
| Move to `in-progress/` at start, create the branch | Test what needs a human (feel, real device, validation) |
| Code, prepare commits and the PR | **Authorise** each commit and push; move to `done/` (or run `/ship`, `/dev <ticket> ship`, `/auto`) |
| Run every automatable test | Merge the PR |
| Move to `to-test/` or `blocked/` with a comment | Create labels, authenticate tools |

**Claude never commits or pushes without the human's explicit agreement**, even on a ticket branch and
for docs; it lists what would be committed (files, proposed message) and waits. An agreement for one
commit does not cover the next. Exceptions: `/ship`, `/dev <ticket> ship` (for that ticket) and `/auto`
(for every ticket of its queue): launching them is the explicit request to commit, push and merge.
Starting `/dev` on a ticket is the explicit request to create its branch (`git-branches.md`).

## Where the status lives

The folder a ticket is in **on the branch** is its status. A move is committed in the ticket's own
branch and reaches `develop` with the PR, so `develop` always shows the state of delivered work:

- start: the ticket is moved to `in-progress/` in the working tree before the branch is created, and is
  committed with the first commit of the branch;
- delivery: the last commit of the branch puts the ticket where it belongs once merged (`to-test/`, or
  `done/` under `ship` / `/auto` when every case was run by Claude). Never a direct commit on `develop`
  just to move a ticket;
- a ticket moved to `blocked/` with no code to deliver is committed alone on a `chore/` branch only on the
  human's request (or by `/auto`, which includes it in its own flow).

## Writing a ticket

Use the `/ticket` skill. Look for a duplicate first (every folder, `done/` included).

- **Name**: verb in the infinitive + object, short, kebab-case.
- **Sections**: `## Context`, `## To do` (2 to 5 lines), `## Out of scope`, `## Acceptance criteria`
  (one checkbox per verifiable behaviour, from the user's point of view), `## Comments`.
- **Front matter**: `type`, `apps`, empty `branch` and `pr`.
- **Size**: one working session; otherwise split.

## Ticket cycle

1. **Start of session**: list `todo/`, `in-progress/`, `blocked/` and summarise.
2. **Start**: move to `in-progress/` **before** creating the branch, the work folder or any code.
3. **End of implementation**: PR open and CI green. Tick the acceptance criteria Claude proved itself
   (never a partial or untreated one; criteria that need a human stay unticked). Then move to `to-test/`
   with a comment: what changed, branch / PR, what Claude ran (command and result), **how to test** (only
   the steps that need a human, concrete, local or pre-production), what was not verified.
4. **Blocked**: move to `blocked/` with the precise question. **A missing secret or external access never
   blocks** (see the `/dev` skill, "Missing key or external access").
5. **After the human moves it to `done/`**: `/dev <ticket>` adds the PR link and a closing summary to the
   ticket's comments.
6. **End of session**: list what moved to `to-test/` and what is still in `in-progress/`.

## Forbidden

- Working on a ticket that is not in `in-progress/`.
- Moving a ticket to `done/`, except inside `/ship`, `/dev <ticket> ship` or `/auto`.
- Moving to `to-test/` without a "how to test" comment, or hiding an untreated acceptance criterion.
- Editing a ticket of `todo/` without saying so in its comments.
- Deleting a ticket: move it to `done/` with a comment instead.

## Autonomous mode (`/auto`)

Launching `/auto` is an explicit decision that stands for `/ship` on every ticket of the queue (loop
script `scripts/tickets-loop.ps1`, one fresh `claude -p "/dev --auto"` session per ticket). In that mode
only, and instead of the contrary rules above and in `git-branches.md`:

- Claude merges the ticket's PR into `develop` (merge commit, CI green) and the ticket ends in `done/` when
  Claude ran every test case; if a `human` case remains, it ends in `to-test/`, code already merged.
- `todo/` empty: the queue is `backlog/`, same order. Launching `/auto` is the prioritisation.
- A missing point or a product doubt does not block: Claude keeps the option it recommends, codes it and
  writes it in `tickets/work/<ticket>/recommendation.md` as a **deduction to validate**, never as a fact.
- Everything worked around is listed in `remaining.md`; what is delivered in `implemented.md`.
- A red CI is repaired in the ticket's session (separate commit), never bypassed: see the `auto` skill.
- The loop creates and leaves ticket branches from `develop` without asking.

**Unchanged, even autonomous**: `main` and production, no secret in the repository, no hook bypass
(`--no-verify`), no merge with a red or absent CI, no direct push on `develop`, no ticket deleted.
