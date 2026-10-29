# Code Style

- ESLint + Prettier enforced via a husky pre-push hook (`pnpm nx affected -t lint typecheck`) — run `pnpm lint` to fix
- Mechanical style (arrow functions, import order, indentation, trailing commas) is already
  autofixed by ESLint/Prettier when you run lint — see `libs/config/eslint` and
  `libs/config/prettier`; no need to hand-apply it
- **Max line length: 110 characters** — watch it manually, ESLint does not enforce it everywhere
- **ESLint errors must always be fixed** — never leave an ESLint error unresolved or silence it with `eslint-disable` unless there is truly no other option and the user has explicitly agreed
- **cspell warnings must always be fixed by adding the flagged word to the dictionary** — add it to the `words` array in the relevant app's `.cspell.json` (`apps/server/.cspell.json`, `apps/bo/.cspell.json`, `apps/web/.cspell.json`); never reword a valid domain term just to silence the warning
- Lodash available and encouraged for data manipulation
- **All imports must be at the very top of the file**, before any code, types, constants, or exports — never insert imports in the middle of a file
- **Import style must match the export style** — before writing any import, check how the module exports its value and mirror it exactly (see section below)
- Package manager: **pnpm** — never `npm`, `yarn`, or `bun`
- Always use **async/await** — never `.then()` / `.catch()` chains

## Imports — default vs named

**Before writing any import, open the source file and check how it exports.**
The import syntax must exactly match the export syntax — never guess.

| Export in source | Correct import |
|---|---|
| `export default MyComponent` | `import MyComponent from '@/components/MyComponent'` |
| `export const useDebounce = ...` | `import { useDebounce } from '@/hooks/useDebounce'` |
| `export default fn` + `export const helper` | `import fn, { helper } from './module'` |

```tsx
// source: export default Alert
import Alert from '@/components/Alert';          // ✅
import { Alert } from '@/components/Alert';      // ❌ runtime undefined

// source: export const useDebounce = ...
import { useDebounce } from '@/hooks/useDebounce'; // ✅
import useDebounce from '@/hooks/useDebounce';     // ❌ runtime undefined

// source: export default Screen + export type Props
import Screen, { type Props } from './Screen';    // ✅
```

**Never rely on memory or autocomplete alone** — autocomplete often suggests both forms; only one is correct.
When in doubt, read the file before importing.

### Verify every identifier is in the import list

Before using any function, selector, constant, or type from another module, **grep or read the import block** to confirm it is actually listed. An identifier can exist in the source file but be absent from the local import statement — a loose build may still bundle the file and the runtime gets `undefined`, causing silent failures that are hard to trace.

This is especially dangerous inside Redux thunks in `apps/bo` that go through a shared error/loading wrapper, because the wrapper can catch and swallow the `TypeError`, making the action silently do nothing.

---

## Comments — never cite a `.md` doc as the source

**Never mention a Markdown file path (or a section/anchor inside one, e.g. `§2`, `section 3.1`) in code or in a code comment**, whether as the justification for a design decision or as a "see also" pointer — audits, migration plans, and other generated docs (`docs/`) get rewritten, moved, or deleted once their action items are resolved (see `implementation-completeness.md`), which turns the reference into a dead/misleading pointer.

- Explain the **why** directly in the comment (the actual constraint, invariant, or reasoning) instead of delegating to an external doc
- If the doc is genuinely useful context, put the pointer in the PR description or commit message — not in the source file
- This applies to comments already in the codebase too: when you touch a file that has one of these references, rewrite the comment to state the reasoning inline instead of leaving the doc reference

```ts
// ❌ reasoning hidden behind a doc reference that will eventually rot
// see AUDIT_BO.md §2 "Version history"
const CONTENT_VERSION_RETENTION_DAYS = 30;

// ✅ reasoning stated inline — survives the doc being deleted
// keeps enough history for an editor to undo a bad publish
const CONTENT_VERSION_RETENTION_DAYS = 30;
```

---

## Spacing (client — web / bo)

**Rule: always prefer `gap` on a flex/grid container over `margin` on children.**

- Wrap sibling elements in a flex container and use `gap` — never add `margin` between siblings
- Never use `marginBottom` / `marginTop` inside a component to push siblings — let the parent own spacing via `gap`
- Never use `marginLeft` / `marginRight` between siblings — use `gap` with a row direction
- `margin` is only acceptable for spacing a block away from an unrelated layout element where adding a flex parent is not feasible
- `padding` is for internal spacing within a component only; `gap` is for spacing between sibling elements
- In `apps/web` (Tailwind): `flex flex-col gap-4`, not `mb-4` on each child. In `apps/bo` (MUI): `<Stack gap={2}>` / `sx={{ display: 'flex', gap: 2 }}`
- When reviewing or writing code, replace any `margin` used for sibling spacing with `gap` on the parent container
