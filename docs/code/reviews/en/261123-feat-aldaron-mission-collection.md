# Review — Missions of the Aldaron workspace

- **Branch**: `feat/aldaron-mission-collection`
- **Type**: New feature
- **Author**: `tiavinamika@gmail.com` (local git identity; written by `/dev --auto`)
- **Created**: 2026-11-23 at 20:48
- **Apps touched**: Server, Back-office (and the shared domain libraries)

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [Result per acceptance criterion](#result-per-acceptance-criterion)
- [Checks run](#checks-run)
- [What is left to do](#what-is-left-to-do)

## In short

The Aldaron workspace can now record its **missions**: the work done for a client, most often after an
accepted quote. A mission is written for an active client, optionally tied to one of its accepted quotes,
given to a member of the team, and moved forward only: planned, in progress, done, or cancelled. Each
status has its own optional phases (design, testing, warranty…). An accepted quote offers "Create the
mission", which opens the form prefilled with the client, the title and the quote. Nothing happens by
itself: accepting a quote creates no mission. A client that has missions can no longer be deleted.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Mission` | yes | `title`, `client` (pointer), `quote` (pointer, optional), `status`, `assignee` (pointer `_User`, optional), `phase`, `startDate`, `endDate`, `description`, `createdBy`, `updatedBy` | the work done for a client |

Indexes added (declared at startup in `apps/server/src/config/db-indexes.ts`):

- `_p_client` + `status`: the missions of a client, and the refusal to delete a client that has some.
- `status` + `startDate`: the list, one tab per status.
- `_p_assignee` + `status`: "My missions".

`Mission` is locked to raw SDK access (`ALWAYS_LOCKED_CLASSES`, `FUNCTION_ONLY_CLASSES`): it is reached
through its Cloud Functions only. No migration: the class is created by its first save.

## Server

- Six new Cloud Functions, each checking the Aldaron workspace then the right on `Mission`
  (`getMissions`, `getMission`, `createMission`, `updateMission`, `changeMissionStatus`,
  `getMissionAssignees`). No delete function.
- A `beforeSave` trigger holds every rule, whatever saves the mission: born planned; status only forward,
  `done` and `cancelled` final; a phase must belong to the status and is cleared when the status changes;
  starting or finishing fills an empty start or end date; the end never before the start (by day, where
  the business works); client and quote frozen once the mission left planned; the quote accepted and of
  the same client; the assignee able to open the Aldaron workspace.
- The client `beforeDelete` trigger also refuses a client that has missions.
- The quote list accepts a client filter, so the mission form proposes the accepted quotes of its client.
- Server messages in `fr`, `en`, `mg`. Inventory updated (`docs/inventory/README.md` and its code pages).

## Back-office

- **Pages touched**: Missions (new, `http://localhost:5174/missions`), Quotes (`http://localhost:5174/devis`
  in French, `/quotes` in English).
- A **Missions** sidebar entry, shown only in the Aldaron workspace and with the `find` right; a typed
  address from the portfolio workspace goes back to the dashboard.
- The list: one tab per status, a search on the title, "My missions" in the advanced search, the quote
  under the title, who does it, the dates, the status with its phase.
- A dialog to create and edit (client picker with the "New client" shortcut, title, accepted quote of the
  client, assignee, phase of the current status, dates, description); row actions Start / Mark as done /
  Cancel, only those allowed.
- On the quotes list, **"Create the mission"** on an accepted quote, with the `create` right on missions.
- The client picker of the quote form moved to the client containers so both forms share it (same
  behaviour).
- Missions added to the role rights table. Feature docs: [Missions](../../../features/bo/missions/fr/MISSIONS.FR.md)
  (new), [Quotes](../../../features/bo/quotes/fr/QUOTES.FR.md) and [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md)
  updated.

## See the result locally

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
```

Then, in the Aldaron workspace: `http://localhost:5174/missions` and `http://localhost:5174/devis`
(an accepted quote → row menu → "Créer la mission").

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟠 Medium | Bug | The form refused an end date on the same day as a start the server had filled (compared by exact time while the server compares by day) | Editing a started mission and picking today as its end | ✅ fixed on the branch: the form compares by day too |
| 🟡 Low | Regression | The quote form's client picker moved and changed its labels' keys | Writing a quote | ✅ checked on the branch: same component, `check-i18n` passes, typecheck and build pass |
| 🟡 Low | Bug | A teammate who holds the Aldaron workspace only through a parent role is neither proposed nor accepted as assignee | Roles built with Parse role inheritance | ⏳ deferred — [debt #1](debt/261123-feat-debt-aldaron-mission-collection.md#1-assignees-through-an-inherited-role) |
| 🟡 Low | Bug | The form compares days in the browser's time zone, the server in Antananarivo's: an admin abroad may see a different refusal near midnight | An admin outside the business time zone | ⏳ deferred — [debt #2](debt/261123-feat-debt-aldaron-mission-collection.md#2-day-of-the-dates-in-the-browser-vs-the-server) |
| 🟡 Low | Hole | `getMissionAssignees` returns the names and e-mails of the Aldaron team to any account allowed to list missions | Always | ✅ accepted by design: they are teammates of the same workspace, and the call checks the workspace and the right |

Deferred points: [debt file](debt/261123-feat-debt-aldaron-mission-collection.md).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| A mission can be created from an accepted quote, prefilled | Treated, not run live | `Quotes.tsx` action + `MissionForm` prefill; typecheck, build; live case in `tc-manual.md` |
| A quote not accepted or of another client is refused | Treated | `canLinkQuoteToMission` tested (`mission.utils.test.ts`); trigger `assertLinkableQuote` |
| Status moves only forward | Treated | shared transitions tested; `changeMissionStatusSchema` refuses `planned` |
| A phase of another status is refused, cleared on a status change | Treated | `isMissionPhaseOfStatus` tested; trigger unsets the phase on a status change |
| Starting or finishing fills an empty date | Treated | `getMissionDatesToFill` tested |
| A client with missions cannot be deleted | Treated, not run live | client `beforeDelete` + `hasClientMissionsService` |

Gaps with `implementation.md`: none, except the client picker's `onPick` callback, dropped as unused.
No live case was run: no database is reachable on the machine (port 27017 closed).

## Checks run

- `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils shared-domain-constants shared-domain-types`: ok
  (bo: 48 warnings, all `react-refresh/only-export-components` on route files, the existing pattern).
- `pnpm nx run server:test`: ok, 9 files, 135 tests.
- `pnpm nx run-many -t build -p server bo`: ok.
- `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs`: ok.

## What is left to do

- The live cases of `tickets/work/add-the-mission-collection-to-the-aldaron-workspace/tc-manual.md`
  (pre-production).
- Payments and the deposit warning on a mission start: `060-add-quote-payments-with-the-30-40-30-schedule`.
- The ⚠️ open points of the design note (an `onHold` status, reopening a done mission, a notification on
  cancellation) stay undecided.
