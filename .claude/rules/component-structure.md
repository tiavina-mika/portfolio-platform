# Component Structure — Client Apps (web, bo)

This rule applies to **every client app**: `apps/web/` and `apps/bo/`.

---

## Function components only — never class components

React code across all clients must be written exclusively with **function components + hooks**.
Never write `class Xxx extends React.Component` (or `PureComponent`).

- Local state → `useState`/`useReducer`, never instance state (`this.state`/`this.setState`)
- Lifecycle → `useEffect`/`useLayoutEffect`, never `componentDidMount`/`componentDidUpdate`/`componentWillUnmount`
- **Error boundaries are the one structural exception**: `getDerivedStateFromError`/`componentDidCatch`
  only exist on class components in React's current API — there is no hook equivalent. Don't
  hand-write that class when a library already owns it: use the `react-error-boundary` package
  (`<ErrorBoundary FallbackComponent={...}>`, `useErrorBoundary()`), so consumer code never writes
  one. `apps/web/components/ErrorBoundary.tsx` is the existing wrapper — check it before adding another.

---

## The universal distinction: `components/` vs `containers/`

### `components/` — Generic UI primitives

**What it is:** Domain-agnostic UI building blocks reusable anywhere in the app and across any domain
or page. Examples: `Button`, `Typography`, `Card`, `Alert`, `Dialog`, `Table`, `Avatar`, `Pagination`,
`Loading`.

**Rules:**
- No knowledge of any business domain (project, article, contact…)
- No domain-specific prop names or logic
- All props are generic (`label`, `onClick`, `severity`, `children`, `variant`…)
- No `useDispatch` / `useSelector`
- No routing calls
- Stable props API — changes here affect the whole app

```tsx
// ✅ component — generic, usable in any domain or any other app
type Props = {
  severity: 'error' | 'warning' | 'info';
  children: React.ReactNode;
};
const Alert = ({ severity, children }: Props) => ( ... );
```

### `containers/` — Domain- or page-specialized components

**What it is:** Components tied to a specific business domain (project, article, contact, newsletter…)
**or** to a specific page — anything that is not reusable across unrelated domains or pages.
They implement a feature section that makes no sense outside that domain or page.
Examples: `ContactForm`, `ArticleCard`, `ProjectList`, `NewsletterSubscribe`.

A component doesn't need a raw domain object as a prop to belong here — a component built for one
specific page's layout (e.g. a hero section only the home page uses) is still a container, not a
generic `components/` primitive, even if it currently has no domain knowledge.

**Rules:**
- Scoped to one business domain, or to one page — never used across unrelated domains or pages
- May hold feature-level local state (multi-step form, accordion, tab selection…)
- Props-only in `apps/web`: no `useDispatch` / `useSelector`, no routing calls
- `apps/bo` containers follow the dispatch exception of `forms-and-state.md`

```tsx
// ✅ container — domain-specific (contact), composes generic components
const ContactForm = ({ onSubmit, loading, error }: ContactFormProps) => {
  const methods = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });
  return (
    <Form methods={methods}>
      <TextField name="email" />
      <TextField name="message" multiline />
      {error && <Alert severity="error">{error}</Alert>}
      <Button onClick={methods.handleSubmit(onSubmit)} loading={loading}>{t('send')}</Button>
    </Form>
  );
};

// ❌ domain logic inside components/ — move to containers/
// components/ProjectStatusBadge.tsx accepts a Project object → belongs in containers/project/
```

---

## Decision table

| Question | Answer → |
|---|---|
| Could this component live in any app (e-commerce, news, todo) unchanged? | `components/` |
| Is it specific to one domain of this app (project, article, contact…)? | `containers/` |
| Is it specific to one page, even without domain logic (e.g. one page's hero section)? | `containers/` |
| Does it accept a raw domain object as a prop (`project`, `article`, `user`)? | `containers/` |
| Are all its props generic (`label`, `onClick`, `severity`, `children`)? | `components/` |

**Litmus test:**
> "Could I copy this file into a completely different app, and reuse it on any page, with zero changes?"
> - YES → `components/`
> - NO (it knows about projects, articles, users… or only makes sense on one page) → `containers/`

---

## Folder layout per client

| Client | Generic components | Domain containers |
|---|---|---|
| `apps/web/` | `components/` | `containers/` |
| `apps/bo/` | `src/components/` | `src/containers/` |

---

## No folder for a single file

Inside `components/` and `containers/` (both clients), a folder exists only to group **two or more
files**. A folder holding a single component file is noise — put the file in the parent folder instead.

- One file in the folder → no folder: the component lives directly in the parent
- Two or more files (the component plus a sub-component, a skeleton, a hook, a type…) → keep the folder
- When a folder drops to one file (a file removed or merged), flatten it in the same task; when a
  second file is added to a flat component, create the folder then — not before
- Fix every import of the moved file, and move its story along (the story path mirrors the source)
- A folder that is itself a domain (`containers/project/`) is not concerned: it names a domain, and
  stays even if it holds one file today (see `naming-conventions.md`)

```
containers/home/app-preview/HomeAppPreview.tsx      ❌ alone in its folder
containers/home/HomeAppPreview.tsx                  ✅ flattened

containers/home/hero/HomeHero.tsx                   ✅ folder kept: two files
containers/home/hero/HomeHeroSkeleton.tsx
```

---

## Anti-patterns

```tsx
// ❌ domain object prop inside components/ — belongs in containers/
// components/ProjectCard.tsx
const ProjectCard = ({ project }: { project: IProjectAttributes }) => ( ... );
// ✅ move to: containers/project/ProjectCard.tsx

// ❌ generic UI primitive inside containers/ — belongs in components/
// containers/Button.tsx
// ✅ move to: components/Button.tsx

// ❌ cross-domain container — a container must belong to one domain
// containers/ProjectAndArticleMixed.tsx  → split into project/ and article/ containers
```
