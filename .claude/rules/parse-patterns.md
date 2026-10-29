# Parse Patterns — Schema and Queries

Server-only Cloud Code rules (query location, jobs, master key) are in
`apps/server/.claude/rules/parse-patterns.md`. This file holds what applies to **every** app.

## Client-side (web / bo)

- Parse is initialized once per app (`apps/bo` at startup, `apps/web` in its Parse utils) — never re-initialize
- Never use the master key on the client

---

## Schema design — whenever a stored field is added or changed

Parse is a thin layer over MongoDB: **every field you add is a Mongo document field, and the
shape you pick decides whether it can ever be indexed, filtered or aggregated.** Before adding or
reshaping a field (a new column, a nested object, a denormalized snapshot), answer these three
questions *in the proposal, not after the code is written*:

1. **How will this be read?** By id only, or filtered/sorted/counted across the collection?
2. **Does it need an index?** Anything the BO, a job, or a list endpoint filters or sorts on does —
   declare it in code (server startup / migration), never by hand in Compass/Atlas, and mention it
   in the change.
3. **Can it grow without bound?** A document is capped at 16 MB, and a growing embedded array is
   rewritten in full on every update — past a few dozen entries it belongs in its own collection.

### Never use data-dependent keys in a stored object

An object key must come from a **fixed, enumerable set** the code declares (`fr`/`en`/`mg`, a status,
a locale). A key built from data — a `userId`, an email address, a date, an id of any kind — cannot be
indexed or queried, makes the schema grow one key per row of data, and forces `$where`/aggregation for
questions a plain index should answer. Use an array of objects with a fixed key set instead.

```ts
// ❌ email address as a key — no index possible
subscribers: { 'a@x.com': 'confirmed', 'b@x.com': 'pending' }

// ✅ array of objects with a fixed key set — indexable and queryable with $elemMatch
subscribers: [{ email: 'a@x.com', status: 'confirmed' }, { email: 'b@x.com', status: 'pending' }]

// ✅ fixed enumerable keys are fine — locales are a schema, not data
translated: { fr: { title: '…' }, en: { title: '…' } }
```

### Other modelling rules

- **Store the value you will query on**, not one you have to compute at read time.
- **Denormalized snapshots** are for display only — never filter or sort on them; they go stale by
  design. Query the source collection instead.
- **Enum-backed strings over booleans** when a third state is plausible: widening
  `'draft' | 'published'` costs nothing, replacing `isPublished: boolean` costs a migration.
- **Adding a field to an existing collection never backfills old rows** — read paths must treat it
  as possibly `undefined`, and if old rows genuinely need a value, say so explicitly (a one-off
  job, tracked per `implementation-completeness.md`).
- **A new query pattern on an existing collection is a schema decision too** — check whether an
  existing index covers it (Mongo only uses a compound index from its leading field).

---

## Query discipline — `select()` and `limit()` (server + client)

**Call `.select()` and `.limit()` on every Parse query that can return more than a handful of rows
or large documents.**

### `limit()`

- Add `.limit()` when the query can return a variable or large number of results (list endpoints,
  paginated queries, background jobs).
- Never use a magic number — use a named constant (define it in the app's constants file when none
  exists yet) or a value coming from the caller's pagination params.
- Omit `.limit()` only when the result set is guaranteed to be small (a single object by id, a
  collection that will never exceed a handful of rows — roles, app settings).

```typescript
// ❌ unbounded query on a potentially large collection
const articles = await new Parse.Query(COLLECTIONS.Article).find(USE_MASTER_KEY);

// ✅ paginated list — explicit limit
const articles = await new Parse.Query(COLLECTIONS.Article)
  .limit(limit)
  .skip(skip)
  .find(USE_MASTER_KEY);

// ✅ single fetch by id — no limit needed
const article = await new Parse.Query(COLLECTIONS.Article).get(id, USE_MASTER_KEY);
```

### `select()`

- Call `.select([...fields])` and fetch only the fields the caller actually uses.
- Never fetch the full document when only a subset of fields is needed.

```typescript
// ❌ fetches every field including large translated content
const projects = await new Parse.Query(COLLECTIONS.Project).find(USE_MASTER_KEY);

// ✅ fetches only what a list needs
const projects = await new Parse.Query(COLLECTIONS.Project)
  .select(['translated', 'logo', 'previewImage', 'slug'])
  .limit(limit)
  .find(USE_MASTER_KEY);
```

**Why:** omitting `select()` sends unnecessary data over the wire and loads large nested objects into
memory; omitting `limit()` silently truncates results at Parse Server's internal cap and makes
queries unpredictable under load.
