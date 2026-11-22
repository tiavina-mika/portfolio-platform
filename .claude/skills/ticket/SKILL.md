---
name: ticket
description: Write, split, rename or prioritise portfolio-platform tickets (Markdown files in tickets/). Creates the file in tickets/backlog/ with the standard sections, checks for duplicates in every folder, names it as a verb + object in kebab-case, sets its type and apps. Use when the user runs /ticket, or asks to create, write, split, rename or move a ticket.
argument-hint: "[what the ticket is about] | rename <old> <new> | move <ticket> <folder>"
---

# /ticket: write and maintain tickets

Applies `.claude/rules/tickets.md` ("Writing a ticket") and the format of
[tickets/README.md](../../../tickets/README.md). The **file name is the title**, the **folder is the
status**.

## Create

1. **Understand the need.** Read the request and, if it concerns existing behaviour, the code or the docs
   (`docs/features/`, `docs/code/`) so the ticket describes what really exists. Do not invent product
   rules: a doubt goes in `## Context` as `⚠️`, not in a criterion.
2. **Look for a duplicate** in every folder (`backlog`, `todo`, `in-progress`, `to-test`, `blocked`,
   `done`), on the subject and not only on the name: `Grep` a few keywords in `tickets/`. A duplicate →
   say so and propose to complete the existing ticket instead.
3. **Size.** One working session. Bigger → split into several tickets, one file each, each with its own
   criteria, ordered with numeric prefixes (`010-…`, `020-…`) when the order matters.
4. **Apps.** List the apps the feature really touches (`server`, `web`, `bo`, `libs`); a feature that spans
   several is **one ticket** covering all of them (`implementation-completeness.md`), not one per app.
5. **Name** the file `<verb-in-the-infinitive>-<object>.md`, short, English, kebab-case, no accents
   (`show-the-project-filters.md`, `fix-the-newsletter-double-opt-in.md`). A name starting with `urgent-` is
   reserved for a confirmed hole, regression or bug.
6. **Write** it in `tickets/backlog/` with the front matter (`type`, `apps`, empty `branch` and `pr`) and
   the sections `## Context`, `## To do` (2 to 5 lines), `## Out of scope`, `## Acceptance criteria`,
   `## Comments` (empty on creation, or one entry stating who wrote it and why).
   - Criteria: one checkbox per **verifiable behaviour from the user's side** (a visitor, an admin), never
     an implementation detail.
   - `type` is the future branch prefix: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`.
7. **No criteria, no priority.** A `feat` without criteria stays in `backlog/`, and is never moved to
   `todo/`.

Report the file path(s) created and, when relevant, the duplicates or follow-ups found.

## Rename

Only on request. `git mv` the file, keeping its folder; fix the ticket names quoted in other tickets,
in `tickets/work/<old>/` (rename the folder too) and in the `branch:` field only if no branch exists yet.
A ticket in `in-progress/`, `to-test/` or `blocked/` already has a branch or a PR: say so and ask before
renaming. For a ticket validated in `todo/`, add a `## Comments` entry that notes the rename.

## Move (change status)

`git mv tickets/<from>/<name>.md tickets/<to>/<name>.md`, plus a `## Comments` entry
(`### <date> · Claude · <to>`) saying why. Claude moves `backlog` ↔ `todo` only on the human's request,
`blocked/` with the precise question, and never to `done/` (`tickets.md`, "Forbidden"). Moving does not
commit: committing needs the human's agreement.

## Forbidden

- Creating a ticket without criteria and putting it in `todo/`.
- Guessing a product rule, or presenting a deduction as a fact.
- Creating a ticket that already exists in any folder.
- Deleting a ticket file: a dropped ticket goes to `done/` with a comment.
