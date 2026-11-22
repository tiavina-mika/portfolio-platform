---
type: feat
apps: [libs, server, bo]
branch:
pr:
---

## Context

The work done after an accepted quote. Depends on `010-…` and `020-…`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, sections "Mission" and "Cycle de vie d'une
mission". Nothing is automatic: accepting a quote does not create a mission.

⚠️ Open points of the note, not covered here: an `onHold` status, reopening a `done` mission, notifying
someone when a mission is cancelled, phases depending on a mission type.

## To do

- Shared: `Mission` in `DOMAIN_COLLECTIONS`, `MissionStatusEnum`, `MissionPhaseEnum`.
- Server: type, validation, service, functions (no delete), `beforeSave` trigger (no going back, `done`
  and `cancelled` final, a phase must belong to the current status and is cleared when the status changes,
  `endDate` not before `startDate`, quote must be `accepted` and of the same client), `startDate` /
  `endDate` filled on `inProgress` / `done`, client and quote frozen after `planned`, indexes, i18n, and
  the client-deletion trigger of `010-…` extended to missions.
- Bo: list ("my missions" through `assignee`), form, "Create the mission" button on an accepted quote
  (shown with the `create` right of missions, prefilled client, title and quote), route, sidebar entry,
  rights, locales.
- Docs: French feature page + README entry; inventory.

## Out of scope

- Payments and the deposit warning (`060-…`, `070-…`), amounts on a mission.

## Acceptance criteria

- [ ] A mission can be created from an accepted quote with client, title and quote prefilled
- [ ] A mission cannot be linked to a quote that is not accepted or belongs to another client
- [ ] Status moves only forward (`planned → inProgress → done`, or `cancelled`), never back
- [ ] A phase that does not belong to the current status is refused, and is cleared on a status change
- [ ] Starting or finishing a mission fills an empty start or end date with today
- [ ] A client with missions cannot be deleted

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
