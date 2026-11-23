# Recommendations — add the client collection to the Aldaron workspace

Decisions taken alone during `/dev --auto`. Each one is a 🔎 Deduction to validate, not a fact.

## 1. What the list tabs show

- **Question**: the generic list always draws an "All" tab first; how should archived clients be hidden?
- **Chosen**: "All" lists every client; "Active" and "Archived" tabs filter on the status.
- **Reason**: an "All" tab that hides archived clients would lie; the Active tab gives the "filtered
  out" view the criterion asks for.
- **Discarded**: "All" = active only (mislabelled); a checkbox "show archived" (a new list control).
- **If wrong**: change the server default and the tab constants; no data impact.

## 2. Can an archived client come back?

- **Question**: the ticket says "archive"; can it be undone?
- **Chosen**: yes, "Put back in the list" (same `archiveClient` function with `archived: false`). An
  anonymized client cannot be put back.
- **Reason**: archiving by mistake must not be final; nothing is lost either way.
- **If wrong**: drop the menu entry and the `archived: false` branch.

## 3. A dialog, not a full page form

- **Chosen**: create and edit in a dialog over the list (as categories and the profile do).
- **Reason**: a client has ~10 plain fields, no translations or files.
- **If wrong**: add create/edit routes; the form container is reusable as is.

## 4. Clients reached through Cloud Functions only

- **Chosen**: the BO never saves a `Client` with the Parse SDK; the class-level permissions of `Client`
  take no grant from the role rights (`FUNCTION_ONLY_CLASSES`), only the highest roles keep raw access.
- **Reason**: the workspace check lives in the functions; a CLP mirroring role rights would let a
  portfolio-only role with `find` on clients read them with a raw query. The design note asks for
  "master key only".
- **If wrong**: remove `Client` from `FUNCTION_ONLY_CLASSES`; nothing else depends on it.

## 5. Role rights on domain classes accepted by the server

- **Chosen**: the role validation now accepts every class of `DOMAIN_COLLECTIONS`.
- **Reason**: without it a role with a right on `Client` (or `Project`) was refused ("Invalid class
  name"), which blocks criterion 1.
- **If wrong**: nothing to undo — it only widens the allow-list to known class names.

## 6. Delete guard deferred

- **Chosen**: no `beforeDelete` trigger yet; `TODO(link:020-add-the-quote-collection-to-the-aldaron-workspace)`
  in `client.triggers.ts`.
- **Reason**: the ticket says "once those exist"; quotes and missions do not exist, and no function
  deletes a client.
