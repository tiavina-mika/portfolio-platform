# Next.js Upgrade Guide
- run `npx @next/codemod@canary upgrade latest` to upgrade to the latest version of Next.js.
- remove `TURBOPACK=1` from `dev` script in `package.json` as Turbopack is now the default bundler for development.
- This will remove `middleware.ts` and create `proxy.ts` in the root directory. Update the proxy configuration as needed.
- upgrade `tsconfig.json` 
- import `globals.css` in `app/layout.tsx` TS error.
  - add `declare module '*.css';` to `global.d.ts` to fix TS error.
- Rename all `NODE_ENV` to `APP_ENV` in `package.json` scripts and codebase to standardize environment variable naming.
- Remove all `forwardRef`
- Update `Button.tsx`

# next-intl
- in `app/[locale]/layout.tsx`, add the `NextIntlClientProvider` to provide internationalization context to the client components.
- Remove `TranslationClientProvider.js`
- Remove all client Providers like `ContactFormProvider.js`.
- Remove all import `NextIntlClientProvider` (it should be only defined once in the layout file).
- Remove all `layout.tsx` files in `app/[locale]/sitemap` slots (e.g., `app/[locale]/sitemap/@articles/layout.tsx`).
- In `not-found.tsx`, use `await getTranslations` from `next-intl/server` instead of `useTranslations`.

# shadcn-ui
- Remove `DialogItem.tsx`
- Update all imports from `@/components/ui/` to match the new component structure.

# parse-server
- Remove `@types/parse` package.
- in initialization: add `js key` to Parse initialization options.
  - e.g., `Parse.initialize(appId, 'xx');`
- Use parse object types directly instead of `Parse.Object` method.
  - e.g., change `Parse.Object` to `IArticle`
- Remove `Parse.Attributes` usage.
  - e.g., change `Parse.Attributes` to `Partial<IArticle>`
- Create a function to initialize Parse and call it in each server file that uses Parse.
- Install `eventemitter3` package for Parse LiveQuery `EventEmitter` 
  - Add it to `.storybook/main.ts`
  - It's only a storybook issue, no need to add it to the main app.

- Files removed:
    - `web/config/middleware.ts`
    - `web/config/parse.config.ts`
    - `stories/Table.tsx` and `stories/Table.stories.tsx`
- Files added:
    - `web/config/parse-server.config.ts`
    - `web/config/proxy.ts`
    - `types/parse-node.d.ts`
  
# Storybook
- `yarn dlx storybook@latest upgrade`
- `yarn remove @storybook/blocks @storybook/nextjs @storybook/test`
- `yarn add --dev vite vitest @storybook/addon-vitest @storybook/addon-a11y @storybook/nextjs-vite`
  - Rename imports from `@storybook/nextjs` to `@storybook/nextjs-vite` in all story files and `.storybook/preview.tsx`.
- Or automigration
  - run `npx storybook automigrate nextjs-to-nextjs-vite`
- remove `@storybook/addon-visual-tests` from `.storybook/main.ts` addons.

  # tailwindcss
- Update `eslint.config.mjs` to configure `better-tailwindcss` rules.
- Rename `text-md` to `text-base` in all components and pages.
- Rename `align-center` to `items-center` in all components and pages.
- Rename `ring-opacity-5` to `ring-black/50` in all components and pages.
- https://tailwindcss.com/blog/tailwindcss-v4
- Text editor:
  - In `ReadOnlyTextCodeEditor.tsx`, use `prose` classes from `tailwindcss-typography`classes.