import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import utc from 'dayjs/plugin/utc.js';
import dotenv from 'dotenv';
import express, { type Request, type RequestHandler, type Response } from 'express';
import helmet from 'helmet';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as i18nextMiddleware from 'i18next-http-middleware';
import { ParseServer } from 'parse-server';

import 'dayjs/locale/de.js';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';
import { ensureOwnerInvitationsExist } from './cloud/services/_core/invitation.service.cloud';
import { ensureDefaultRolesExist } from './cloud/services/_core/right.service.cloud';
import { rebuildAllCLP } from './cloud/services/_core/security.service.cloud';
import { warnIfTooFewOwners } from './cloud/services/_core/userRole.service.cloud';
import { corsOptions, helmetContentSecurityPolicy, initializeCloudinary } from './config/config';
import { ensureDatabaseIndexes } from './config/db-indexes';
import { getI18nOptions } from './config/i18n';
import { buildOpenApiDocument } from './config/openapi';
import { ParseServerLoggerAdapter } from './config/parse-server-logger.adapter';
import { scheduleJobs } from './config/scheduled-jobs';
import {
  BO_BUILD_FOLDER, collections, CREDENTIAL_RATE_LIMITED_PATHS, FORCE_PREPROD, FORCE_PROD, IS_E2E, IS_LOCAL,
  IS_PREPROD, IS_PROD, JSON_BODY_LIMIT, LIVE_QUERY_CLASS_NAMES, TRUST_PROXY_HOPS,
} from './constants/_core/constants';
import { DOCS_BUILD_FOLDER, DOCS_ROUTE_PREFIX } from './constants/_core/docs.constants';
import { USER_PROTECTED_FIELDS } from './constants/_core/user.constants';
import correlationIdMiddleware from './middlewares/correlationId.middleware';
import errorMiddleware from './middlewares/error.middleware';
import {
  AUTH_RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_WINDOW_MS, authRateLimiter, batchRateLimiter,
  RATE_LIMIT_MESSAGE_TEXT, RATE_LIMITED_POST_ROUTES,
} from './middlewares/rateLimit.middleware';
import createDocsRouter from './routes/_core/docs.route';
import downloadRouter from './routes/_core/download.route';
import fileRouter from './routes/_core/files.route';
import { logger } from './utils/_core/logger';
import { getServerUrl } from './utils/_core/utils';
import validateEnv from './utils/_core/validateEnv';

/*
 * Pin the server's own zone: production hosts run in UTC, a developer's machine does not. Every
 * date meant for a member is converted explicitly to a zone (see `@shared/utils`), so nothing may
 * lean on the OS zone — pinning it makes a hidden dependency behave the same in dev as in production.
 */
process.env.TZ = 'UTC';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// from /src/dist to /
const boBuildPath = `../${BO_BUILD_FOLDER}`;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isInDist = dirname.includes('dist');

const app = express();

// without it `req.ip` is the proxy's own address: every per-IP limit would count all users as one
app.set('trust proxy', TRUST_PROXY_HOPS);

// Compress response bodies before any other middleware
app.use(compression());
// Must run before every other middleware/route so all their logs share the same correlationId
app.use(correlationIdMiddleware);
app.use(express.json({ limit: JSON_BODY_LIMIT }));
// Serve the BO static files
app.use(
  express.static(path.join(dirname, boBuildPath))
);
/*
 * Serve the documentation sites behind their passwords. Mounted before helmet like the BO build:
 * the VitePress pages carry inline scripts that the strict content security policy would block.
 */
app.use(DOCS_ROUTE_PREFIX, createDocsRouter(path.join(dirname, '..', DOCS_BUILD_FOLDER)));

// Secure the app by setting various HTTP headers
const helmetMiddleware: RequestHandler = helmet({
  contentSecurityPolicy: helmetContentSecurityPolicy,
});

