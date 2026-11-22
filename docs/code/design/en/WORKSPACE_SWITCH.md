# Workspace Switch (Portfolio / Aldaron)

## Table of Contents

- [Goal](#goal)
- [What exists today](#what-exists-today)
- [Decisions](#decisions)
- [The switch](#the-switch)
- [Role and access](#role-and-access)
- [What changes when Aldaron is active](#what-changes-when-aldaron-is-active)
- [Files to touch](#files-to-touch)
- [Open questions](#open-questions)
- [Order of work](#order-of-work)

> Design note, written before any code. The back-office serves two businesses on the same server and the same database: the portfolio and Aldaron. A switch in the settings page lets a signed-in user pick the workspace they work in.

## Goal

- One back-office, one Parse server, one database; a **workspace** is a view over it, named after a `TargetEnum` value (`portfolio` or `aldaron`).
- Switching to Aldaron shows the Aldaron logo and hides everything that only edits the portfolio website (details, main images, CV).
- Who may switch is decided by the user's role, never by the switch itself.
- Aldaron will gain its own collections (quotes, clients, missions): they appear only in the Aldaron workspace.

## What exists today

| Fact | Where |
|---|---|
| `TargetEnum { PORTFOLIO, ALDARON }` | `libs/shared-types/src/target.type.ts` |
| Articles, pages and categories carry `targets` (several values); a row without it reads as portfolio | `apps/server/src/cloud/utils/_core/parse.utils.cloud.ts` (`contentTargetQuery`) |
| A `Project` already carries a single `target` (default portfolio, set by its trigger), has a select in its form and is read per target by the website | `project.triggers.ts`, `project.service.cloud.ts`, `ProjectFormSettingsSection.tsx` |
| `aldaron-web` reads the same Parse server as the portfolio website | `apps/aldaron-web/env.ts` |
| Back-office settings are local preferences (redux-persist); the three website sections (`details`, `images`, `cv`) are server forms | `settings.constants.ts`, `Settings.tsx` |
| Rights are per collection (`find`, `get`, `create`, `update`, `delete`) and a domain adds its collections through `registerRightsEntities` | `user.constants.ts`, `project-role.utils.ts` |
| The sidebar logo is the `Logo` component and, when the sidebar is collapsed, an icon from `IMAGES` | `Logo.tsx`, `DashboardLayout.tsx`, `app.constants.ts` |

So "a project is either Aldaron or portfolio" is already stored: what is missing is the back-office reading it (the project list follows the active workspace).

## Decisions

1. **Reuse `TargetEnum`** as the workspace type. No new enum.
2. **The active workspace is a local preference** (redux-persist, `settings` slice), like theme and language. It is not stored on the server: two people on the same account can work in different workspaces, and nothing is saved when it changes.
3. **The server never trusts the switch.** Access to Aldaron data is checked from the role on every Cloud Function; the switch only decides what the back-office shows.
4. **Data is never deleted or moved** when the workspace changes.
5. **One registry decides what a workspace shows** (logo, menu entries, settings sections): a plain constant keyed by `TargetEnum`, so adding a workspace or a hidden section is one edit.

## The switch

- Placed in **Settings**, a new section `workspace` in the back-office group of the rail (next to languages and appearance), because it is a local preference that applies at once and has nothing to save.
- Shown **only to a user who may use more than one workspace**; the others never see it and always work in the portfolio.
- Two choices, each named and drawn with its own logo. Picking one applies immediately: the sidebar brand, the menu, the dashboard and the list filters follow without reloading.
- Stored value: `workspace: TargetEnum` in `ISettingState`. A state saved before the field existed has none and reads as `portfolio`.
- If the stored workspace is one the user can no longer use (role changed), it falls back to `portfolio` at startup.

## Role and access

The role decides which workspaces a user may use.

- New field on the `_Role` object: `workspaces: TargetEnum[]`. A role saved before the field existed has none and reads as `[portfolio]`, so nobody gains access by this change.
- Edited in the **access** section of the role form: one checkbox per workspace, `portfolio` checked by default.
- The highest-level roles (`OWNER`, `SUPER_ADMIN`, see `HIGHEST_LEVEL_ROLES`) hold every workspace without it being stored.
- The user's workspaces are the union of the `workspaces` of all their roles, computed on the server and returned with the current user, so the back-office reads it and does not recompute it.
- **Server enforcement:**
  - every Cloud Function of an Aldaron collection refuses a user who does not hold `aldaron`, on top of the usual collection right;
  - the project list and detail functions return an Aldaron project only to a user who holds `aldaron`, and the filter by `target` is applied on the server, not in the browser;
  - articles, pages and categories keep their `targets` filter; a user without `aldaron` never sees rows that name it alone.
- The usual per-collection rights still apply inside a workspace: holding `aldaron` opens the workspace, not every action in it.

## What changes when Aldaron is active

| Area | Portfolio | Aldaron |
|---|---|---|
| Sidebar brand (open and collapsed) | Portfolio logo and icon (`apps/bo/public/images`) | Aldaron logo and symbol, from the Aldaron brand files (`apps/aldaron-web/public/brand`), copied into `apps/bo/public/images` |
| Settings, rail group "website" (details, main images, CV) | Shown | **Hidden**: those forms edit the portfolio website; a URL with `?section=cv` (or `details`, `images`) falls back to the default section |
| Settings, languages and appearance | Shown | Shown |
| Menu | Projects, articles, pages, categories, contacts, newsletter | Projects, articles, pages, categories, then the Aldaron entries (quotes, clients, missions) as they are built |
| Project list and form | Projects whose `target` is portfolio | Projects whose `target` is aldaron; the target is preset to the active workspace on creation |
| Articles, pages, categories | Filtered on `portfolio` by default | Filtered on `aldaron` by default; the existing `targets` field in the form stays editable |
| Dashboard | Portfolio cards | Aldaron cards |

The browser tab title and favicon stay as they are for now.

## Files to touch

Server, back-office, shared libs and docs: the feature spans all of them.

| App / lib | Change |
|---|---|
| `libs/shared-types` | `TargetEnum` already there; add the `workspaces` field to the shared role type if one exists |
| `apps/server` | `workspaces` on `_Role` (validation, role functions, a helper that resolves a user's workspaces), the check inside the Aldaron functions, the `target` filter on the project list functions, the workspaces returned with the current user |
| `apps/bo` types | `workspace` in `ISettingState`; `SettingsSectionEnum.WORKSPACE`; `workspaces` on the role and current-user types |
| `apps/bo` constants | a `WORKSPACES` registry keyed by `TargetEnum` (logo files, hidden settings sections); Aldaron logo entries in `IMAGES` |
| `apps/bo` redux | action and selector for the active workspace in the settings slice |
| `apps/bo` hooks | `useWorkspace` (active workspace, available ones, setter) |
| `apps/bo` containers | `SettingsWorkspacePanel` (the switch), `SettingsSectionsRail` (hide sections), `RoleForm` access section (workspaces checkboxes) |
| `apps/bo` layout | `Logo` and the collapsed icon in `DashboardLayout.tsx` follow the workspace |
| `apps/bo` lists | project list sends the active `target`; article, page and category lists default their `targets` filter to it |
| `apps/bo` i18n | keys for the switch, the workspace names and the role checkboxes, in `fr`, `en` and `mg` (`pnpm check-i18n`) |
| `apps/web`, `apps/aldaron-web` | nothing: they already read per target |
| Docs | `docs/features/bo/settings` and `roles` (French), `docs/inventory/README.md` if a role field counts there |

## Open questions

- **Contacts and newsletter**: the contact form and newsletter belong to the portfolio website today. Do they stay visible in the Aldaron workspace, or does `aldaron-web` get its own? Until decided they stay visible in both.
- **Aldaron logo variants**: the brand folder holds horizontal, stacked and symbol files in normal, dark and mono versions; which one fits the dark and light sidebar is checked against the sidebar styles when it is built.
- **Dashboard**: which Aldaron cards exist depends on the first Aldaron entity.

## Order of work

1. ✅ Shared types and the `workspaces` role field, server side (resolution and enforcement), then the role form.
2. ✅ The workspace preference, the switch in Settings and the `WORKSPACES` registry (logo, hidden settings sections).
3. ✅ Project and CMS lists following the active workspace.
4. ⏳ The first Aldaron collection (quotes), then clients and missions, each behind the server check from step 1 (`resolveWorkspace` / `getUserWorkspaces`).
5. ✅ Docs: features, and the inventory if needed.
