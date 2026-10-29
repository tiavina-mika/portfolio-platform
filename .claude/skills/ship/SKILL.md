---
name: ship
description: Ship the current feature branch end to end — commit the pending changes, push, open a PR against develop, wait for CI, merge it, delete the branch (remote + local), then checkout develop and pull. On develop itself, only commit and push (no PR, no merge). Optional "no husky" pushes without the pre-push hook; the hook is also skipped automatically when only non-code files (docs, md, .claude…) changed. Use when the user says "ship", "commit push PR merge", "merge into develop", or invokes /ship.
allowed-tools: Read Bash Grep Glob AskUserQuestion
---

Takes the current branch all the way into `develop`:

```
commit → push → PR (base develop) → wait CI → merge → delete branch → checkout develop → pull
```

On **`develop`** itself the flow is shorter — no PR, no merge, no branch to delete:

```
commit → push
```

Invoking this skill **is** the user's explicit request to commit, push and merge. It covers this one
branch, this one run: never reuse it as standing permission for a later task.

Run every command with the **Bash** tool (Git Bash) from the repo root. Stop at the first step that
fails and report it — never paper over a failure to reach the next step.

## Usage

```
/ship                         → commit message and PR title derived from the diff
/ship <free text>             → used as the hint for the commit message / PR title
/ship ... one commit per topic → split the changes into several commits, one per logical unit
/ship ... no husky            → push without running the husky pre-push hook
/ship ... on <type>/<name>    → create that branch first, then ship from it
/ship ... create a branch     → create a branch (name derived from the diff), then ship from it
```

**Which branch is shipped.** Unless the text names a branch or asks to create one, ship **on the
current branch** — whatever it is — without asking or suggesting a new one. A branch is created only
when the user's text names one (`fix/foo`) or asks for one; then `git checkout -b <name>` from the
current HEAD carries the pending changes along, and the flow continues as a feature branch. When
asked to create one without a name, derive `<type>/<kebab-description>` from the diff
(`feat/`, `fix/`, `chore/`) and state it in the report.

Options are read from the free text, in French or English, anywhere in it. What is left is the
message hint.

## Step 0 — Preconditions

```bash
git rev-parse --abbrev-ref HEAD
git status --short
git fetch origin develop
```

- **Branch requested in the text** → create it with `git checkout -b <name>` and continue as that
  feature branch. Otherwise stay on the current branch: never create or switch branch on your own.
- **On `develop`** (and no branch requested) → commit and push directly (steps 1 → 3), then jump to
  step 7. **No PR, no CI wait, no merge, no branch deletion.** Push with `git push origin develop`; if
  rejected because `origin/develop` moved, `git pull --rebase origin develop` then push again.
- **Refuse on any other protected branch** (`master`, `preprod`, `production`): stop, tell the user a
  feature branch is needed and ask for its name with `AskUserQuestion` — never invent one.
- Branch names follow `<type>/<kebab-description>` (`feat/`, `fix/`, `chore/`); if not, say so but
  carry on.
- If an open PR already exists for this branch (`gh pr view --json number,state,url`), reuse it in
  step 4 instead of creating a second one.

## Step 1 — Review what will be committed

```bash
git status --short
git diff --stat
git diff              # read it — the commit message is written from this, not guessed
```

- **Never stage secrets**: `.env*` (other than `*.example`), `credentials*.json`, service-account
  files, private keys, anything under `node_modules/`. If one shows up as modified or untracked,
  leave it out and tell the user (`.gitleaks.toml` backs this up at push time).
- **By default everything else is committed**, even a file that looks unrelated to the branch. Don't
  ask; list in the report any file that looked unrelated.
- Nothing to commit and nothing ahead of `origin/develop` (`git log origin/develop..HEAD`)? Stop.

## Step 2 — Commit

Stage explicitly by path (`git add <paths>`), never a blind `git add -A` after step 1 flagged files.

Message convention — **Conventional Commits**, enforced by commitlint (`commit-msg` hook and the
`commits` job of the `CI` workflow):

- `<type>(<scope>): <imperative subject>` in **English**, no trailing period, header ≤ **110**
  chars. `type` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `build`,
  `revert`.
- The scope is free: an app (`web`), several (`server, bo`) or a concern (`ci`, `docs`, `i18n`).
- A user-visible change of an app may also need a changeset (`pnpm changeset`, see
  `.changeset/README.md`): add it in the commit when the diff has none and the README says it applies.
- Body (optional, wrapped at 72): the *why*.
- **Default: one single commit.** With "one commit per topic" → several commits, each staged by
  path, dependencies first (a `libs/` change before the app that uses it).
- End the message with the attribution trailer given in the conversation's system-reminder (the
  `Co-Authored-By:` line), if present.

```bash
git commit -F - <<'EOF'
feat(web): add the project filters on the portfolio page

<body>

Co-Authored-By: ...
EOF
```

