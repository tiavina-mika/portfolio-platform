# Documentation Map

## Table of Contents

- [I am…](#i-am)
- [Structure](#structure)
- [Rules](#rules)

## I am…

| Role | Start with |
|---|---|
| Developer | [getting-started/](getting-started/README.md), then [the architecture](code/architecture/en/MONOREPO.md) |
| Anyone who needs to know what a screen does | [features/](features/README.md) |
| Anyone looking for what the project runs on | [inventory/](inventory/README.md) and [services/](services/README.md) |

## Structure

| Folder | Audience | Content |
|---|---|---|
| [getting-started/](getting-started/README.md) | New developers | Install, run, first change |
| [code/](code/architecture/en/MONOREPO.md) | Developers | Architecture (domain model, auth, rights, emails, errors, i18n, deployment) and ADRs; guides, runbooks, testing and upgrade notes are added here as they are written |
| [services/](services/README.md) | Developers | One entry per external service, with a guide for the ones that need one |
| [features/](features/README.md) | Non-technical readers | What each back-office and website screen does (French) |
| [inventory/](inventory/README.md) | Developers | Census of env variables, Cloud Code and external services |

## Rules

- Classify by audience first, then by topic.
- File names are English; language is carried by the `en/` or `fr/` sub-folder and the `.FR` suffix, created only when they hold a file.
- Every `.md` file starts with a clickable table of contents; a translated doc and its twin change together (`pnpm check-doc-twins`) and every relative link resolves (`pnpm check-doc-links`).
- Permanent docs are updated in place; ephemeral docs (audit, todo) are deleted once finished.
