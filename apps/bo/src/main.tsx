import { getDayjsLocale, translateDateLocale } from '@shared/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import ReactDOM from 'react-dom/client';

import type router from '@/routes/routes';

import '@/config/domain-registrations';
import { syncZodWithAppLanguage } from '@/config/i18n/zod-i18n';
import { setLocaleSlice } from '@/redux/reducers/_core/settings.reducer';
import { store } from '@/redux/store';
import { Locale } from '@/types/_core/setting.type';
import { getStoredLocale } from '@/utils/_core/settings.utils';

import App from './App';
import 'dayjs/locale/de'; // mock mg
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { validateEnv } from './config/env';
import { getCurrentLocale } from './config/i18n';
import { initializeParse } from './config/parse.config';
import { initializeSentry, syncSentryUser } from './config/sentry';
import { polyfillCryptoRandomUUID } from './utils/_core/crypto.utils';

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
    router: typeof router;
  }
}

// first, so an error thrown while the app starts is reported too
initializeSentry();
syncSentryUser(store);

polyfillCryptoRandomUUID();

// refuse to start without the server settings, then initialize parse server
validateEnv();
initializeParse();

/*
 * everything that depends on the language is set before the first render, so the app mounts once
 * in the right language — i18n already picked it (the persisted setting, else the browser's)
 */
const locale: Locale = getCurrentLocale();

dayjs.locale(getDayjsLocale(locale));
translateDateLocale(locale);
syncZodWithAppLanguage();

// first visit: the detected language becomes the persisted setting
if (!getStoredLocale()) {
  store.dispatch(setLocaleSlice(locale));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
