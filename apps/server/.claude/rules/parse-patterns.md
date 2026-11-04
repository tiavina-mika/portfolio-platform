---
paths:
  - "apps/server/src/**/*.ts"
---

# Parse SDK Patterns — Cloud Code

Schema design and `select()` / `limit()` discipline apply to every app: see the root
`.claude/rules/parse-patterns.md`.

## Server-side (Cloud Code)

- Collection names come from `collections` (`@/constants/_core/constants`) for the core classes and from
  `DOMAIN_COLLECTIONS` (`@shared/domain-constants`) for the domain ones — never hardcode a collection name string
- Always use the `USE_MASTER_KEY` constant (`{ useMasterKey: true }`, from `@/constants/_core/constants`) for admin operations
- Cloud Functions use the `parseFunction()` wrapper (`cloud/utils/_core/utils.cloud.ts`); validation goes through
  `parseFunctionValidation()` / `parseTriggerValidation()` when needed
- `fromBO()` guards Cloud Functions that only the back-office may call
- Use the `setValues()` utility (`src/utils/_core/utils.ts`) for bulk-setting Parse object fields
- Master key operations only in server-side Cloud Code, **never on the client**

## Parse Query location rule

**All `Parse.Query` calls must live in a `cloud/services/` file — never inline in Cloud Functions, triggers, jobs, or controllers.**

```
cloud/
├── functions/   ← orchestration only — call service functions, never new Parse.Query() here
├── triggers/    ← orchestration only
├── jobs/        ← orchestration only
└── services/    ← ALL Parse.Query calls go here, one file per domain
```

```typescript
// ❌ Query inline in a Cloud Function — forbidden
Parse.Cloud.define('getArticle', parseFunction(async (request) => {
  return new Parse.Query(COLLECTIONS.Article).get(request.params.id, USE_MASTER_KEY);
}));

// ✅ Query isolated in the service layer
// cloud/services/article.service.cloud.ts
export const getArticleById = async (id: string): Promise<Parse.Object> => {
  return new Parse.Query(COLLECTIONS.Article).get(id, USE_MASTER_KEY);
};

// cloud/functions/article.functions.ts
Parse.Cloud.define('getArticle', parseFunction(async (request) => getArticleById(request.params.id)));
```

**Why:** queries in services are reusable across functions, triggers and jobs, and easy to audit for
missing `select()` / `limit()` calls.

> Existing code may still query inline in a function/job file (for example the `*.jobs.ts` files).
> Don't leave the pattern in code you write; move an existing query to a service when you touch it
> for another reason and the move is small.

## Prefer Parse Jobs for background work

**Any task that does not need to return a result to the caller immediately must be offloaded to a Parse Job.**

Use `runJob()` (from `cloud/utils/_core/job.utils.cloud.ts`) inside Cloud Functions or triggers to fire a
job asynchronously instead of awaiting the work inline.

```typescript
// ❌ heavy work blocking the Cloud Function response
Parse.Cloud.define('deleteCategory', parseFunction(async (request) => {
  await updateLinkedItems(category);   // slow
  await notifyOwners(category);        // slow
}));

// ✅ heavy work offloaded to a Parse Job
Parse.Cloud.define('deleteCategory', parseFunction(async (request) => {
  category.set('deleted', true);
  await category.save(null, USE_MASTER_KEY);
  await runJob('updateLinkedCategoryItemCountJob', { id: category.id });
}));
```

**When to use a Parse Job:**
- Cascading updates across multiple collections
- Sending emails or newsletters after a state change
- Cleanup tasks (recycle bin, expired records)
- Any `find()` + batch `save()` loop over more than a handful of documents

**When NOT to use a Parse Job:**
- The result must be returned synchronously to the client (validation, read queries)
- The operation is a single atomic write on one document

A job that is defined must be wired: see `implementation-completeness.md`.
