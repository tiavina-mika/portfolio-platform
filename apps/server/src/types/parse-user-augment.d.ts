/*
 * `@types/parse` is behind the SDK it describes: `Parse.User.verifyPassword` has shipped since
 * Parse JS SDK 3 — it checks a password against Parse Server's `/verifyPassword` endpoint without
 * creating a session — but the legacy typings never gained it. Declared here rather than cast away
 * at each call site, so the signature stays checked.
 *
 * Kept apart from `global-parse.d.ts`: that file declares `var Parse`, and a `var` and a
 * `namespace` of the same name inside one `declare global` block do not merge with the ambient
 * namespace `@types/parse` contributes.
 *
 * The rules below are disabled because this block has to mirror `@types/parse`'s own shape to
 * merge with it: the interface name and the `User` it refers to are that package's, not ours.
 */
/// <reference types="parse" />

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/method-signature-style, no-undef */
declare namespace Parse {
  interface UserConstructor {
    verifyPassword<T extends User>(
      username: string,
      password: string,
      options?: { ignoreEmailVerification?: boolean; useMasterKey?: boolean }
    ): Promise<T>;
  }
}
