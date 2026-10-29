/**
 * The documentation sites served by this server, one per section of the docs. Each section has
 * its own password (`DOCS_<SECTION>_PASSWORD`) and its own build in `clientBuild/docs/<section>`.
 *
 * NOTE: it is also defined in /config/copyDocsBuilds.cjs
 * so if changed here, change it there too
 */
export const DOCS_SECTIONS = ['features', 'business'] as const;

export const DOCS_BUILD_FOLDER = 'clientBuild/docs';

export const DOCS_ROUTE_PREFIX = '/docs';

export const DOCS_COOKIE_PREFIX = 'docs_session_';

/**
 * How long a reader stays signed in before the password is asked again.
 */
export const DOCS_SESSION_DURATION_DAYS = 7;

export const DOCS_SESSION_DURATION_MS = DOCS_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Failed and successful attempts count alike, so a script cannot try passwords faster than this.
 */
export const DOCS_LOGIN_MAX_ATTEMPTS = 10;
export const DOCS_LOGIN_WINDOW = '15 m';
