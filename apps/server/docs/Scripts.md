## Scripts Explanation
- `yarn dev`:
  - use the src folder
  - use Typescript directly
  - use tsx for hot reloading (instead of nodemon)
    - so the code run in typescript directly
    - so the server restart on each change without transpiling
  - use the dev environment variables (`.env.preprod`)
- `yarn build`
    - cli: `npm run clean && swc src --copy-files -d dist --strip-leading-paths`
      - delete the dist folder before building
      - create a new dist folder
      - copy non-ts files from src to dist
      - transpile the code from Typescript to Javascript
      - by default, swc keep the folder structure from src to dist, e.g., `src/config` → `dist/src/config`, so we use `--strip-leading-paths` to remove the leading `src/` folder in dist
        - so `src/config` → `dist/config`
    - transpile the code from Typescript to Javascript
    - put the transpiled code in `/dist` folder
    - use `swc` for that
    - NOTE
      - The transpiled code is in Javascript ESM (EcmaScript Module) format
      - so we need to use `import` and `export` instead of old `require` and `module.exports`
      - Also, the `type` in `package.json` should be `module` instead of `commonjs`
      - It add automatically `.js` extension for local imports (.swcrc config `module.resolveFully: true`)
            ```js
            import myModule from './myModule.js'; // note the .js extension
            ```
        - For external modules, no need to add `.js` extension
            ```js
            import express from 'express'; // no .js extension needed
            ```
        - But if the external module is a sub-module, we need to add the `.js` extension manually in the `.ts` file
            ```js
            // OK
            import isBoolean from 'lodash/isBoolean.js';
            // instead of
            import isBoolean from 'lodash/isBoolean';
            // or
            import { isBoolean } from 'lodash';
            ```
      - To import JSON files, we need to use import assertions
            ```js
            import config from './config.json' with { type: 'json' };
            ```
      - For path resolution, not use `__dirname` or `__filename` directly
        - Instead, use `import.meta.url` with `fileURLToPath` and `path.dirname`
            ```js
            import { fileURLToPath } from 'url';
            import path from 'path';
            
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            ```
    - cli:
      - `npm run clean && swc src -d dist --strip-leading-paths && npm run copy-assets` : 
      - clean the dist folder, transpile the code from src to dist, copy the assets (non-ts files) to dist

- `yarn start`
  - cli: `cross-env NODE_ENV=production node --enable-source-maps dist/index.js`
  - run code in the dist folder
  - use Javascript code (transpiled from Typescript)
  - use node to run the code (not tsx because no hot reloading needed)
  - use the prod environment variables (`.env.prod`)
  - used in hosted production environment
- `yarn start:dev`
  - cli: `cross-env NODE_ENV=development node --enable-source-maps dist/index.js`
  - run code in the dist folder
  - use Javascript code (transpiled from Typescript)
  - use node to run the code (not tsx because no hot reloading needed)
  - use the dev environment variables (`.env.preprod`)
  - used in hosted dev environment
- `yarn start:preprod`
  - cli: `cross-env NODE_ENV=preProduction node --enable-source-maps dist/index.js`
  - run code in the dist folder
  - use Javascript code (transpiled from Typescript)
  - use node to run the code (not tsx because no hot reloading needed)
  - use the preprod environment variables (`.env.preprod`)
  - used in hosted preprod environment
- `yarn copy`
  - cli: `node config/copyBuilds`
  - copy the builds from `bo` folder to `server` folder
  - used after building `bo` to copy the built files to `server` for serving them
- `yarn build:bo:preprod`
  - cli: `cd ../bo && npm run build:preprod && cd ../server && npm run copy`
  - build the `bo` (backoffice) in preprod mode
  - then copy the built files to `server` folder
    - in `clientBuild/bo/preprod` folder
  - it will be served by the `express` server in preprod mode
  - NOTE:
    - the `clientBuild/bo/preprod` folder is in not in `.gitignore`
    - so the built files are committed to git
    - the host (server) serve the built files directly from the repo
    - so any change in the `bo` require to rebuild and recommit the built files
- `yarn build:bo`
  - cli: `cd ../bo && npm run build:prod && cd ../server && cross-env NODE_ENV=production npm run copy`
  - build the `bo` (backoffice) in prod mode
  - then copy the built files to `server` folder
    - in `clientBuild/bo/prod` folder
  - it will be served by the `express` server in prod mode
  - NOTE:
    - the `clientBuild/bo/prod` folder is in not in `.gitignore`
    - so the built files are committed to git
    - the host (server) serve the built files directly from the repo
    - so any change in the `bo` require to rebuild and recommit the built files