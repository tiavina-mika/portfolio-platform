---
type: feat
apps: [libs, server, bo]
branch: feat/aldaron-mission-collection
pr: https://github.com/tiavina-mika/portfolio-platform/pull/45
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

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (backlog in file order). Branch `feat/aldaron-mission-collection`. The ⚠️ open
points of the note stay out of scope, as the ticket says.

### 2026-11-23 · Claude · to-test
**What changed**: the `Mission` collection of the Aldaron workspace. Server: six Cloud Functions
(`getMissions` with "my missions", `getMission`, `createMission`, `updateMission`, `changeMissionStatus`,
`getMissionAssignees`; no delete), a `beforeSave` trigger (born planned, status only forward, phase of the
status cleared on a change, empty start / end filled, end not before start by day, client and quote frozen
after `planned`, quote accepted and of the same client, assignee able to open Aldaron), the client delete
guard extended to missions, a client filter on the quote list, indexes, locked CLP, i18n. Bo: Missions
list (tabs, search, "My missions"), dialog, status actions, "Create the mission" on an accepted quote,
route, sidebar entry (Aldaron only), rights, locales; the client picker is shared by the quote and mission
forms. Docs: `docs/features/bo/missions/fr/MISSIONS.FR.md`, quotes and clients pages, inventory, design
note step 4 ✅.

**Branch / PR**: `feat/aldaron-mission-collection`, PR linked in the front matter.

**Claude ran**: lint + typecheck of server, bo and the three shared libs (ok); `pnpm nx run server:test`
(ok, 9 files, 135 tests, new `mission.utils.test.ts` and `mission.validations.test.ts`); build of server
and bo (ok); `check-i18n`, `check-doc-links`, `check-doc-twins --worktree`, `lint:docs` (ok). Review:
`docs/code/reviews/en/261123-feat-aldaron-mission-collection.md` (one bug fixed on the branch, two low
risks deferred to its debt file).

**How to test** (pre-production, Aldaron workspace, an Owner account): create a mission from an accepted
quote; check that only accepted quotes of the client are proposed; Start then Mark as done (dates filled,
phase cleared); "My missions"; the quote form's client picker still works. Detail:
`tickets/work/add-the-mission-collection-to-the-aldaron-workspace/tc-manual.md`.

**Not verified**: every live case — no database is reachable on the machine (port 27017 closed). No
criterion is ticked for that reason; each rule is proved by a unit test.

**Decisions to validate**: `tickets/work/add-the-mission-collection-to-the-aldaron-workspace/recommendation.md`
(`byAgency` instead of `byAldaron`, who can be assigned, "My missions" as a toggle, editing a done mission).

**What is left** (`remaining.md`): live cases to run; the decisions above; the ⚠️ open points of the note
(on hold, reopening, notification) with no ticket yet; payments and the deposit warning
(`060-add-quote-payments-with-the-30-40-30-schedule`); two low deferred risks (inherited roles, day near
midnight abroad).
