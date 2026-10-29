# Engineering Principles

Apply these principles in order of priority. When they conflict, DRY and KISS win over premature abstraction; YAGNI wins over speculative SOLID.

---

## DRY — Don't Repeat Yourself

- Before writing any logic, check if it already exists in `services/`, `utils/`, `hooks/`, `components/`, or in a shared lib (`libs/shared-*`)
- Extract any block of logic used in more than one place into a shared function, hook, or component — never copy-paste
- Logic used by more than one app (constants, types, pure utils) goes in the matching `libs/shared-*` library, not duplicated between `server`, `web` and `bo`
- Page-level Redux wiring (selectors + dispatch) shared across `apps/bo` pages → extract into a custom hook
- UI patterns repeated in more than two places → extract into a reusable component in `components/`
- If a new route needs the same content as an existing route, reuse the existing component — do not duplicate the file

---

## SOLID

### Single Responsibility
- One file, one concern: a page wires data and navigation; a container renders a feature section; a service calls the API
- Never mix API calls into components or reducers
- A hook does one thing

### Open / Closed
- Extend behaviour through props and composition, not by modifying shared components
- Add a new variant via a prop (`variant="compact"`) rather than forking the component

### Liskov Substitution
- A component that accepts `onClick?: () => void` must work correctly when the prop is omitted
- Never assume an optional prop is present without a null check

### Interface Segregation
- Pass only the props a component actually uses — never pass the whole Redux state or a giant object when only two fields are needed
- Prefer narrow, specific callback props (`onCancel`, `onConfirm`) over generic `onAction: (type: string) => void`

### Dependency Inversion
- Pages depend on selectors and action creators, not on raw Parse or Axios calls
- Services depend on abstractions (`Parse.Query`, an HTTP client) — never import `fetch` directly in a service

---

## KISS — Keep It Simple, Stupid

- Always choose the simplest solution that correctly solves the problem
- If a function is hard to name, it probably does too many things — split it
- Prefer a flat `if/return` over nested ternaries or clever one-liners
- Prefer explicit over implicit: a readable 5-line function beats a cryptic 2-liner
- Complexity must be justified: if you can't explain why it's complex, simplify it

```typescript
// ❌ clever but unreadable
const label = arr.reduce((acc, x, i) => acc + (i ? ', ' : '') + x.name, '');

// ✅ simple and obvious
const label = arr.map(x => x.name).join(', ');
```

---

## YAGNI — You Aren't Gonna Need It

- Do not build features, abstractions, config flags, or generics for hypothetical future requirements
- Do not add optional params, extension points, or plugin hooks unless a concrete use case exists today
- Do not generalize until you have at least two real, different callers
- Remove dead code immediately — do not comment it out "just in case"
- If a requirement is speculative, leave a TODO comment max; do not implement it

```typescript
// ❌ generalizing for imaginary future callers
const fetchEntity = <T>(collection: string, id: string): Promise<T> => { ... }

// ✅ write the specific fetch you need today
const fetchProject = (id: string): Promise<Parse.Object> => { ... }
```

---

## BDD / TDD

Tests exist where the app has a test setup (`apps/web` runs Vitest + Storybook tests). Where a test
setup exists:

- For any new service function or Cloud Function, write the test first (red → green → refactor)
- A function is not done until it has at least one passing test covering the happy path
- Cover edge cases (empty input, null, boundary values) before moving on
- Describe tests in terms of observable behavior, not implementation details
  (`describe('feature / scenario')` + `it('should ...')` — no `it('calls function X')`)
- Mock only at the boundary (external HTTP, Parse, filesystem) — never mock internal helpers

`apps/server` and `apps/bo` have no test runner today. Do not invent one inside an unrelated task;
if a change clearly deserves one, say so and propose setting it up as its own task.

---

## Other best practices

### Separation of concerns

- **Page / route file** (`apps/web/app/`, `apps/bo/src/pages/`): reads data, passes callbacks as props — no complex JSX
- **Container** (`containers/`): feature section composed of components
- **Component** (`components/`): generic UI primitive, no domain knowledge
- **Service** (`services/`, `server/queries`, `server/mutations`): network calls only, no business logic
- **Action** (`apps/bo/src/redux/actions/`): orchestrates service calls + error handling
- **Reducer** (`apps/bo/src/redux/reducers/`): pure state transitions only
- **Cloud Function / trigger / job** (`apps/server/src/cloud/`): orchestration only — see `parse-patterns.md`

### Composition over inheritance
- Build complex UI from small, focused components — never a 500-line monolith
- Use render props or children slots (`children`, `renderItem`) before reaching for inheritance

### Fail fast
- Validate at boundaries (user input via Zod, API responses in the service layer) — never deep inside business logic
- Throw or return early on invalid state rather than defensive `if` chains throughout

### Avoid premature abstraction
- Three similar lines is not yet a pattern — wait for a genuine third use case before extracting
- Do not create a helper for a one-liner; inline it

### Law of Demeter (Principle of Least Knowledge)
- A function should only talk to its immediate collaborators — never chain through multiple objects
- `user.address.city` is fine; `user.address.country.isoCode.toUpperCase()` is a smell

### Immutability by default
- Never mutate function arguments or Redux state directly (outside Redux Toolkit's `createSlice`, where Immer makes the draft mutation safe)
- Use spread (`{ ...obj, key: value }`), `map`, `filter`, `reduce` over in-place mutation

### Error handling
- Every async function must handle errors explicitly — never swallow exceptions silently
- Server: throw translated errors from Cloud Code (see `apps/server/.claude/rules/error-messages.md`)
- Web/BO: dispatch an error action, set `error` state, or return an error from the server action — never `console.error` only
