import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import privateRouter from './routes/protected/private.routes';
import publicRouter from './routes/public/auth.routes';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { initializeParse } from './utils/parse.utils';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    IS_LOCAL: boolean;
    IS_PROD: boolean;
    IS_PREPROD: boolean;
  }
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Register {
    router: typeof privateRouter | typeof publicRouter;
  }
}

initializeParse();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
