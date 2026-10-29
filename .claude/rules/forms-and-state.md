# Forms and State Management

## i18n — `zod` namespace

The `zod.json` namespace (present in `apps/bo/src/config/i18n/locales` and `apps/web/translations/<locale>`)
is **exclusively** for field names used by the zod error message system (`zod.name.*`). These values appear in validation error messages (e.g. `"Email is required"`), not in the UI directly.

- **Never** use `t('zod:name.*')` as a section title, label, or any other UI string
- **Never** add UI strings (section titles, button labels, descriptions) to `zod.json`
- For form section titles and UI labels, use the appropriate namespace (`common`, `cms`, `user`, `article`…)
- `apps/web`'s `form.json` (namespace `Form`) is a different, unrelated file (server-action error codes + generic UI strings) — not concerned by this rule

```tsx
// ❌ using a zod.json key as a section title
<FormSection title={t('zod:name.location')} />

// ✅ use the correct namespace
<FormSection title={t('common:location')} />
```

---

## Forms (web / bo)

- All forms use **react-hook-form** + Zod resolver
- Zod schemas live in `validations/` (see `naming-conventions.md`)
- `apps/web` forms submit through **next-safe-action** server actions (`apps/web/server/mutations`)
- Reuse the connected field components of the app (high-level, wired to react-hook-form through
  `useFormContext`) over raw inputs; keep pure controlled inputs free of form coupling

### Hybrid controlled/uncontrolled inputs

Custom inputs must work in both controlled mode (RHF via `Controller`) and uncontrolled mode
(Storybook, ad-hoc usage with a no-op `onChange`).

**Pattern:** keep an `internalState` that mirrors the selection, using `value` as the source of truth when provided:

```tsx
// ✅ hybrid pattern — works controlled AND uncontrolled
const [internalCode, setInternalCode] = useState(value?.code ?? defaultCode);
const currentCode = value?.code ?? internalCode;

const handleChange = (code: string) => {
  setInternalCode(code);          // updates display immediately in uncontrolled mode
  onChange?.({ code, number });   // propagates to RHF / parent in controlled mode
};
```

```tsx
// ❌ purely controlled — silently broken when onChange is a no-op (Storybook, tests)
const currentCode = value?.code ?? defaultCode;
```

## Redux (`apps/bo` only)

- One action file + one reducer file per domain (`redux/actions/<domain>.action.ts`, `redux/reducers/<domain>.reducer.ts`)
- Data flow: Service/Parse call → Action (thunk) → Reducer → Component
- Always use typed selectors — never access `state.slice.field` directly in components
- `apps/web` has no Redux: server data comes from server components / `server/queries`, mutations from server actions

### BO — containers may dispatch directly

In `apps/bo/`, `useDispatch` is allowed directly inside `containers/` form components. There is no
requirement to lift dispatch to `pages/` and pass it down via an `onSubmit` prop — both patterns
(page-level dispatch passed as prop, or container-level dispatch) are acceptable in `apps/bo/`.

In `apps/web/`, containers stay props-only (see `component-structure.md`).
