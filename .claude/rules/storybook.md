---
paths:
  - "apps/web/**/*.{ts,tsx}"
---

# Storybook Rules — `apps/web`

Storybook (`@storybook/nextjs-vite`, with the a11y and vitest addons) exists in **`apps/web` only**.
`apps/bo` has no Storybook; if one is added later, extend this file instead of copying it.

- Config: `apps/web/.storybook/` (`main.ts`, `preview.tsx`)
- Stories: `apps/web/stories/**` (a `*.stories.ts(x)` file next to the other stories, mirroring the source path)
- Commands: `pnpm nx run web:sb` (dev, port 6006), `pnpm nx run web:test-storybook` (every story as a browser test)

---

## A new generic component gets a story

**Every new component created in `apps/web/components/` must have a default story created in the same task.**
A generic component without a story is considered incomplete. The story is created immediately
alongside the component — never deferred to a later task.

Domain containers (`apps/web/containers/`) are storied when they are props-only and visually
meaningful (a card, a form); not every container needs one today.

**Minimum story:** a single `Default`-style export with realistic props. Add `Loading` / `WithError` /
domain variants whenever the component has those states.

**When a prop is added to an existing component, its story is updated in the same task:**

- Add the new prop to the `args` of the story `meta` (with a sensible default value)
- Add a story variant if the prop introduces a distinct visual state (`Disabled`, `WithIcon`…)
- Never leave a story out of sync with its component's props

---

## File location and title

| Component location | Story file | `title` |
|---|---|---|
| `components/Alert.tsx` | `stories/components/Alert.stories.ts` | `'Components/Alert'` |
| `components/buttons/Button.tsx` | `stories/components/buttons/Button.stories.ts` | `'Components/Button'` |
| form inputs | `stories/components/forms/inputs/…` | `'Components/Forms'` group (follow the existing files) |
| `containers/<domain>/X.tsx` | `stories/containers/<domain>/X.stories.tsx` | `'Containers/<Domain>/X'` |

**File name = component name** (`Alert.tsx` → `Alert.stories.ts`). Follow the sibling stories for the
exact shape (`satisfies Meta<typeof Component>`, `StoryObj<typeof meta>`, `tags: ['autodocs']`).

---

## What a storyable component must look like

- All data and callbacks come via **props**
- No server calls (Parse, server actions, `fetch`) — decouple first, then story
- No router side effects (`useRouter().push`) — pass a callback instead
- Use `fn()` from `storybook/test` for callbacks

## What NOT to story

| Layer | Reason |
|---|---|
| `app/**/page.tsx`, `layout.tsx` | Server components, data fetching and routing |
| Any component that fetches data or calls a server action itself | Decouple first, then story |

---

## Decorators and providers

`apps/web/.storybook/preview.tsx` already mounts the global providers (`NextIntlClientProvider`,
`ThemeProvider`, fonts, `globals.css`, the viewport presets). A story never adds them again.

---

## Story language and fixtures

- All hardcoded strings used as test data in stories (messages, labels, placeholders) are written in **English**.
- Never redeclare a domain object inside a story when a shared fixture exists — import it. A fixture
  is internally consistent (a status and the data it implies agree).
- No remote asset in a fixture: an external URL renders blank offline. Use a file from `public/` or a `data:` URI.
- Never use a hard-coded color in a story — see `theming.md`. The a11y addon must stay clean — see `accessibility.md`.

---

## Share the story links at the end of the task

Whenever a coding task **creates or modifies a story file**, the final message to the user must list
the direct link of **every story variant touched**, so they can open each one in one click.

**URL format:** `http://localhost:6006/?path=/story/<story-id>` (start it with `pnpm nx run web:sb`).

**Story id:** the `title` in lowercase, with every `/` and space replaced by `-`, then `--`, then
the name of the exported story in kebab-case.

```
title: 'Components/Alert'   export const Alert   →  components-alert--alert
```

- Give the command that starts the Storybook once, then one link per variant, grouped by story file.
- If a changed component is **not** visible in any story, say so explicitly instead of omitting it,
  and offer to add the missing story.