app.use(
  helmetMiddleware
);
// Serve the public folder static files
app.use(express.static(path.join(dirname, '../public')));
// Enable CORS, restricted to the known web/BO origins (see corsOptions)
app.use(cors(corsOptions));
// Body parser middleware, to parse the request body
app.use(bodyParser.json({ limit: JSON_BODY_LIMIT }));
// to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: JSON_BODY_LIMIT, extended: false }));

const SERVER_PORT = process.env.PORT || 8090;

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
    // eslint-disable-next-line @typescript-eslint/await-thenable
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
      getI18nOptions(path.join(dirname, './config/i18n/locales/{{lng}}/_core/{{ns}}.json'))
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
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import(`./cloud/index.${isInDist ? 'js' : 'ts'}`);
    },
    appId: process.env.PARSE_APP_ID,
    serverURL: serverUrl + '/parse',
    publicServerURL: serverUrl + '/parse',
    appName: process.env.PARSE_APP_ID,
    // the limiter of /batch sub-requests reads the same client address as the Express middleware
    trustProxy: TRUST_PROXY_HOPS,
    masterKey: process.env.PARSE_MASTER_KEY,
    allowClientClassCreation: false,
    allowExpiredAuthDataToken: false,
    /*
     * Columns stripped from every object Parse Server hands a client — the REST class API and
     * LiveQuery events included. `_User` is readable by any signed-in account, so without this a
     * signed-in user could page through `/parse/users` and collect every phone number and email
     * on the platform. Server-side reads all use the master key and are unaffected.
     */
    protectedFields: {
      [collections.User]: { '*': USER_PROTECTED_FIELDS },
      /*
       * a send fanned out to several passengers is one row every one of them can read: the
       * per-recipient delivery outcomes and opening dates are about the others, and stay with the
       * back-office, which reads through the master key
       */
      [collections.Notification]: { '*': ['channels', 'receiverSeenDates'] },
    },
    /*
     * Pin the future Parse Server defaults explicitly to silence deprecation warnings.
     * Safe here because this app doesn't use Parse File URLs (files go through Cloudinary,
     * not the Parse Files adapter), custom Pages, or the read-only master key — so opting into
     * the stricter future behavior now has no functional impact.
     */
    fileUpload: {
      allowedFileUrlDomains: [],
    },
    pages: {
      encodePageParamHeaders: true,
    },
    readOnlyMasterKeyIps: ['127.0.0.1', '::1'],
    requestComplexity: {
      includeDepth: 10,
      includeCount: 100,
      subqueryDepth: 10,
      queryDepth: 10,
      graphQLDepth: 20,
      graphQLFields: 200,
      batchRequestLimit: 100,
    },
    /*
     * The one place the future default is NOT taken: `protectedFields` above hides an account's
     * own contact details from itself when this is false, which is exactly what the app reads off
     * `Parse.User.current()` after login. Owner exemption keeps a user's own row whole while
     * still hiding it from everybody else.
     */
    protectedFieldsOwnerExempt: true,
    protectedFieldsTriggerExempt: true,
    protectedFieldsSaveResponseExempt: false,
    installation: {
      duplicateDeviceTokenActionEnforceAuth: true,
    },
    allowAggregationForReadOnlyMasterKey: false,
    /*
     * locks an account after repeated failed login attempts — the per-IP authRateLimiter on
     * /parse/login already throttles brute-force from a single source, but a distributed attacker
     * rotating IPs could otherwise keep guessing one specific account indefinitely.
     */
    accountLockout: {
      duration: 15, // minutes
      threshold: 5, // failed attempts
    },
    /*
     * Parse Server's own limiter on the credential-checking routes, on top of the Express
     * `authRateLimiter` registered below. It is not redundant: the Express middleware is mounted
     * on a URL, and `POST /parse/batch` dispatches its sub-requests internally, so a batch body
     * carrying a hundred `/login` attempts never touches it. This one is re-applied to every
     * sub-request a batch unpacks, which is the only place that hole can be closed.
     *
     * `redisUrl` shares the counters across Cloud Run instances — an in-memory store would let an
     * attacker multiply their allowance by the number of instances currently running.
     *
     * Off for the E2E runner: every actor of the suite logs in from the same localhost IP, so the
     * cap would start refusing logins a few tests into the run.
     */
    rateLimit: IS_E2E ? [] : CREDENTIAL_RATE_LIMITED_PATHS.map((requestPath) => ({
      requestPath,
      requestTimeWindow: AUTH_RATE_LIMIT_WINDOW_MS,
      requestCount: AUTH_RATE_LIMIT_MAX_REQUESTS,
      errorResponseMessage: RATE_LIMIT_MESSAGE_TEXT,
      redisUrl: process.env.UPSTASH_REDIS_URL,
    })),
    databaseOptions: {
      // Mongoose/MongoDB driver default is 5 — raised here for production concurrency
      maxPoolSize: IS_PROD ? 100 : 10,
    },
    /*
     * gates which classes publish afterSave/afterDelete events into the LiveQuery pub/sub —
     * without this, LiveQueryController silently drops events for every class, subscribed or not.
     * redisURL broadcasts those events through Upstash pub/sub so a subscriber connected to one
     * Cloud Run instance still receives events triggered on another instance — Cloud Run can run
     * more than one instance concurrently (--max-instances), so without it a client's LiveQuery
     * subscription would only fire for actions that happen to land on its own instance.
     */
    liveQuery: {
      classNames: LIVE_QUERY_CLASS_NAMES,
      redisURL: process.env.UPSTASH_REDIS_URL,
    },
    /*
     * without this, Parse Server falls back to its own internal WinstonLoggerAdapter, writing a
     * second, invisible log pipeline to logs/parse-server.{info,err} instead of the app's logger.
     */
    loggerAdapter: ParseServerLoggerAdapter,
  });

  // start the parse server
  await parseServer.start();

  await ensureDatabaseIndexes();

  initializeCloudinary();

  /**
   * Rate limit brute-force / account-enumeration prone endpoints.
   * Must be registered before the Parse Server mount so they run first for these sub-paths.
   * Scoped to POST only — login/signup/cloud functions are always called via POST, and this
   * avoids throttling GET /parse/users (BO admin user list/search queries with the master key).
   */
  app.post('/parse/login', authRateLimiter);
  /*
   * Parse Server accepts credentials on `GET /parse/login?username=…&password=…` too, so the POST
   * entry above on its own left the whole brute-force protection one query string away.
   */
  app.get('/parse/login', authRateLimiter);
  app.post('/parse/users', authRateLimiter);
  app.post('/parse/functions/verifyAccount', authRateLimiter);
  app.post('/parse/functions/sendVerificationCode', authRateLimiter);
  app.post('/parse/functions/sendResetPasswordVerificationCode', authRateLimiter);
  app.post('/parse/functions/resetPassword', authRateLimiter);
  /*
   * `loginWithPhone` is a login: without this it was the one credential-checking entry point with
   * no per-IP cap at all. Parse's own `accountLockout` only stops 5 tries against one account,
   * which does nothing against a single password tried across a whole block of numbers — and
   * Malagasy mobile numbers are a small, easily enumerated space.
   */
  app.post('/parse/functions/loginWithPhone', authRateLimiter);
  // the same login by the email an account added after signing up by phone — same brute-force surface
  app.post('/parse/functions/loginWithEmail', authRateLimiter);
  // the second half of a back-office login — its 6-digit TOTP code can be brute-forced
  app.post('/parse/functions/verifyMfaLogin', authRateLimiter);
  app.post('/parse/functions/generateMfaSecret', authRateLimiter);
  app.post('/parse/functions/confirmMfaEnrollment', authRateLimiter);
  app.post('/parse/functions/disableMfa', authRateLimiter);
  app.post('/parse/functions/regenerateMfaBackupCodes', authRateLimiter);
  app.post('/parse/functions/verifyBOInvitationToken', authRateLimiter);
  // step-up re-authentication, and the three entry points below each send an SMS or email per call
  app.post('/parse/functions/requestStepUpVerification', authRateLimiter);
  app.post('/parse/functions/verifyStepUpCode', authRateLimiter);
  app.post('/parse/functions/requestContactChange', authRateLimiter);
  app.post('/parse/functions/confirmContactChange', authRateLimiter);
  /*
   * the two anonymous website entry points — reCAPTCHA gates them, the limiter caps the retries
   * the website's view and share counters, open to everyone — capped so a script cannot inflate them
   */

  /*
   * The non-credential limiters, on a direct call and on each sub-request of a `POST /parse/batch` —
   * these routes send an SMS or e-mail, open a ticket, create a row or run a heavy export, so a batch
   * of 100 must not multiply their cap by 100.
   */
  app.post('/parse/batch', batchRateLimiter);
  Object.entries(RATE_LIMITED_POST_ROUTES).forEach(([routePath, limiter]) => {
    app.post(`/parse${routePath}`, limiter);
  });

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

  // machine-readable description of the routes above, for client developers and API tooling — not public
  if (!IS_PROD) {
    app.get('/openapi.json', (_: Request, response: Response) => {
      response.json(buildOpenApiDocument());
    });
  }

  app.get('/*splat', (_: Request, response: Response) => {
    // the client build folder is called from the dist/ (build) folder
    return response.sendFile(path.join(dirname, boBuildPath, 'index.html'));
  });

  // catches errors from any route above that doesn't handle its own try/catch — must stay last
  app.use(errorMiddleware);

  /**
   * Schedule the background jobs (cron jobs) to run at specific times
   */
  scheduleJobs(serverUrl);

  const httpServer = app.listen(SERVER_PORT, () => {
    logger.info(
      `
      =====================================
                  [${ENV}]
                ${serverUrl}
      =====================================
      `
    );

    /*
     * runs once the server is actually listening — running this during the `cloud` import
     * (before app.listen) makes the Parse SDK's REST controller fetch its own serverURL
     * before anything is bound to the port, failing with a generic "fetch failed"
     */
    rebuildAllCLP().catch(
      (err) => logger.warn('[CLP] startup rebuild failed', { error: (err as Error).stack })
    );

    /*
     * same reason as rebuildAllCLP above — needs the Parse SDK's REST controller to reach its
     * own serverURL, which only works once the server is actually bound to the port
     */
    ensureOwnerInvitationsExist().catch(
      (err) => logger.warn('[bootstrapAdmin] owner invitation bootstrap failed', { error: (err as Error).stack })
    );

    // a default role added to the code after the platform was bootstrapped is created here
    ensureDefaultRolesExist().catch(
      (err) => logger.warn('[bootstrapAdmin] default roles check failed', { error: (err as Error).stack })
    );

    warnIfTooFewOwners().catch(
      (err) => logger.warn('[bootstrapAdmin] owners count check failed', { error: (err as Error).stack })
    );
  });

  /*
   * attaches the LiveQuery WebSocket server to this same http.Server/port — clients upgrade
   * their existing http(s):// connection to ws(s):// instead of dialing a separate service.
   * redisURL must match the one passed to the `liveQuery` option above: the publisher (afterSave/
   * afterDelete hooks, wired via that option) and this subscriber each open their own Redis
   * pub/sub connection — if only one side had redisURL, the other would fall back to Parse
   * Server's in-process EventEmitter and events would never reach this subscriber.
   */
  ParseServer.createLiveQueryServer(httpServer, {
    classNames: LIVE_QUERY_CLASS_NAMES,
    redisURL: process.env.UPSTASH_REDIS_URL,
  }).catch(
    (err: Error) => logger.warn('[LiveQuery] startup failed', { error: err.stack })
  );
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
