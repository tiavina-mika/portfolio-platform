# CLAUDE.md — web/

Next.js public website of the portfolio platform: projects, articles, CMS pages, contact form and
newsletter subscription.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| UI components | Radix UI primitives + shadcn/ui pattern (`components.json`) |
| Forms | react-hook-form + Zod + next-safe-action |
| i18n | next-intl (locale in URL: `/[locale]/...`; translations in `translations/<locale>/`) |
| Backend | Parse SDK (`parse`), queries in `server/queries`, mutations in `server/mutations` |
| Rich text | TipTap (`tiptap-parser`) |
| Testing | Vitest + Storybook (`@storybook/nextjs-vite`) |
| Package mgr | pnpm (single workspace root) |

---

## Commands

```bash
pnpm nx run web:dev       # nodemon + custom Express server (server.js), APP_ENV=development
pnpm build                # next build (build:preprod / build:prod set APP_ENV)
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint --fix
pnpm nx run web:sb        # Storybook dev server (port 6016)
pnpm build-sb             # Storybook static build
pnpm test-storybook       # every story as a browser test (Vitest + Playwright)
pnpm format               # prettier --write
```

---

## Source Layout

```
app/
├── [locale]/
│   ├── articles/     # Article listing + detail
│   ├── projects/     # Project listing + detail
│   ├── contact-me/   # Contact page
│   ├── newsletter/   # Newsletter subscription
│   ├── sitemap/      # Human sitemap
│   └── [slug]/       # Dynamic CMS pages
├── api/              # Route handlers
components/            # Generic reusable UI components
containers/            # Domain / page containers (articles, projects, home, contact…)
hooks/                 # Custom React hooks
providers/             # React context providers (theme, translations)
server/                # queries/, mutations/ — Parse access from the Next.js server
utils/                 # Utility functions (parse, cms, translation, server…)
validations/           # Zod schemas
types/                 # TypeScript types
i18n/                  # next-intl config
translations/          # Translation JSON files (en, fr, mg)
stories/ .storybook/   # Storybook
config/ public/
```

---

## Dev Server

`pnpm dev` runs Next.js through a custom Express wrapper (`server.js`) via `nodemon`, not the plain
`next dev` CLI. Keep this in mind when debugging middleware or headers: they may originate in
`server.js` or `proxy.ts`, not in Next.js route handlers.

---

## Conventions

- Containers stay props-only, no Redux (there is none); data comes from server components /
  `server/queries`, mutations go through next-safe-action (`server/mutations`).
- Colors come from the theme tokens (`theming.md`); public pages follow `accessibility.md`.
- Storybook rules: `.claude/rules/storybook.md` (root).

---

## Adding a New Page/Route

Checklist when adding a new localized route (e.g. `/[locale]/faq`):

1. `app/[locale]/faq/page.tsx` — the route (and `generateMetadata` for SEO)
2. `containers/faq/` — feature container(s) composing the page content
3. `server/queries/` / `server/mutations/` — data access, if the page needs it
4. `validations/faq.validations.ts` — Zod schemas, if the page has forms
5. Translation keys in `translations/{en,fr,mg}/…json` (`pnpm check-i18n` must pass)
6. Navigation entries/links where relevant (navbar, footer, sitemap — `app/sitemap.ts`)
7. Update `docs/features/web/` (see `.claude/rules/feature-docs.md` at the root)
