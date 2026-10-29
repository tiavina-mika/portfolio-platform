# Naming Conventions

## Files

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `Button.tsx`, `ProjectCard.tsx` |
| Pages (bo) | PascalCase | `Profile.tsx` |
| Hooks | `useXxx.ts` | `useDebounce.ts` |
| Services | `domain.service.ts` | `email.service.ts` |
| Redux actions (bo) | `domain.action.ts` | `article.action.ts` |
| Redux reducers (bo) | `domain.reducer.ts` | `article.reducer.ts` |
| Types | `domain.type.ts` | `article.type.ts` |
| Validations | `domain.validation.ts` (singular) | `article.validation.ts` |
| Utils | `concern.utils.ts` | `date.utils.ts` |
| Constants (client apps) | `domain.constants.ts` | `cms.constants.ts` |
| Config/other | `kebab-case` | `app-config.ts` |
| Markdown docs | `UPPER_SNAKE_CASE.md` (EN default) or `UPPER_SNAKE_CASE.LANG.md` | `MONOREPO.md`, `MONOREPO.FR.md` |

> Some existing files use the plural `domain.validations.ts` (mostly in `apps/web` and parts of `apps/bo`).
> Name new files with the singular form above; don't rename old ones as a side effect of an unrelated task.
>
> Markdown language suffix: English is the default — omit the suffix for English files. Add a suffix only for non-English files (e.g. `.FR`, `.MG`).
>
> **Exception — `README.md`:** always English, always named `README.md`, never translated (no `README.FR.md`). See `markdown-docs.md`.

Server-specific file patterns (`cloud/functions/domain.functions.ts`, …) are in
`apps/server/.claude/rules/naming-conventions.md`.

## Folder names — always English

**Every folder name in the repository must be in English**, regardless of the language of the
files it contains. A folder holding French-language docs (`.FR.md` files) still gets an English
name — the `.FR` suffix on the *file* is what marks the content as French, the *folder* name never
carries a language marker or a non-English word.

Use `kebab-case` for multi-word folder names (same convention as `Config/other` files).

```
docs/features/bo/articles/            ✅ English folder names, French files inside
docs/cas-utilisation/articles/        ❌ "cas-utilisation" is French — rename to "use-cases"
```

This applies everywhere a folder is created or renamed: `docs/`, `src/` sub-folders, etc.

## Domain folders — always singular

A sub-folder that scopes a container/page/route/constants file to one business domain
(`containers/<domain>/`, `pages/<domain>/`, `routes/<domain>/`) is always **singular** in new code,
regardless of how many entities or files it holds — it names a *domain/module*, not a collection of
instances.

```
containers/project/    ✅ (not containers/projects/)
containers/article/    ✅ (not containers/articles/)
```

This is distinct from top-level plural folders that literally hold a list of same-type files
(`components/`, `services/`, `containers/`, `constants/` themselves) — those stay plural. Existing
plural domain folders (e.g. `apps/bo/src/pages/articles/`, `apps/web/containers/articles/`) are not
renamed as a side effect of an unrelated task; follow the folder's existing name when adding a file
to it.

## Split files — one folder per file split in several

When a file grows too large (over ~800 lines) and is split into several, the pieces go into a folder
named after the original file, and the main piece keeps its name inside it. The other pieces drop
the prefix the folder already carries:

```
utils/cms.utils.ts   →   utils/cms/cms.utils.ts, utils/cms/seo.utils.ts, …
```

A file moved without being split stays flat. Never add a barrel `index.ts` re-exporting the pieces —
consumers import from the piece that owns the symbol.

## Markdown file placement

When generating `.md` files, place them in `docs/` at the monorepo root (apps have no `docs/` of
their own for new documents):

- **Default:** the matching `docs/` sub-folder
- **Custom location explicitly requested by the user:** use that location instead

Never drop generated `.md` files at the root of an app or at the monorepo root unless the user explicitly asks for it.

### `docs/` layout

Docs are classified by audience first, then by topic:

- `docs/getting-started/` — onboarding for new developers.
- `docs/code/` — everything that is code or touches the code: permanent (`architecture`, and
  `adr`, `guides`, `runbooks`… when needed) and ephemeral (`audit`, `design`, `reviews`, `todo`,
  `upgrade`).
- `docs/services/` — external services (README index).
- `docs/features/` — non-technical feature docs per app (`bo`, `web`), French only.
- `docs/inventory/` — the census of env variables and Cloud Code (see `inventory.md`).

Inside a folder, the **file name is always English**; the language is carried by the sub-folder and
the suffix: `en/NAME.md` and `fr/NAME.FR.md`. Create `en/` or `fr/` only when it holds a file. A
tracking doc of what is left ends with `_REMAINING`. There is no `done/` folder: what is finished is
deleted (see `implementation-completeness.md`).

## Identifiers

| Thing | Convention | Example |
|---|---|---|
| Variables / functions | `camelCase` | `getUserById` |
| React components | `PascalCase` | `ProjectCard` |
| Types | PascalCase | `Locale`, `DownloadFileInput` |
| Interfaces | `I` prefix; a Parse object's fields end in `Attributes` | `IProjectAttributes`, `ICategory` |
| Enums | PascalCase + `Enum` suffix | `CategoryEntityEnum`, `SettingsTabEnum` |
| Constants | `UPPER_SNAKE_CASE` | `USE_MASTER_KEY`, `COLLECTIONS` |
| Zod schemas | `camelCase` + `Schema` suffix | `projectSchema`, `projectFilterSchema` |
| Parse Cloud Function names | `camelCase` string | `'getProjects'` |
| Parse Job names | `camelCase` string ending in `Job` | `'sendArticleToNewsletterJob'` |
| Booleans | `is/should/has/can/did/will` prefix | `isAuthenticated`, `hasError` |

## Constants placement

**Goal:** any developer who wants to read, add, or change a constant must know exactly where to look — no hunting through component or service files.

Constants must live in the constants file of the app/lib — never inline in the file that uses them (unless they are truly local to one function and used nowhere else).

| Scope | Location |
|---|---|
| Shared by several apps | `libs/shared-constants` (generic) or `libs/shared-domain-constants` (domain-specific) |
| `apps/server` | `src/utils/constants.ts` (`USE_MASTER_KEY`, …) |
| `apps/bo` | `src/constants/<domain>.constants.ts` |
| `apps/web` | `utils/constants.ts` |

**Rules:**
- Every constant that could be reused or that someone might need to change **must** be in a constants file — not buried in a page, service, or component file
- Never scatter the same constant across multiple files — define once, import everywhere; if two apps need it, move it to a `libs/shared-*`
- When adding a new domain value (e.g. a new role), the shared lib is the only place to edit
- **Constants files must only export plain constants** (`const`, `as const`) — never functions, classes, hooks, or enums
- **Enums belong in `types/`** — see `typescript.md` for the enum placement rule
- **Functions belong in `utils/`**

```ts
// ❌ constant defined in the consuming file — invisible to others
// src/pages/articles/ArticleList.tsx
const ARTICLES_PAGE_SIZE = 20;

// ✅ defined in constants — easy to find and extend
// src/constants/cms.constants.ts
export const ARTICLES_PAGE_SIZE = 20;
```

## Language rule

All identifiers, file names, comments, and error messages must be in **English**.
User-facing strings go through the i18n translation system only.
