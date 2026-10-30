/*
 * `parse` now ships its own bundled types, so TypeScript prefers them over the separately
 * installed `@types/parse` for every `import ... from 'parse'` — meaning `@types/parse`'s
 * `declare global { namespace Parse {...} }` (the thing that makes `Parse.Object`/`Parse.User`
 * work as *type* annotations across `src/cloud/` without an import) never loads on its own
 * anymore. The `var Parse` below only covers the global *value*; force the *type* namespace
 * in too, in the same file, so the merge isn't sensitive to cross-file processing order.
 */

/// <reference types="parse" />

declare global {
  var Parse: typeof import('parse/node');
}
export {};
