# Implementation — add a test runner to the server

## Goal

`pnpm nx run server:test` runs Vitest on the server's unit tests, locally and in the CI "unit tests" job.

## Read

- The ticket, `.claude/rules/engineering-principles.md` (BDD / TDD section), `apps/server/CLAUDE.md`.
- `apps/server/package.json`, `project.json`, `tsconfig*.json`, `.swcrc`, `eslint.config.mjs`.
- `apps/web/vitest.config.ts` (same runner, browser-only Storybook project there).
- `.github/workflows/ci.yml`, job `test` (`nx affected -t test --exclude=server,web,aldaron-web`).

## Apps touched

- `server`: yes (runner, config, example test, build exclusion).
- `web`, `bo`, `aldaron-web`, `libs/shared-*`: no (no behaviour change; bo keeps no runner, out of scope).
- CI: the `test` job stops excluding `server`.

## Approach

- Vitest (decided by the human on 2026-11-22), same major as `apps/web` (`^4.1.10`), in the server's
  devDependencies.
- `apps/server/vitest.config.ts`: Node environment, `src/**/*.test.ts`, the `@/` alias mapped to `src/`
  (the alias of `tsconfig.json` and `.swcrc`).
- Nx target `test` in `apps/server/project.json`, running `pnpm test` (`vitest run`), like the other
  targets of the project. `targetDefaults.test.cache` already exists in `nx.json`.
- Tests sit next to the code (`*.test.ts`), typechecked with the rest of `src/` (the build typecheck sees
  them, vitest ships its own types) but not compiled into `dist/`: `swc --ignore "**/*.test.ts"`.
- `vitest.config.ts` is added to the `include` of `tsconfig.json` so that the type-aware ESLint finds it
  (`tsconfig.build.json` overrides `include`, so the build is not concerned).
- Example test: `src/utils/_core/pii.utils.ts` (pure masking functions, no Parse, no env).
- Discarded: Jest (the human chose Vitest); `@nx/vite` plugin inferred targets (the workspace declares
  explicit `command` targets everywhere, one style).

## Files touched or created

| Path | Role |
|---|---|
| `apps/server/package.json` | `vitest` devDependency, `test` script, swc ignores tests |
| `apps/server/project.json` | `test` target |
| `apps/server/vitest.config.ts` (to create) | runner config |
| `apps/server/tsconfig.json` | include the config file for lint |
| `apps/server/src/utils/_core/pii.utils.test.ts` (to create) | example test |
| `.github/workflows/ci.yml` | `test` job runs the server |
| `apps/server/CLAUDE.md` | runner documented |
| `.claude/rules/engineering-principles.md` | wording "no runner" updated |
| `.claude/skills/dev/SKILL.md` | wording "only web has a runner" updated |
| `pnpm-lock.yaml` | lockfile |

## Steps

1. Install vitest in the server, add script and target, config.
2. Write the example test, run it.
3. Exclude tests from the swc build, check `dist/` holds no test.
4. CI and docs.
5. lint, typecheck, test, build of the server.

## Data and security

None.

## Docs and inventory

No env variable, service, Cloud Function. No `docs/features` change (no user-facing change).

## Risks

- A test file compiled into `dist/` would import `vitest` at runtime in production: guarded by the swc
  ignore and checked after the build.
