# Manual test guide — clients of the Aldaron workspace

## Before starting

- Where: pre-production back-office (after the merge), or local with `/rd` (server + bo) on a local
  database.
- Accounts:
  - **A**: an Owner or Super Admin account (opens both workspaces).
  - **B**: a role "Aldaron sales" created by A in **Roles**: workspaces **Aldaron**; rights on
    **Clients**: List, Consult, Create, Modify. Invite or reuse a test user with this role.
  - **C**: a role "Portfolio only": workspaces **Portfolio** only; every right on **Clients** ticked.
- Language: any (fr / en / mg); steps below quote the English labels.
- Fake data: `Studio North` / `contact@north.example`, `Jean Test` / `jean.test@example.com`.

## Case 1 — create a client (criterion 1)

1. Sign in as **B**. Settings → Workspace → **Aldaron** (if not already).
2. Sidebar → **Operations** → **Clients**. → The list opens (empty or not).
3. Click **New client**. → A dialog "New client" opens, kind "Company" selected.
4. Name `Studio North`, E-mail `contact@north.example`. Click **Save**.
   → The dialog closes, a message "Studio North was added to the clients." shows, the row leads the
   list with status **Active**.

Failure: an error message, the dialog staying open with no message, or the row missing.

## Case 2 — one e-mail, one client (criterion 2)

1. Still as **B**, click **New client**. Name `Studio North bis`, E-mail `Contact@NORTH.example`. Save.
   → An error says the address is already the one of the client "Studio North". The dialog stays
   open with what was typed.
2. Cancel.

Failure: a second client is created.

## Case 3 — edit, archive, filter, put back (criterion 3)

1. Row of `Studio North` → **Edit**. Phone `+261 34 00 000 00`. Save. → Message "Studio North was
   updated.", the phone shows in the row.
2. Row menu → **Archive**. → Status **Archived**, message "Studio North was archived."
3. Tab **Active**. → `Studio North` is not listed.
4. Tab **Archived**. → `Studio North` is listed. Row menu → **Put back in the list**. → Status
   **Active**.

## Case 4 — a portfolio-only user (criterion 4)

1. Sign in as **C**. → No **Clients** entry in the sidebar, whatever the workspace offered.
2. Type the address `/clients` in the browser bar. → Back on the dashboard.

Failure: the entry shows, or the list opens.

## Case 5 — entry only in Aldaron (criterion 5)

1. Sign in as **A**. Settings → Workspace → **Portfolio**. → No **Clients** entry.
2. Settings → Workspace → **Aldaron**. → **Clients** entry under Projects.

## Case 7 — a role with rights on clients can be saved

1. As **A**, Roles → edit any role → tick **List** on **Clients** → Save. → Saved, no "Invalid class
   name" error.

## Buttons with no intended effect

None.

## Not testable for now

- Deleting a client is not offered anywhere (by design).
- Anonymization (ticket `120-anonymize-an-aldaron-client`).

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 7 | | |
