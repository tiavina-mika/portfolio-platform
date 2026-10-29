# Git Branch Naming Conventions

All branches must follow the pattern `<type>/<short-description>` using kebab-case for the description.

## Types

| Prefix | When to use |
|---|---|
| `feat/` | New feature or user-facing capability |
| `fix/` | Bug fix |
| `chore/` | Maintenance, dependency updates, config changes (no production code change) |
| `refactor/` | Code restructuring with no behavior change |
| `docs/` | Documentation only |
| `test/` | Adding or fixing tests only |
| `perf/` | Performance improvement |
| `ci/` | CI/CD pipeline changes |
| `hotfix/` | Urgent fix applied directly to `main` |
| `release/` | Release preparation branch |

## Rules

- **Branches are created manually on explicit user request only** — never create a branch automatically as part of a task
- **Commits are made ONLY on explicit user request** — **NEVER commit automatically after completing a task**, even if changes are staged. Wait for the user to explicitly ask to commit.
- Use **kebab-case** for the description — no spaces, no underscores, no camelCase
- Keep descriptions **short and specific** (2–5 words): `feat/project-filters`, not `feat/new-feature`
- Optionally include a ticket/issue number: `feat/123-project-filters`
- Branch off `develop` and open PRs against `develop`; `develop` is merged into `main` for production. Never commit directly to `main`
- Delete branches after merging

## Commit message format

Commits follow **Conventional Commits**, checked by commitlint (`commit-msg` hook, config in
`commitlint.config.mjs`): `<type>(<scope>): <subject>`, the scope being optional and free (an app,
several apps, or a concern: `web`, `server, bo`, `ci`, `docs`).

- `type` is one of the branch prefixes above except `hotfix`/`release`, plus `build` and `revert`
- Keep the header short (under **110 characters**)
- A change users of an app will notice also carries a changeset: `pnpm changeset`

```
feat(web): show the latest articles on the home page
fix(server, bo): refuse to delete a category that still has articles
ci: run the lint on every PR
```

## Nx workspace branching strategy

`portfolio-platform` is a **single Git repository** (Nx workspace) hosting all 3 apps
(`apps/server/`, `apps/web/`, `apps/bo/`) — there is only **one branch** to create per task,
regardless of how many apps it touches:

- Changes in `apps/bo/` only → one branch `<type>/<description>`
- Changes across `apps/bo/` + `apps/server/` → still one branch, same name, containing both sets of changes
- Changes spanning all 3 apps → still one branch

Nx's own task orchestration (`nx affected`, per-app `project.json` targets) is what keeps
builds/CI scoped per app, not separate branches per app.

## Examples

```
feat/project-filters
feat/123-newsletter-double-opt-in
fix/login-token-refresh
chore/upgrade-parse-server
refactor/cms-service-split
docs/architecture-monorepo
perf/article-list-lazy-loading
hotfix/contact-form-crash
release/v1.2.0
```

## Anti-patterns

```
# ❌ no type prefix
my-feature
user-fix

# ❌ camelCase or spaces
feat/projectFilters
feat/project filters

# ❌ too vague
feat/update
fix/bug
chore/stuff

# ❌ direct commit target
develop / main
```
