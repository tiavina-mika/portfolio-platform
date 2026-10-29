# Implementation Completeness

When writing any function, API endpoint, Cloud Job, Cloud Function, cron task, or service method,
**always wire it up so it is actually called/triggered** before considering the task done.

## Cross-app completeness — never implement a feature halfway

Before starting, identify **every app a feature touches** (`server`, `bo`, `web`). If the feature
logically spans more than one — e.g. a server Cloud Function that needs a BO screen to trigger it, or
a BO action whose result must show on the public website — **implement all of them in the same
task**, not just the one or two that are easiest or most obvious.

- Stopping after `server` + `bo` when `web` also needs to react (display the new field, hide a
  deleted item) is an **incomplete implementation**, not a smaller task.
- Before considering the task done, explicitly check each of the 3 apps: "does this app need a
  change for this feature to work end-to-end?" — don't stop as soon as the primary app works.
- Shared types, constants and utils used by several apps live in `libs/shared-*`: update them first,
  then every app that consumes them.
- If an app's part is genuinely out of scope (different PR, blocked dependency), do not silently
  skip it — follow the `docs/code/todo/` process below and tell the user explicitly which app was
  left out and why.
- This still produces **one branch** per `git-branches.md`.

```
// ❌ a new `Project` field added in server (Cloud Code) + bo (form) only
// → the public website never displays it — the feature is half-functional

// ✅ same feature — server + bo + web (page, translations, sitemap if needed) implemented together
```

## No orphaned code — ever

**Never create a file, component, function, hook, skeleton, constant, or type that is not imported
and used by at least one other file before the task is considered done.**

An orphaned artifact is dead code from birth. It wastes context on every future read, misleads
the reader into thinking it is integrated when it is not, and adds maintenance cost for zero
user value.

### What "used" means per artifact type

| Artifact | Must be imported/called by |
|---|---|
| React component / skeleton | At least one parent component, page, or container |
| Custom hook (`useXxx`) | At least one component or page |
| Utility function | At least one service, hook, component, or action |
| Constant / enum | At least one file that consumes its value |
| TypeScript type / interface | At least one function signature or component prop |
| Redux selector (`apps/bo`) | At least one page, container, or hook |
| Storybook story | Automatically satisfied — it imports the component |

### When wiring the consumer is out of scope

If the call site genuinely belongs to a different PR, app, or blocked dependency, **do not silently
leave the file orphaned**:

1. Add an entry to `docs/code/todo/fr/GENERATED_TO_IMPLEMENT.FR.md` (and its `en/` twin).
2. Explicitly tell the user: *"I created X but it is not yet imported anywhere — tracked in `docs/code/todo/fr/GENERATED_TO_IMPLEMENT.FR.md`."*

### Anti-patterns

```tsx
// ❌ skeleton created but never rendered — orphaned file
// containers/project/ProjectHeaderSkeleton.tsx  ← exists
// containers/project/ProjectHeader.tsx          ← never imports ProjectHeaderSkeleton

// ✅ skeleton created AND wired in the same task
import ProjectHeaderSkeleton from './ProjectHeaderSkeleton';
const ProjectHeader = ({ project, loading }: Props) => {
  if (loading || !project) return <ProjectHeaderSkeleton />;
  ...
};

// ❌ utility function exported but never called
// utils/format.utils.ts
export const formatProjectLabel = (project: IProjectAttributes) => { ... };
// no file imports formatProjectLabel
```

## What "wired up" means per type

| Type | Required wiring |
|---|---|
| Parse Cloud Job | Called via `runJob(...)` from a trigger/service **or** scheduled via `node-cron` in `index.ts`, and imported in `cloud/jobs/index.ts` |
| Parse Cloud Function | Exported and imported in `cloud/functions/index.ts` |
| Parse trigger | Imported in `cloud/triggers/index.ts` |
| Express route / controller | Registered in the corresponding router file |
| `node-cron` task | `cron.schedule(...)` call present in `index.ts` (or dedicated scheduler file) |
| Redux action (thunk) | Dispatched from at least one page or container of `apps/bo` |
| Service function | Called from an action, trigger, controller, or Cloud Function |
| Next.js server action / query | Called from at least one page or container of `apps/web` |

## When wiring is not possible in the current task

If the call site is out of scope, **do not leave it silently unwired**. Instead:

1. Create or update `docs/code/todo/fr/GENERATED_TO_IMPLEMENT.FR.md` (and its twin).
2. Add one entry per unwired item using this format:

```markdown
## <ItemName>

- **File**: `path/to/file.ts`
- **Type**: Cloud Job | Cloud Function | Route | Cron | Action | Service
- **What it does**: one-line description
- **Needs wiring in**: file or location where the call/trigger must be added
- **Why deferred**: reason the wiring was not done in this task
```

3. Mention the file to the user at the end of the task so they know it was tracked.

## Anti-patterns

```
// ❌ job registered but never triggered
Parse.Cloud.job('sendArticleToNewsletterJob', handler);
// nothing calls runJob('sendArticleToNewsletterJob') anywhere

// ❌ route controller written but never registered in a router
export const getStats = async (req, res) => { ... };
// no router.get('/stats', getStats) anywhere
```

## Status markers in action-item docs

