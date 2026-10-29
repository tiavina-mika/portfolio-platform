# Env
## yarn
yarn --version
yarn set version stable
rm -rf node_modules yarn.lock
touch yarn.lock
yarn install
yarn --version

# Dev Dependency updates
## typescript
yarn add -D typescript@latest

## Change all type import statements
- Before:
  import { SomeType } from 'some-module';
- After:
  import type { SomeType } from 'some-module';

## eslint
yarn add -D @eslint-community/eslint-plugin-eslint-comments@latest @eslint/eslintrc@latest @eslint/js@latest @stylistic/eslint-plugin@latest @types/eslint-plugin-jsx-a11y@latest eslint@latest eslint-config-prettier@latest eslint-plugin-prefer-arrow-functions@latest eslint-plugin-prettier@latest globals@latest typescript-eslint@latest

### Other eslint plugins to install:
yarn add -D eslint-plugin-jest eslint-plugin-import cspell @cspell/eslint-plugin

### Update the eslint config file (.eslintrc.mjs)
### Update prettier config file (prettier.config.js)
### Run lint
yarn lint
### Fixes
- i18next
  - import change
    - Before:
      import i18next from 'i18next';
      i18next.t('key');
    - After:
      import { t } from 'i18next';
      t('key');
  - src/index.ts
    // eslint-disable-next-line import/no-named-as-default-member
    await i18next

    app.use(i18nextMiddleware.handle(i18next) as any);
- src/utils/logger.utils.ts
// Define log format
const logFormat = winston.format.printf((
  { timestamp, level, message }: { timestamp?: string; level: string; message: any }
) => {
  let newMessage: string = message;

  if (message && typeof message === 'object') {
    newMessage = JSON.stringify(newMessage, null, '\t');
  }

  return `${timestamp} ${level}: ${newMessage}`;
});

- tsconfig.json
- src/utils/utils.ts
  // eslint-disable-next-line @cspell/spellchecker
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  // eslint-disable-next-line @cspell/spellchecker
  const to = 'aaaaaaeeeeiiiioooouuuunc------';

## husky and lint-staged
yarn add -D husky@latest lint-staged@latest

- .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
yarn lint-staged

## fs-extra
yarn add fs-extra@latest

## winston
yarn add winston@latest winston-daily-rotate-file@latest

# Dependency updates
## express
yarn add express@latest
yarn add -D @types/express@latest

## parse-server
yarn add parse-server@latest

## Changes after Parse Server update
### Parse Server + TS issues encountered
- Issue: Global variable 'Parse' not found (https://github.com/parse-community/parse-server/issues/9892)
- Solution: Declare the global variable in a `.d.ts` file:
- create `/types/global-parse.d.ts` file with content:
  ```typescript
  declare global {
    var Parse: typeof import('parse/node');
  }
  export {};
  ```
- For this to work, use `"@types/parse": "3.0.9"` in `package.json` devDependencies.
- Upper version of `@types/parse` will not work
  => this will fix TS errors related to Parse global variable in cloud code files.
- update `server/src/index.ts`:
  ```typescript
    app.get('/*', (_, response: Response) => {
      // to
    app.get('/*splat', (_, response: Response) => {
  ```

### Linting after Parse Server update
- `yarn lint`
- Fix TS error after linting:
  - server/src/cloud/utils/role.utils.cloud.ts
    - Change:
      const hasFinalRights = [];
    - To:
      const hasFinalRights: boolean[] = [];
  - server/src/cloud/utils/utils.cloud.ts
    - Change:
      let validation = null;
    - To:
      let validation: ReturnType<ZodObject<ZodRawShape>['safeParse']>;


## cloudinary
yarn add cloudinary@latest

- Update cloudinary imports
- Before:
  import cloudinary from 'cloudinary';
  cloudinary.v2.config({ ... });
- After:
  import { v2 as cloudinary } from 'cloudinary';
  cloudinary.config({ ... });

## zod
yarn add zod@latest
- in zod config
-       const errorMessages = error.errors.map((issue: any) => ({
        to
        const errorMessages = error.issues.map((issue: any) => ({

    invalid_type_error: 'Invalid url',
    to
    message: 'Invalid url',

    required_error: 'common:form.error.requiredEmail'
    to:
    .nonempty('common:form.error.requiredEmail')