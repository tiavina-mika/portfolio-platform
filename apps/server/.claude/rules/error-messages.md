---
paths:
  - "apps/server/src/**/*.ts"
---

# Error Messages — i18n and Logging

## The rule in one sentence

**Client-facing errors must be translated. Log messages must stay in English.**

---

## Client-facing errors — always translated

Any error message that reaches the client (thrown from a Cloud Function, trigger, or controller)
must be translated via `translate()` from `@/config/i18next`.

```ts
import { translate } from '@/config/i18next';

// ❌ hardcoded string sent to the client
throw new Error('Your account is suspended.');

// ✅ translated before throwing
const message = translate('error.accountSuspended', locale);
throw new Error(message);
```

The translation key must exist in every locale file (`fr`, `en`, `mg`) before the code is used —
`pnpm check-i18n` enforces it.

### How to get the locale

```ts
const locale = object?.get('locale') ?? params?.locale ?? context?.locale ?? DEFAULT_LANGUAGE;
```

- Cloud Functions: `const { locale } = request.params` — the client sends its locale as a param
- Triggers: `object?.get('locale') ?? context?.locale ?? DEFAULT_LANGUAGE`
- When no locale is available, fall back to `DEFAULT_LANGUAGE` (imported from `@/config/i18next`)

---

## Log messages — always in English

Logger calls (`logger.info`, `logger.error`, `logger.warn`, `logger.debug` — see `src/utils/logger.ts`)
must always be in English. They are read by developers in monitoring tools — not by end users.

```ts
// ❌ translated message in the log
logger.error(translate('error.accountSuspended', locale));

// ✅ English in the log, translated in the thrown error
logger.error('Account is suspended', { userId: user.id });
const message = translate('error.accountSuspended', locale);
throw new Error(message);
```

---

## Where to add translation keys

All server error keys go under the `error` namespace inside `common.json` of each locale:

```
src/locales/
├── fr/common.json   ← { "error": { "accountSuspended": "Votre compte est suspendu." } }
├── en/common.json   ← { "error": { "accountSuspended": "Your account is suspended." } }
└── mg/common.json   ← { "error": { "accountSuspended": "..." } }
```

**All three files must be updated simultaneously.**

---

## Summary table

| Context | Language | How |
|---|---|---|
| `throw new Error(...)` sent to client | User's locale | `translate(key, locale)` |
| `logger.error / info / warn / debug` | English always | Plain English string |
| Internal validation messages (never reach client) | English | Plain string is fine |
