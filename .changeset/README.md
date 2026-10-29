# Changesets

Every change that reaches users of an app (`server`, `web`, `mobile`, `bo`) comes with a changeset:

```bash
pnpm changeset
```

Pick the apps it touches, the bump (`patch` fix, `minor` feature, `major` breaking) and write one
sentence a reader of the changelog understands. Commit the generated file with the change.

A release then runs `pnpm version-packages`: it bumps each app's `version`, writes its `CHANGELOG.md`
and consumes the changesets. Internal-only changes (tooling, docs, refactors) need none.
