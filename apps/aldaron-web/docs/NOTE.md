
# URLs
#### preprod
BO: https://tiavina-mika-bo-preprod.onrender.com
Client: https://tiavina-mika-preprod.onrender.com

#### prod
BO: https://bo-tiavina-michael-ralainirina.onrender.com
Client: https://tiavina-michael-ralainirina.onrender.com

# Host
- This project is hosted in onrender
- PROD: using rm (mika-ral) github account
- PREPROD: using tk (Ralai30) github account

# Links
## Articles
[Storing React state in the URL with Next.js](https://francoisbest.com/posts/2023/storing-react-state-in-the-url-with-nextjs)
[How to add Tailwind Dark Mode to React Server Side Apps](https://michaelangelo.io/blog/darkmode-rsc)
[Accessible design](https://m3.material.io/foundations/accessible-design/accessibility-basics)
[Tailwind tricks that would make your development comfortable](https://medium.com/@serpentarium13/tailwind-tricks-that-would-make-your-development-comfortable-72930590dd06)
[](https://copyprogramming.com/howto/how-to-use-diferent-env-files-with-nextjs)
[RHF with server components](https://nehalist.io/react-hook-form-with-nextjs-server-actions/)
[Set up React Query with Nextjs](https://codevoweb.com/how-to-set-up-and-use-react-query-in-next-js-14/)

## Libs

[CVA, add variants to reusable components](https://cva.style/docs/getting-started/variants)
[Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
[Commit lint tuto](https://dev.to/mahmudulhsn/install-husky-in-your-project-for-proper-commit-lint-with-pre-commit-hooks-25b2)
[Shadcn](https://ui.shadcn.com/docs)
[next-intl tuto](https://phrase.com/blog/posts/next-js-app-router-localization-next-intl/)
[string-ts](https://github.com/gustavoguichard/string-ts)

## Authentication
[next-Auth (Google and GitHub)](https://medium.com/@rishipardeshi/authentication-with-nextjs-14-and-next-auth-b10fe7eb6407)

## Repos

[Next 14 starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
[Shadcn tanstack table](https://github.com/sadmann7/shadcn-table)

### Emailing

[react-email with resend](https://react.email/docs/integrations/resend)
[Resend pricing](https://resend.com/settings) (free: 100 email/day (3000 email / month), paid: $20 / 50k email / month)
[Brevo pricing](https://www.brevo.com/pricing/)

### Utils

[Download Feather icons in svg format](https://feathericons.com/)
[Open Graph Image Generator](https://placid.app/tools/free-open-graph-image-generator)
### Open issuses:
[Next .bind is not working with next-safe-action](https://github.com/TheEdoRan/next-safe-action/issues/60)
### Discussions
[React useFormState vs RHF built-in](https://www.reddit.com/r/nextjs/comments/18b8z71/how_to_use_reacthookform_with_nextjs_server/)
https://codesandbox.io/p/devbox/drawer-with-scale-forked-nx2glp?file=%2Fpackage.json

# Config
## next-intel
To add new language:
- `global.d.ts`
- `/i18n/request.ts` in `getRequestConfig()` and locales
- `utils/translation.utils` in `getTranslatedMessages()`
- `middleware.ts` in `config`
- add new language translation in `/translations/` directory

## Parse
  - we use the parse client SDK as a server side (parse/node)
  - For types, we import them from `parse`


To add new translated routes:
- add the translated route to /config/routes.ts

# Lib usage
### React Hook Form
- We use React `useFormState` for server actions with `action` instead of `onSubmit`
- So this will use `FormData` instead of an `object`, this is utils when uploading a file for ex.

### zod + next-intl
- To translate the client form error message, use `useI18nZodErrors()` in the form
- the translation key is `"Zod"`
- For the server action translated erros message, it use the default zod errors for now.

### Next auth
- next-auth token expiration is 30 days (refreshed every page request (+current date))
- parse server token expiration is 1 year - 1 day
- TODO: parse server token expiration should be the same as next-auth's expiration

### Route
- add protected routes other than "/dashboard" in next.utils.ts:
```javascript
const nonDashboardProtectedRoutes = [translatedPathnames[ROUTES.profile]];
```

# Create translated page
### create page
- inside [locale] directory, create a directory (url) with page.ts and/or layout.tsx in it
  ex: [locale]/about (this will create a dynamic translated route /fr/about or /en/about)
- in routes.ts, add the route name in `ROUTES`
  ex: ```javascript
    const ROUTES = {
      // ... other routes,
      about: '/about'
    }
  ```javascript
- then, use and add that key in `translatedRoutes` with each translated pathname
  ```
    const translatedRoutes = {
      // ... other translatedRoutes,
      [ROUTES.about]: {
        en: '/about',
        fr: '/a-propos',
      },
    }
  ```

# Testing prod in local
- in .env.local
- under the comment `# -------- others -------- #`
- change these env vars to prod one (`.env.prod`)
- run `dev`
  
# Discussion
[Detect screen size in middleware](https://stackoverflow.com/questions/76155066/how-can-i-serve-a-static-page-with-responsive-design-in-next-js-without-affectin)
[Multiple middleware (!follow the discussion closely)](https://github.com/vercel/next.js/discussions/62248)

# Issues
### React Hook Form + Zod + form action & server action
(Issue and discussions)[https://github.com/react-hook-form/react-hook-form/issues/10391]
(Repo with solutions)[https://github.com/ezanglo/react-hook-form-server-actions], use direction in the component or with a custom hook (I choose the component, it's simple to implement)

 * use dual onSubmit and action to handle form submission
 * when the form is valid, the action will be called, else the onSubmit will be called
 * validate the form when submitting the form (with form.trigger() or schema.safeParse())
 * @issue: https://github.com/react-hook-form/react-hook-form/issues/10391

### Zod translated errors with next-intl
(Repo with solution)[https://github.com/gcascio/next-intl-zod]
(Explanation)[https://www.gcasc.io/blog/next-intl-zod]
(Discussion)[https://stackoverflow.com/questions/77367244/a-solution-to-translating-zod-error-messages-using-next-intl]

## Google reCaptcha
- register
  - https://www.google.com/u/2/recaptcha/admin/create?pli=1
  - use `localhost` in domain if in localhost (https://dev.to/hardiquedasore/how-to-use-captcha-on-localhost-10k1)
  - (Google ReCaptcha + Nextjs)[https://medium.com/@dorianszafranski17/how-to-integrate-google-recaptcha-in-your-next-js-project-9b711b78695a]
- account:
  - prerpod
    - tk@gmail.com
    - portfolio-v4-preprod
  - prod
    - tmk
    - portfolio-v4-prod
  
# NextJs 14 API handler docs
https://nextjs.org/docs/app/building-your-application/routing/route-handlers
https://nextjs.org/docs/app/api-reference/functions/next-response#json
https://medium.com/@ismailtaufiq19/utilize-route-handlers-next-js-for-rest-api-b11480f5e8e1
(NextResponse vs Response)[https://stackoverflow.com/questions/77332669/use-nextresponse-response-or-nextapiresponse-in-returning-get-and-data-in-next]
(Route handlers middleware)[https://medium.com/@abgkcode/streamlining-middleware-in-next-js-14-api-routes-with-typescript-a-comprehensive-guide-25b18360ee72]


# NextJs 14 => 15 migration
## Steps
- upgrade to React 19 and Next 15
  npx @next/codemod@canary upgrade latest
- change scripts in packages.json
  - "dev": "next dev --turbo"
  - "dev": "TURBOPACK=1 nodemon ./server.js"
- Make params, cookies, headers, ... to async
  - codemod: npx @next/codemod@canary next-async-request-api .
  - ISSUES:
    - `ReferenceError: locale is not defined at Module.generateMetadata`
    - Some params are not modified and forgotten, so to add it manually
  
# onrender free plan
https://medium.com/@anishjoshi1999/getting-the-most-out-of-renders-free-web-services-strategies-for-budget-friendly-developers-6b4d2f17cbde

# issues to fix later
- Storybook with RSC async component not working
  - discussion: https://github.com/storybookjs/storybook/discussions/32665