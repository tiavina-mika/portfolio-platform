# Test cases — add the mission collection to the Aldaron workspace

Fake data only. "Live" cases need the server running on a database: no local database is reachable on the
machine that ran `/dev --auto` (port 27017 closed, the env files point at a remote one), so they were
**not run** there and are listed in `tc-manual.md` for pre-production after the merge. They are `auto` by
nature (a browser or a script could run them) and stay unverified until someone does. Each rule they rest
on is proved by a unit test that stays in the repository.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Create a mission from an accepted quote, prefilled | Aldaron workspace; Quotes → accepted quote → row menu "Create the mission" → pick "Done by" → Save | Dialog opens with client, title and quote filled; saved mission shows in Missions as Planned with "Quote AL-…" | auto (live) | to do — not run, no local database | pre-production | — |
| 1b | Same, the action shows only where it should | Code read: `display: canCreateMission && quote.status === ACCEPTED` in `Quotes.tsx` | Only on accepted quotes, only with `create` on missions | auto | ok (code read + typecheck) | local | — |
| 2 | A quote not accepted or of another client is refused | `canLinkQuoteToMission` with sent / draft / other client | Refused; accepted + same client accepted | auto | ok | local | `apps/server/src/utils/_domain/mission.utils.test.ts` |
| 2b | Same, on a real save | `createMission` with the id of a sent quote, then of another client's accepted quote | Refused with "Quote … cannot be the one of this mission" | auto (live) | to do — not run, no local database | pre-production | — |
| 3 | Status only forward, `done` / `cancelled` final | `canChangeMissionStatus`, `getNextMissionStatuses`; `changeMissionStatusSchema` with `planned` | Only `planned → inProgress / cancelled`, `inProgress → done / cancelled`; never back to planned | auto | ok | local | `mission.utils.test.ts`, `apps/server/src/validations/_domain/mission.validations.test.ts` |
| 3b | Same, in the list | Row menu of a planned mission (Start, Cancel), in progress (Mark as done, Cancel), done (none) | Only the allowed actions show | auto (live) | to do — not run, no local database | pre-production | — |
| 4 | A phase of another status is refused, cleared on a status change | `isMissionPhaseOfStatus`; each status its own phases | Testing refused on planned; no phase always accepted | auto | ok | local | `mission.utils.test.ts` |
| 4b | Same, on a real save | Set phase "Scheduled", then Start | Phase empty after the start; `updateMission` with phase `testing` on a planned mission refused | auto (live) | to do — not run, no local database | pre-production | — |
| 5 | Start / finish fills an empty date with today | `getMissionDatesToFill` | Start fills `startDate` only when empty; done fills `endDate` only when empty; typed dates kept | auto | ok | local | `mission.utils.test.ts` |
| 5b | Same, on a real save | Start a mission with no start date; finish it with no end date | Both dates are today | auto (live) | to do — not run, no local database | pre-production | — |
| 6 | A client with missions cannot be deleted | Delete, with the master key, a client named on a mission (no quote) | Refused with "The client … has missions" | auto (live) | to do — not run, no local database | pre-production | — |
| 7 | (rule) End before start refused, by day | `isMissionEndBeforeStart` | Earlier day refused; same day at another hour accepted | auto | ok | local | `mission.utils.test.ts` |
| 8 | (security) Status and assignee id cannot be imposed | `createMissionSchema` / `updateMissionSchema` with `status`; `getMissionsSchema` with `mine: 'user1'` | Refused | auto | ok | local | `mission.validations.test.ts` |
| 9 | (security) No raw SDK access to missions | CLP built for `Mission` from a role granting every right | No role grant | auto | ok | local | `apps/server/src/cloud/services/_core/security.service.cloud.test.ts` |
| 10 | (list) "My missions" and the tabs | Advanced search → My missions; each tab | Only missions given to me; each tab one status | auto (live) | to do — not run, no local database | pre-production | — |
| 11 | Labels and errors in `fr`, `en`, `mg` | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |
| 12 | (regression) The quote form still picks and creates a client | New quote → client picker → "New client" | Same as before the move of the picker | auto (live) | to do — not run, no local database | pre-production | — |

Static proof run on 2026-11-23: `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils
shared-domain-constants shared-domain-types` ok; `pnpm nx run server:test` ok (9 files, 135 tests);
`pnpm nx run-many -t build -p server bo` ok; `pnpm check-i18n`, `check-doc-links`,
`check-doc-twins --worktree`, `lint:docs` ok.

No case needs human judgement. The live cases are in `tc-manual.md` only because nobody could run them
where the work was done.