A commit hook fails → fix the cause, `git add` again, create the commit again (never `--no-verify`,
never `--amend` a pushed commit).

## Step 3 — Push

```bash
git push -u origin <branch>
```

The husky **pre-push** hook runs `pnpm nx affected -t lint typecheck`, `pnpm check-i18n`, the
gitleaks scan (when installed), `pnpm lint:docs`, `pnpm check-doc-links` and `pnpm check-doc-twins`.
It can take several minutes — give the command a long timeout (≥ 10 min) or run it in the background.

**Skip the hook automatically when nothing it checks was touched.** List everything the push brings
in (`git diff --name-only <base>...HEAD`, `<base>` = `origin/<branch>` if it exists, else
`origin/develop`) and classify each path:

- **Code (hook needed)**: anything under `apps/*/src/`, `apps/web/app/`, `libs/`; any `*.ts`, `*.tsx`,
  `*.js`, `*.mjs`, `*.cjs`, `*.json` (locales included), `*.css`; any lint / tsconfig /
  `project.json` / `package.json` / lockfile change.
- **No code**: `*.md`, images, fonts, `.claude/**`, `.github/**`, `*.yml`/`*.yaml`, `.gitignore`…

Note: the hook also lints the Markdown docs (`lint:docs`, doc links, doc twins). If the push touches
`docs/**` or any `*.md`, **run the hook** unless the user said "no husky" — those checks are exactly
what a docs change needs. Only a push with no code **and** no Markdown change is pushed with
`HUSKY=0 git push -u origin <branch>` straight away (say so in the report). Unsure → run the hook.

**"no husky"** in the text → `HUSKY=0 git push -u origin <branch>` whatever the files; lint,
typecheck and i18n are then checked only by CI (or not at all on `develop` — say so).

- Hook fails → read the output, fix, commit the fix as a **new** commit, push again. Never
  `--no-verify`, never `--force` (`--force-with-lease` only if the user explicitly asks).
- Rejected because the remote branch moved → `git pull --rebase origin <branch>`, then push.

## Step 4 — Pull request against `develop`

```bash
gh pr create --base develop --head <branch> --title "<title>" --body-file - <<'EOF'
## Summary
- <what changed and why, one bullet per logical change — name the apps touched>
- Docs: <docs updated, if any>

## Test plan
- [x] <what was actually run: nx lint/typecheck (pre-push), check-i18n…>
- [ ] <what still needs a human: manual checks, env vars to set…>

<attribution line from the system-reminder, e.g. 🤖 Generated with [Claude Code](...)>
EOF
```

- Title: the commit header (or the hint), same format, English, ≤ 110 chars. The repo has
  `.github/pull_request_template.md` — keep its headings if they differ from the above.
- The body is for reviewers: list only checks that were really run.
- PR already open → `gh pr edit <n>` only if the body is clearly stale.
- **Post the PR number and full URL in the chat right away**, before waiting for CI.

## Step 5 — Wait for CI, then merge

```bash
gh pr checks <n> --watch --interval 30      # run in the background, wait for the notification
```

Workflows on PRs: `ci.yml` (jobs `verify` — lint, typecheck, build, docs sites, translations —
`commits` and `test`), `security.yml`, `storybook-tests.yml` and `chromatic.yml` (when web stories
changed), `lighthouse.yml`. No check reported after a couple of minutes (docs-only change) → proceed.

- **All green** → merge.
- **Any check failed** → do **not** merge on your own. Show the failing checks and links
  (`gh pr checks <n>`) and ask with `AskUserQuestion`: fix first (recommended) / merge anyway / stop.
  Merge only on an explicit "merge anyway".
- **Conflicts** (`gh pr view <n> --json mergeable,mergeStateStatus`: `CONFLICTING`) → `git merge
  origin/develop` into the branch, resolve, commit, push, wait for CI again. A non-obvious conflict →
  stop and show it.

Merge with a **merge commit**:

```bash
gh pr merge <n> --merge
```

Never `--admin`, never `--squash`/`--rebase` unless the user asks.

## Step 6 — Delete the branch, checkout develop, pull

```bash
git checkout develop
git pull --ff-only origin develop
git branch -d <branch>                 # -d, not -D: refuses if the branch is somehow not merged
git push origin --delete <branch>
git fetch --prune
```

- `git pull --ff-only` fails → stop and report; never reset `develop`.
- `git branch -d` refuses → something was not merged: stop and report, do not force-delete.
- The remote branch already gone → fine.
- `git push origin --delete` also triggers the pre-push hook: with "no husky" or a no-code ship,
  prefix it with `HUSKY=0`.

## Step 7 — Report

On `develop` (no PR): commit(s), push result, whether the hook was skipped, current state.
Otherwise:

- commit(s) created (short hash + subject),
- PR number and full URL, CI result (and any check merged "anyway"),
- merge commit on `develop`, branch deleted locally and on `origin`,
- current state: on `develop`, up to date with `origin/develop`,
- anything left for a human, copied from the PR test plan.
