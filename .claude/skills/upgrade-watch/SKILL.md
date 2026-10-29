---
name: upgrade-watch
description: Watch the new versions of the big libraries of portfolio-platform (parse-server, parse SDK, next, react, MUI, TanStack Router, redux toolkit, tailwindcss, next-intl, zod, vite, nx, storybook, typescript…) and write the result to docs/code/upgrade/en/UPGRADES_<YYYY-MM-DD>.md (+ French twin) — libraries grouped by the apps that use them (server, web, bo, web + bo, all…), for each one the installed version vs the latest, the notable changes since (features, breaking changes, security fixes) version by version, the other libraries that must be updated with it (peer dependencies), a recommendation, a migration effort estimate and code excerpts when the migration touches code. Use when the user asks "look at the new versions", "which libs are outdated", "what's new in X since our version", or invokes /upgrade-watch.
allowed-tools: Read Write Edit Glob Grep Bash WebFetch WebSearch
---

Produces **one dated report** in `docs/code/upgrade/` that tells the developer, for the big libraries
of the workspace: **what is new since our version, what it costs to move, and whether we should**.

It does **not** upgrade anything. Upgrading is a separate task, done only when the user asks.

---

## Table of contents

- [1. Pick the libraries](#1-pick-the-libraries)
- [2. Find installed vs latest](#2-find-installed-vs-latest)
- [3. Read what changed](#3-read-what-changed)
- [4. Find the dependent libraries](#4-find-the-dependent-libraries)
- [5. File name and location](#5-file-name-and-location)
- [6. File template](#6-file-template)
- [7. How to fill each library section](#7-how-to-fill-each-library-section)
- [8. Effort scale](#8-effort-scale)
- [9. Writing rules](#9-writing-rules)
- [10. Lifecycle](#10-lifecycle)
- [11. Final message to the user](#11-final-message-to-the-user)

---

## 1. Pick the libraries

"Big libraries" = the ones whose upgrade can break code or bring something users/devs notice:
frameworks, runtimes, UI kits, state/routing/form libs, the BaaS, the build tooling, the test and
Storybook stack. **Not** every small utility.

1. Read the `dependencies` and `devDependencies` of `apps/server`, `apps/web`, `apps/bo`, the root
   `package.json` and `libs/*/package.json` (plus `pnpm-workspace.yaml` catalogs/overrides if used).
2. Keep the big ones. If the user names libraries, restrict to those. With no list, take at least:
   `parse-server`, `parse`, `next`, `react`, `next-intl`, `tailwindcss`, `@mui/material`,
   `@tanstack/react-router`, `@reduxjs/toolkit`, `react-hook-form`, `zod`, `typescript`, `nx`,
   `storybook`, `vite`, `vitest`, `eslint`, `pnpm` (`packageManager`) and `node` (`engines` /
   `.nvmrc`).
3. **Group by the apps that use it**: `server`, `web`, `bo`, `web + bo`, `tout le workspace`… A
   library used by two apps appears **once**, in the group listing exactly those apps, and flags
   version mismatches between apps.

## 2. Find installed vs latest

Always use `pnpm`, never `npm`. In Bash, Node 24 may not be on the PATH — source
`.vscode/use-node-24.sh` if `node` fails.

```bash
# installed (hoisted node_modules at the workspace root)
node -p "require('./node_modules/<pkg>/package.json').version"
# latest stable
pnpm view <pkg> version
# every published version (to count how many releases we are behind)
pnpm view <pkg> versions --json
# peer dependencies of a given version
pnpm view <pkg>@<version> peerDependencies --json
```

Compare to the **lockfile / installed** version, not only to the `^range`. Say how far behind we
are: patch, minor, major, and the number of releases. `pnpm outdated -r` gives a quick overview.

## 3. Read what changed

Order of preference, stop as soon as you have the facts:

1. `gh release list -R <owner>/<repo>` and `gh release view <tag> -R <owner>/<repo>`.
2. The repository's `CHANGELOG.md` / release page, fetched raw (`WebFetch`).
3. The official migration / upgrade guide for any major (`WebSearch` / `WebFetch`).
4. Never invent: if a changelog cannot be read, write "*(not verified — changelog unreadable)*"
   and say which version range is affected.

Separate on purpose: **features**, **breaking changes**, **security fixes** (keep the advisory id,
e.g. GHSA-…), **bug fixes that touch what we use**, and **pure dependency bumps** (one line).
Pre-release tags (`-alpha`, `-beta`, `-rc`) are listed apart as "not stable yet", never recommended
for production.

## 4. Find the dependent libraries

For each library worth upgrading, find what must move **with** it:

- `pnpm view <pkg>@<newVersion> peerDependencies --json` for the ones that constrain our packages;
- the compatibility matrices (Next ↔ React ↔ `eslint-config-next`; Storybook ↔ addons and Vite;
  MUI ↔ `@emotion/*`; Nx ↔ its `@nx/*` plugins; Parse Server ↔ `parse` SDK and its adapters);
- our own wrappers and patches that pin the old API (`patches/parse@8.6.2.patch`, `@shared/*` libs);
- tooling that reads the version: `engines`, `.nvmrc`, `packageManager`, CI workflows.

Write them in a "Dependencies to update with it" table. Run `pnpm why <pkg>` when unsure who pulls a
package.

## 5. File name and location

The repo's docs are bilingual twins (`check-doc-twins`): write
`docs/code/upgrade/en/UPGRADES_<YYYY-MM-DD>.md` **and** `docs/code/upgrade/fr/UPGRADES_<YYYY-MM-DD>.FR.md`
in the same task (create the folders if missing). Add a short English `docs/code/upgrade/README.md`
the first time, explaining that reports are ephemeral. Both start with a clickable table of contents.

- Today's date comes from the conversation context — never guess it.
- A report of the **same day** exists → update it. An older report exists → read it first, carry its
  open items over, then delete the old files (see Lifecycle).
- A request about **one library** still goes through this skill; name it
  `UPGRADES_<YYYY-MM-DD>_<LIB>.md` / `.FR.md`.

## 6. File template

```markdown
# Library upgrades — <YYYY-MM-DD>

## Table of contents
- [Summary](#summary)
- [Group: server](#group-server)
  - [parse-server](#parse-server)
- [Group: web + bo](#group-web--bo)
  …
- [Recommended order](#recommended-order)
- [Remaining](#remaining)

## Summary

| Library | Apps | Installed | Latest | Behind | Type | Urgency | Effort |
|---|---|---|---|---|---|---|---|
| parse-server | server | 9.10.0 | 9.10.5 | 5 patches | patch | 🔴 security | XS |

> One row per library. "Type" = patch / minor / major. "Urgency" = 🔴 security or blocking,
> 🟠 useful, 🟢 optional.

## Group: <apps>

### <library>

(see section 7)

## Recommended order
Numbered list: which upgrade first, which together, which to postpone, and why.

## Remaining
Items ⏳ with a one-line status each (see Lifecycle).
```

## 7. How to fill each library section

Same order every time:

```markdown
### <library>

**Apps**: server · **Installed**: 9.10.0 · **Latest stable**: 9.10.5 · **Behind**: 5 versions

#### What changed
**9.10.1 (Sept 24)**
- 🔒 <security fix> (GHSA-…)
- <bug fix or feature>

*Not stable yet*: 9.10.6-alpha.1 … (what they fix)

> No features at all? Say it plainly: "No functional change: fixes only."
> Mark ✨ features, 💥 breaking changes, 🔒 security fixes.

#### Dependencies to update with it
| Library | Current → required | Why |
|---|---|---|

#### Impact on portfolio-platform
What of the above touches code we really have (grep the repo: LiveQuery? an adapter? a removed
API?). Name the files/features concerned, and say "not used here" when it is not.

#### Recommendation
One of **Update now / Plan / Wait / Do not update**, then 2–4 lines of why. Name the risk and a
safeguard (branch, tests to run, rollback).

#### Effort estimate
**Effort: S** (≈ 0.5 d) — table by step:
| Step | App | Effort |
|---|---|---|
| Bump + `pnpm install` | root | 0.1 d |
| Adapt the code | web | 0.5 d |
| Checks (`nx run-many -t lint typecheck build test`, `check-i18n`) | all | 0.3 d |

#### Code excerpt
Only when the migration changes code: the **before / after** of the real call sites found in the
repo (checked, never invented), in a fenced block with the file path above it. Skip for a plain bump.
```

## 8. Effort scale

| Size | Duration | Typically |
|---|---|---|
| XS | < 1 h | patch/minor with no code change, `pnpm update` + checks |
| S | ≈ 0.5 d | minor with a few adjustments, one app |
| M | 1–2 d | risky minor or simple major, 1–2 apps |
| L | 3–5 d | major with API changes, several apps or linked dependencies |
| XL | > 1 wk | platform jump (Next major, React major, Parse Server major with data migration) |

Always include the **test cost** (lint, typecheck, build of every app, unit tests, Storybook tests of
web, a manual pass of the BO and the public site) and the **release cost** (server redeploy, BO
build copied into the server with `pnpm copy`). Say which assumptions the estimate rests on.

## 9. Writing rules

- Every claim comes from a release note, a changelog, the registry or the repo — never from memory.
  A date or version you did not read is not written.
- Group by apps first, then by library; same section order everywhere.
- Code excerpts are real: `Grep` the call site first, give its path.
- One line per change, advisory ids kept; no marketing rewrite.
- Code comments or code files never cite this report.
- Both language files carry the same content and are changed together.

## 10. Lifecycle

The report is **ephemeral**: a finished item is deleted in the same task, git keeps the history.

- Library upgraded and verified → remove its section and its row (both languages).
- Every library done → delete the whole report.
- Decided "do not update" or blocked → keep it, marked ❌ with the reason, and list it in
  "Remaining" as `⏳ to do` or `⏳ product decision`.
- A new run supersedes the old one: carry the open items over, delete the old files.

## 11. Final message to the user

Short: the path of the report, the summary table (one line per library), the 🔴 items first, the
recommended order, and the total effort. Say explicitly which changelogs could not be read. Do not
paste the whole report. Do not run the upgrades, and do not commit — wait to be asked.
