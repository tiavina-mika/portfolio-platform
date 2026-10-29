---
paths:
  - "apps/*/src/**/*.{ts,tsx}"
  - "apps/web/**/*.{ts,tsx}"
  - "libs/**/src/**/*.{ts,tsx}"
---

# TypeScript Rules

- Strict TypeScript everywhere — no `any` unless absolutely unavoidable and clearly commented
- Use `unknown` and narrow, or define a proper type instead of `any`
- Use `type` for object shapes, `enum` for enumerable values, `interface` sparingly
- File-level type imports: `import type { ... }`
- Prefix interfaces with `I` (e.g. `ICategory`); the interface of a Parse object's fields ends in
  `Attributes` (e.g. `IProjectAttributes`)
- Enums use `PascalCase` + `Enum` suffix (e.g. `CategoryEntityEnum`)

---

## Enums — always prefer over raw string/number literals

**Any field that can take a known set of values must use an enum — never a plain string or number literal.**

This applies to: status fields, type fields, role fields, category fields, tabs, and any other discriminated value — whether in database objects, API payloads, Redux state, or function arguments.

```ts
// ❌ raw string literal — refactoring-unsafe, no autocomplete, invisible to grep
category.set('entity', 'ARTICLE');

// ✅ enum — type-safe, refactoring-safe, greppable
category.set('entity', CategoryEntityEnum.ARTICLE);
```

When a new value needs to be added to a field, **add a member to the existing enum first** — never add a bare string to a call site.

---

## Enum placement — always in `types/`

Enums must live in the `types/` folder of the app (or in a `libs/shared-*` lib when several apps use
them), colocated with the domain types they describe. **Never define enums in `constants/`,
`services/`, `components/`, or inline in any other file.**

| Where | Enum location |
|---|---|
| `apps/server/` | `src/types/<domain>.type.ts` |
| `apps/bo/` | `src/types/<domain>.type.ts` |
| `apps/web/` | `types/<domain>.type.ts` |
| Used by several apps | `libs/shared-domain-types` (domain) or `libs/shared-types` (generic) |

**One enum per concern, one file per domain.** If `category.type.ts` already defines
`CategoryEntityEnum`, add new members there — do not create a second file.

---

## Database field changes — update the types everywhere

**Whenever a Parse object field is added, removed, or renamed, update the corresponding
`*Attributes` interface in every place that reads or writes that object.**

The type file is the single source of truth for the shape of each domain object. Letting the type
lag behind the database creates silent `undefined` bugs that TypeScript cannot catch because Parse
uses dynamic `get()`/`set()` accessors.

| Where | File to update |
|---|---|
| `libs/shared-domain-types` | the shared type, when the shape is used by several apps |
| `apps/bo/` | `src/types/<domain>.type.ts` |
| `apps/web/` | `types/<domain>.type.ts` |
| `apps/server/` | `src/types/<domain>.type.ts`, when the server types the object |

If only one app uses the field, update only that one — but verify the others do not reference the field before skipping them.

**Never access a new Parse field in code before its type declaration exists** — add the field to the
type first, then use it.
