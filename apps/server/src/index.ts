import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import cors from 'cors';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import utc from 'dayjs/plugin/utc.js';
import dotenv from 'dotenv';
import express, { type Response } from 'express';
import helmet from 'helmet';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as i18nextMiddleware from 'i18next-http-middleware';
import cron from 'node-cron';
import { ParseServer } from 'parse-server';

import 'dayjs/locale/de.js';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';
import { initializeCloudinary } from './config/config';
import { getI18nOptions } from './config/i18next';
import downloadRouter from './routes/download.route';
import fileRouter from './routes/files.route';
import {
  BO_BUILD_FOLDER, FORCE_PREPROD, FORCE_PROD, IS_LOCAL, IS_PREPROD, IS_PROD,
} from './utils/constants';
import { getServerUrl } from './utils/util';
import validateEnv from './utils/validateEnv';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

const boBuildPath = `../${BO_BUILD_FOLDER}`;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isInDist = dirname.includes('dist');

const app = express();

app.use(express.json());
// Serve the BO static files
app.use(
  express.static(path.join(dirname, boBuildPath))
);

// Secure Express apps by setting HTTP response headers
app.use(helmet());
// Serve public folder for public assets
app.use(express.static(path.join(dirname, '../public')));
// Enable CORS for all origins
app.use(cors());
// Body parser middleware, to handle post requests
app.use(bodyParser.json({ limit: '30mb' }));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const SERVER_PORT = process.env.PORT || 8089;

let ENV = 'DEVELOPMENT';
let envFileName: string | undefined = '.env.preprod';

if (IS_PROD || FORCE_PROD) {
  envFileName = '.env.prod';
  ENV = 'PROD';
}
else if (IS_PREPROD || FORCE_PREPROD) {
  ENV = 'PREPROD';
}

const init = async () => {
  /**
   * Load the environment variables from the .env file
   * The .env file is not loaded in production, because the environment variables are set manually in the remote host/server
   * So we load the .env file only in local
   */

  if (envFileName && (IS_LOCAL || FORCE_PROD || FORCE_PREPROD)) {
    await dotenv.config({ path: path.join(dirname, '..', envFileName) });
  }

  // Validate the environment variables (.env file or remote host/server defined variables)
  validateEnv();

  // eslint-disable-next-line import/no-named-as-default-member
  await i18next
  /**
   * the language detector, will automatically detect the users language, by some criteria...
   * like the query parameter ?lng=en or http header, etc...
   */
    .use(i18nextMiddleware.LanguageDetector)
    // you can also use any other i18next backend, like i18next-http-backend or i18next-localize-backend
    .use(Backend)
    .init(
      getI18nOptions(path.join(dirname, './locales/{{lng}}/{{ns}}.json'))
    );

  /**
   * to detect the language, you can use the following options:
   * 1. query parameter: ?lng=en
   * 2. http header: Accept-Language: en
   * 3. cookie: i18next
   * 4. session: req.session.lng
   * order: ['path', 'session', 'querystring', 'cookie', 'header']
   * @see https://www.npmjs.com/package/i18next-http-middleware#detector-options
   */
  app.use(i18nextMiddleware.handle(i18next) as any);

  const serverUrl = getServerUrl();

  const parseServer = new ParseServer({
    databaseURI: process.env.MONGO_URL,
    /*
     * Use function path to dynamically import cloud code
     * Instead of static path which may cause issues in ESM environments (in dist)
     */
    cloud: () => {
      import(`./cloud/index.${isInDist ? 'js' : 'ts'}`);
    },
    appId: process.env.PARSE_APP_ID || 'portfolio-v4',
    serverURL: serverUrl + '/parse',
    publicServerURL: serverUrl + '/parse',
    mountPath: '/parse',
    appName: process.env.PARSE_APP_ID,
    masterKey: process.env.PARSE_MASTER_KEY || 'master-',
    allowClientClassCreation: true,
    allowExpiredAuthDataToken: false,
    encodeParseObjectInCloudFunction: false,
  });

  // start the parse server
  await parseServer.start();

  initializeCloudinary();

  // mount the parse server to express api
  app.use('/parse', parseServer.app);

  app.use('/files', fileRouter);
  app.use('/download', downloadRouter);

  /**
   * Lightweight ping route
   * Simple API called to awake the server
   * It is called by a cron job every 14 minutes
   */
  app.get('/ping', (_, response: Response) => {
    response.send('pong');
  });

  app.get('/*splat', (_, response: Response) => {
    // the client build folder is called from the dist/ (build) folder
    response.sendFile(path.join(dirname, boBuildPath, 'index.html'));
  });

  /*
   * create default roles if not exist
   * this function should be called once, because it will run every server start
   * NOTE: in local it's created for the first server start
   */
  /*
   * if (!IS_LOCAL || !FORCE_PREPROD || !FORCE_PROD) {
   *   await createDefaultRoles();
   * }
   */

  if (!IS_LOCAL) {
    /*
     * Schedule a cron job to ping the app every 10 minutes
     * to keep the app awake (onrender free plan has 15 minutes inactivity limit)
     */
    cron.schedule('*/10 * * * *', async () => {
      try {
        const response = await fetch(serverUrl + '/ping');

        console.log('App is awake: ', response.status);
      }
      catch (error) {
        console.error('Error while pinging the server: ', (error as Error).message);
      }
    });
  }

  app.listen(SERVER_PORT, () => {
    console.log(
      `
      =====================================
                  [${ENV}]
                ${serverUrl}
      =====================================
      `
    );
  });
};

init().catch((error) => {
  console.error('Error during server initialization: ', (error as Error).message);
});
