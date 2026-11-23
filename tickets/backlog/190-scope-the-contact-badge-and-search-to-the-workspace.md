---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

Since `040-turn-a-site-quote-request-into-a-client-and-a-quote`, a contact carries a `target` and the
contacts page lists only the messages of the active workspace. Two other places still read every contact:
the unread badge of the "Contacts" menu entry (and the bell), and the global search. An Aldaron quote request
therefore raises the badge in the portfolio workspace, and the search can show it to an account that cannot
open it (the detail then answers "not found").

## To do

- Server: the unread count of `Contact` and the contact entity of the global search follow the workspace
  (`resolveWorkspace` / `getUserWorkspaces`, a row with no `target` read as `portfolio`).
- Bo: send the active workspace with those calls, and refresh the badge when the workspace changes.

## Out of scope

- Moving old contacts to the Aldaron target (`150-…`).

## Acceptance criteria

- [ ] In the portfolio workspace, an unread Aldaron quote request does not raise the contacts badge
- [ ] In the Aldaron workspace, the badge counts the unread Aldaron requests only
- [ ] The global search never lists a contact of a workspace the account cannot open

## Comments

### 2026-11-23 · Claude · backlog
Written during `040-turn-a-site-quote-request-into-a-client-and-a-quote`, which left these two counts global.