Any markdown doc that lists action items — audits (`docs/code/audit/`), `docs/code/todo/`, migration
plans, TODO checklists — must be kept in sync with what has actually been done, using **✅** and
**❌** directly next to the item:

- Once an item has been implemented, mark it **✅** — keep the original item text while the doc is
  still open; it's the record of what the doc originally flagged.
- If an item was attempted but turns out not implemented (blocked, out of scope, rejected), mark it
  **❌** and add a one-line reason.
- Update the doc **in the same task** that does the implementation (or the same task where the
  blocker is discovered) — never leave a doc claiming an item is still open when it was already
  handled, or silently leave a failed attempt unmarked.
- ✅/❌/⏳ markers must match on both sides of a translated twin (`markdown-docs.md`).

## What is finished is deleted — there is no `done/` folder

A finished item is not archived: git keeps the history (`git log -- <path>`). Nothing under `docs/`
is moved to a `done/` folder and no `_DONE` companion doc is created.

| Situation | Required action |
|---|---|
| An item of a doc that stays open is ✅ | Remove its row / section from the doc, in the same task |
| Every item of a doc is ✅ | Delete the whole doc (and its twin), in the same task |
| An item is ❌ or still open | Keep it in the doc (it is the record of what is left) |

Before deleting a doc, check that nothing in it is still ⏳ / ❌ — an unresolved item is carried over
(next section) first — and repair or unlink the links that other docs still point at it.

### Carry the unresolved items over into `docs/code/todo/`

Marking items ✅/❌ resolves the **doc**, not the **work**. An item marked ❌ (blocked, out of
scope, deferred, rejected-for-now) is still something the project has to do, and it vanishes from
view the moment its source doc is deleted. So **in the same task where you mark the items**, write
what was *not* done into a companion doc under `docs/code/todo/`.

| Result of your pass over the doc | Required action |
|---|---|
| At least one item marked ❌, or left open/pending | Create (or extend) the matching `docs/code/todo/` doc |
| Every single item marked ✅ | Nothing to carry over — delete the source doc |
| A `docs/code/todo/` doc already exists for that source | Append to it — never create a second one |

**Where:** `docs/code/todo/fr/` for French content, `docs/code/todo/en/` for English (twins, per
`markdown-docs.md`). Table of contents, `UPPER_SNAKE_CASE.md` / `UPPER_SNAKE_CASE.FR.md`, English folder names.

**Name:** derived from the source doc, with the `_REMAINING` suffix:
`docs/code/audit/en/ROLE_SYSTEM_AUDIT.md` → `docs/code/todo/en/ROLE_SYSTEM_REMAINING.md`.

**Content:** one entry per unresolved item, each keeping the **original wording of the source doc
verbatim** — never a rewritten summary — plus:

- the ❌ reason (why it wasn't done in that task)
- the severity/priority marker the source doc used, if it had one
- the files or apps concerned, when the source doc named them
- `⏳` as the status, so the todo doc reads like any other action-item doc

**Both sides keep a pointer** while both exist: the source doc's ❌ items stay in place with a
one-line link to the todo doc; the todo doc names its source doc at the top, with the date of the
pass that created it. When the source doc is deleted, the todo doc's header keeps the source's
name and date as plain text (no link).

#### Items waiting on a product decision → `Recommendations` section

Some items are not left undone for lack of time but because **the code can't choose on its own**:
a UX trade-off, a content rule, a policy. The **same task** that carries such an item into
`docs/code/todo/` must hand whoever decides everything they need to decide quickly:

- The item's status is `⏳ product decision` (not `⏳ to do`).
- The item links to its recommendation.
- The doc gets a **`## Recommendations`** section, listed in the table of contents, with one `###`
  sub-section per item waiting on a decision, containing: the **question to settle** (one sentence,
  answerable without reading code), two to four **options** (what the visitor/admin sees, pros and
  cons, risk, what comparable sites do — only when actually known), **exactly one option marked
  `(recommended)`**, the **recommendation** and why, and the **impact on the code** (apps and files).
- Once the decision is made, write the decision and its date under the recommendation, switch the
  item to `⏳ to do`; the recommendation goes away with the item once it is ✅.

An item deferred for time, a blocked dependency or a separate PR keeps a plain `⏳` status with no
recommendation.

A `docs/code/todo/` doc is a **list of what is left**: as soon as one of its items is ✅, remove it
from the doc in the same task, and delete the doc when its last item is ✅.

#### Anti-patterns

```markdown
<!-- ❌ audit deleted with three ❌ items and no todo doc — the work is now invisible -->

<!-- ❌ the todo doc paraphrases instead of keeping the original wording -->

<!-- ❌ a second todo doc for the same source — append to the first one instead -->

<!-- ❌ "remaining" doc still listing 31 ✅ items above the 3 that are really left -->
```

### Delete a fully-resolved audit doc

Once **every** action item in an audit doc under `docs/code/audit/` is marked ✅ or ❌ (nothing left
unmarked/pending), **and** the ❌/open ones have been carried over into `docs/code/todo/` as described
above, delete the file (and its twin). A doc with even one unresolved item stays in place until that
item is also marked ✅ or ❌, and is never deleted while an ❌ item has no home in `docs/code/todo/`.
