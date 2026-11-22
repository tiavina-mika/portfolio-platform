# Tickets

Tickets are Markdown files. **The file name is the ticket title** (a verb in the infinitive + an object, in
kebab-case: `show-the-project-filters.md`). **The folder is the status**: moving a ticket means moving its
file (`git mv`), never editing a status field.

| Folder | Meaning | Who moves a ticket there |
|---|---|---|
| `backlog/` | Written, not yet prioritised | Claude / human |
| `todo/` | Prioritised, ready to start | Human (Claude too, when `/auto` or `/dev` takes a `backlog/` ticket) |
| `in-progress/` | Work started | Claude / human |
| `to-test/` | Implemented, waiting for human validation | **Claude** |
| `blocked/` | Waiting for a decision or information | Claude / human |
| `done/` | Tested and validated | **Human only** (or `/ship`, `/dev <ticket> ship`, `/auto`, in their own conditions) |

`work/<ticket-name>/` holds the working files of a ticket (plan, test cases, what is delivered, what is
left). It never moves with the ticket. Rules: [.claude/rules/tickets.md](../.claude/rules/tickets.md).
Skills: `/ticket` (write, rename, move a ticket), `/dev` (do a ticket), `/auto` (chain tickets without a
human).

These files are short working notes, not documentation: they have no table of contents and no translated
twin. Names are English; a file keeps one language.

## Ordering

Inside a folder, tickets are taken in file-name order. Prefix a name with digits to force an order
(`010-add-the-filters.md`); the prefix is ignored in the branch name. A name starting with `urgent-` goes
before every other one.

## Ticket format

```markdown
---
type: feat            # feat | fix | chore | refactor | docs | test | perf | ci
apps: [server, bo]    # apps touched: server, web, bo (and libs)
branch:               # filled when the work starts
pr:                   # filled when the pull request is opened
---

## Context

Why, and where it shows up (page, URL, related ticket by file name).

## To do

2 to 5 lines.

## Out of scope

What this ticket does not do.

## Acceptance criteria

- [ ] one verifiable behaviour, seen from the user's side

## Comments

### 2026-11-22 · Claude · to-test
What changed, branch / PR, what was run, how to test, what is left.
```

- No title line: the file name is the title.
- `## Acceptance criteria` is the checklist. A `feat` ticket without criteria stays in `backlog/`.
- `## Comments` is append-only, newest last, one `###` entry per event (a move, a test result, a question),
  headed `date · author · status moved to` when a move happened.
- Size: one working session. Bigger → split into several tickets (look for a duplicate first).
