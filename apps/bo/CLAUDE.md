# CLAUDE.md — bo/

Back-office admin panel of the portfolio platform (manage projects, articles, pages, categories,
contacts, users and roles).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 19 |
| UI | Material UI (MUI) v9 + Emotion |
| Routing | TanStack Router |
| State | Redux Toolkit + redux-persist |
| Forms | react-hook-form + Zod |
| Rich text editor | mui-tiptap-editor |
| Backend | Parse SDK |
| i18n | i18next + i18next-browser-languagedetector (`fr`, `en`, `mg`) |
| Package mgr | pnpm (single workspace root) |

There is no test runner and no Storybook in this app today.

---

## Commands

```bash
pnpm nx run bo:dev    # vite --mode preprod (or: pnpm dev in apps/bo)
pnpm build            # tsc + vite build
pnpm build:preprod    # vite build, env-cmd -f .env.preprod
pnpm build:prod       # vite build, env-cmd -f .env.prod
pnpm lint             # eslint --fix
```

All `VITE_*` variables are inlined in the browser bundle: none may be a secret.

---

## Source Layout

```
src/
├── pages/          # Route pages
├── components/     # Generic reusable UI components
├── containers/     # Domain containers (may useDispatch directly — see forms-and-state.md)
├── routes/         # TanStack Router route tree (public / protected)
├── redux/          # actions + reducers + store
├── hooks/          # Custom hooks
├── utils/          # Utilities
├── types/          # TypeScript types and enums
├── validations/    # Zod schemas
├── config/         # App config (http, i18n)
├── constants/      # Constants
└── assets/
```

---

## Dispatch Pattern

`apps/bo/` allows `useDispatch` directly inside `containers/` form components — there is no
requirement to lift dispatch to `pages/` and pass it down via an `onSubmit` prop. See
`forms-and-state.md` (root rules), "BO — containers may dispatch directly".

---

## Responsive Design

All BO pages and components must be usable from 360 px (mobile) to 1920 px+ (wide desktop), using
MUI's default breakpoints. See `.claude/rules/bo-responsive.md` in this app.

---

## Build Integration with Server

The BO build is copied into the server (`pnpm copy`, run from `apps/server`; `pnpm build:bo` there
does both) and served directly by the Express server — BO is not deployed as a standalone static host.

---

## Adding a New Domain Feature

Checklist when adding a new domain (e.g. `testimonial`):

1. `src/types/testimonial.type.ts` — `ITestimonialAttributes`, enums (shared shape → `libs/shared-domain-types`)
2. `src/validations/testimonial.validation.ts` — Zod schemas
3. `src/redux/actions/testimonial.action.ts`
4. `src/redux/reducers/testimonial.reducer.ts` — `createSlice` + selectors
5. Register the reducer in `src/redux/store.ts`
6. Add translation keys under the relevant i18n namespace, in every locale (`pnpm check-i18n`)
7. Add the page in `src/pages/` (+ route and sidebar entry) and containers in `src/containers/<domain>/`
8. Update `docs/features/bo/` (see `.claude/rules/feature-docs.md` at the root)
