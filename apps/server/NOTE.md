### Production release (MEP)
#### process
1. the folder structure of the entire project should be exactly:
  /
    /bo
    /server
1. build manually the client with `build:bo:preprod` or `build:bo`
- that create a folder in `/server/client/build` (prod) or `/server/client/preprod-build`
1. push the branch (or merged via PR):
- `develop` for preprod
- `main` for prod
=> this will update automatically the remote server (online)


#### setup host (for the first time)
- We are using [render](https://docs.render.com/deploy-node-express-app) for a host
- Choose "new Web service"
- Give it a name (ex: portfolio.preprod), this name would be the url of the project (ex: https://bo-preprod-ento-io.onrender.com)
- Choose the branch that will automatically update the host when changed (develop for preprod, main for prod)
- build command: `corepack enable; yarn; yarn build`, in our code, this transpile the `TS` code to `JS` using esbuild (see `packages.json` > `scripts` > `build`)
- Start command: `yarn start:preprod` or `yarn start` (prod)
- Complete the env vars
  - `SERVER_URL` should be added once the app is created (url)

#### Brevo
- There may be an error during user creation: The sender email must be added to Brevo
  > in "Expediteur, IP, ...)
  > Ajouter un expéditeur
    > Ajouter l'email de l'expediteur (tk here)

#### Cloudinary
- upload the logo to cloudinary (root folder)
- rename it to `logo`
- we need it to send to the email

#### script
  `start`: run the app with transpiled js (in /dist directory) in `prod` environment
  `start:dev`: run the app with transpiled js (in /dist directory) in `dev` environment
  `start:preprod`: run the app with transpiled js (in /dist directory) in `preprod` environment
  `dev`: transpile the code in js for each change, then run the app with transpiled js
  `lint:check`: check if linting warning and error
  `lint`: fix lint warning and show linting error (rules breaking)
  `copy`:
    - copy the client build to the server
    - so we can launch it from the server (server side rendering) in top of `express` (via sendFile)
    - it use the script in `config/copyBuilds.js`
  `build:bo:preprod` and `build:bo` (prod):
    - go to the bo folder
    - build the preprod or prod bo
    - return to the server
    - copy the bo build folder to the server
      - `/client/preprod-build` : preprod
      - `/client/build` : prod
  `build`: transpile the `typescript` code in `/src` to `javascript` in `/dist`

### testing prod in local
- make `FORCE_PROD=true`

#### note
the code always run in `/dist` instead of `/src`, even if we are in dev mode
- For each change in our code (`/src`), `esbuild` transpile it immediately to Javascript in `/dist` (via `/config/esbuild/build.watch.js`)
- Nodemon watch the `/dist` folder if there is a change, so it re-run the server (via `nodemon.json`)
=> We code in `Typescript` in `/src`, but the server run the code in `/dist` in real time in `Javascript`

- `/dist` should be ignored by git (in .gitignore)
- the server host will build it so it will be created there
- On the other hand, `/client` should be push to git, because it from another repository, the host server is not able to build it
- so we build it manually in local

### URLs
#### preprod
BO: https://tiavina-mika-bo-preprod.onrender.com
Client: https://tiavina-mika-preprod.onrender.com

#### prod
https://bo-tiavina-michael-ralainirina.onrender.com

# ACCOUNT
- preprod
  - cloudinary: tk
  - google recaptcha: tk
  - onrender: tk (github)
  
- prod
  - cloudinary: rt
  - google recaptcha: tm
  - brevo: rt
  - mongodb atlas: rt (password)
  - onrender: rm (github)