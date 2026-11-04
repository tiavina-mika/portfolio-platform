---
paths:
  - "apps/server/src/**/*.ts"
---

# Cloud Folder Scope — Parse-only

`src/cloud/` is exclusively for **Parse Cloud Code**. A file belongs there only if it directly
imports `Parse` (or a `Parse.*` type), or if its sole reason to exist is to be called by code that
does (orchestration glue between functions/triggers/jobs/services).

This is a **two-way boundary**:

1. **Parse-free code does not belong in `cloud/`** — move it to `utils/`, `types/`, `services/`.
2. **Parse code does not belong outside `cloud/`** — in particular, `src/controllers/` and
   `src/services/` (the Express-level layers) should not run their own `new Parse.Query(...)`. A
   controller talks to the Cloud Code layer via `Parse.Cloud.run(...)` or a `cloud/` service export.
   (The one-time init in `src/index.ts` is the only expected direct `Parse` use outside `cloud/`.)

## The rule

| Kind of code | Belongs in |
|---|---|
| Uses `Parse.Query`, `Parse.Object`, `Parse.Cloud.define/job`, `Parse.User`, etc. | `cloud/` (correct sub-folder — see `parse-patterns.md`) |
| Generic utility (string/date/math/retry/formatting, no Parse import) | `src/utils/` |
| Type/interface with no `Parse.Object` shape | `src/types/` |
| Constant | `src/constants/_core/constants.ts` (or `libs/shared-constants` if several apps use it) |
| Reusable service with no Parse dependency (e.g. calls an external API) | `src/services/` |

## How to decide

Ask: **"Does this file reference `Parse` anywhere, or would it break if Parse Server were removed?"**

- **NO** → move it out of `cloud/` into the matching top-level folder
- **YES** → it stays in `cloud/`, in the correct sub-folder (`functions/`, `triggers/`, `jobs/`, `services/`, `utils/`)

```typescript
// ❌ src/cloud/utils/retry.utils.cloud.ts — no Parse import, plain async retry helper
export const retryOperation = async (operation: () => Promise<any>, retries = 3) => { /* no Parse */ };
// → belongs in src/utils/retry.utils.ts, imported by cloud/ code that needs it

// ✅ src/cloud/utils/db.utils.cloud.ts — wraps Parse APIs
import Parse from 'parse/node';

// ❌ a controller running its own query
import Parse from 'parse/node';
const cached = await new Parse.Query('GeocodeCache').equalTo('lat', lat).first(USE_MASTER_KEY);
// → wrap the query in a cloud/ service and call it from there
```

## When you touch a `cloud/` file for other work

If you notice an existing `cloud/` file has no Parse dependency, move it out as part of that task
(update its imports at every call site). If moving it is out of scope for the current task, do not
leave it silently misplaced — flag it to the user and track it in `docs/code/todo/` per
`implementation-completeness.md`.
