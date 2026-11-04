import Parse from 'parse';

import { LOCAL_NETWORK_HOSTNAME, SERVER_PORT } from '@/constants/_core/app.constants';

/**
 * initialize parse server
 * depending in the environment, it will use the local server or the remote server
 */
export const initializeParse = () => {
  Parse.initialize(import.meta.env.VITE_PARSE_APP_ID, 'xxx');

  const {
    origin,
  } = window.location;

  const IS_LOCAL = origin.includes(LOCAL_NETWORK_HOSTNAME) || origin.includes('127.0.0.1');
  const IS_PREPROD = origin.includes('preprod');
  const IS_PROD = !IS_LOCAL && !IS_PREPROD;

  window.IS_LOCAL = IS_LOCAL;
  window.IS_PREPROD = IS_PREPROD;
  window.IS_PROD = IS_PROD;

  const parseServerURL = IS_LOCAL
    ? `http://localhost:${SERVER_PORT}/parse`
    : `${origin}/parse`;

  Parse.serverURL = parseServerURL;

  /*
   * LiveQuery WebSocket server is attached to the same host/port as the REST API (see
   * `ParseServer.createLiveQueryServer(httpServer, ...)` in apps/server/src/index.ts) — same
   * origin, just an http(s) -> ws(s) protocol swap, and no `/parse` path since the WebSocket
   * upgrade is accepted on the raw http.Server, not routed through Express
   */
  Parse.liveQueryServerURL = (IS_LOCAL
    ? `http://localhost:${SERVER_PORT}`
    : origin
  ).replace(/^http/, 'ws');
};
