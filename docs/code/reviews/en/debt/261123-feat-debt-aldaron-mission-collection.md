# Debt — Missions of the Aldaron workspace

> Review: [261123-feat-aldaron-mission-collection.md](../261123-feat-aldaron-mission-collection.md)
> Branch: `feat/aldaron-mission-collection` · Created 2026-11-23 at 20:48 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Assignees through an inherited role](#1-assignees-through-an-inherited-role)
- [2. Day of the dates in the browser vs the server](#2-day-of-the-dates-in-the-browser-vs-the-server)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | A teammate holding Aldaron through a parent role is not an assignee | ⏳ to do |
| 2 | 🟡 Low | Bug | Form and server may read a different day near midnight | ⏳ to do |

## 1. Assignees through an inherited role

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/services/_domain/mission.service.cloud.ts`
  (`getMissionAssigneesService`), `apps/server/src/cloud/utils/_core/role.utils.cloud.ts` (`getUserWorkspaces`)

**What can happen** — a role "Delivery" holds the Aldaron workspace; a role "Junior" is set as a child role
of it in Parse. A member of "Junior" alone is not proposed in "Done by", and a mission given to them by a
raw call is refused.

**Why** — both the picker and `getUserWorkspaces` read the roles a user is directly in
(`equalTo('users', user)`), not the roles inherited through Parse's `roles` relation. This existed before
the branch for the workspace check; the branch only follows it.

**How to check** — create a child role of an Aldaron role, put a user only in it, open the mission form.

**How to fix**

1. **(recommended)** Leave it until the back-office edits role inheritance: no screen builds child roles
   today, so the case only exists from a raw database edit.
   *Why*: changing `getUserWorkspaces` touches every workspace check of the platform for a case nobody
   can create from the interface.
2. Resolve the inherited roles in `getRolesForUser` (walk the `roles` relation up), then reuse it in the
   picker — a core change, with tests on the rights utils.

## 2. Day of the dates in the browser vs the server

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/validations/_domain/mission.validation.ts` (`toDayValue`),
  `apps/server/src/utils/_domain/mission.utils.ts` (`isMissionEndBeforeStart`)

**What can happen** — an admin in Paris picks an end date at 23:30 local for a mission the server started
at 00:30 Antananarivo the next day: the form accepts, the server refuses (or the reverse), with the
server's readable message.

**Why** — the form compares days in the browser's time zone; the server in the business time zone.

**How to check** — set the browser time zone to UTC−10 and type dates around midnight.

**How to fix**

1. **(recommended)** Keep it: the server refuses with a readable message and nothing wrong is stored.
   *Why*: the date picker stores midnight of the picked day, so a gap only appears for dates the server
   filled itself at night, a rare edge for a team working in one country.
2. Compare in the business time zone in the form too (`DEFAULT_COUNTRY.timeZone` with `Intl`), sharing
   `toBusinessDay` through `libs/shared-utils`.
