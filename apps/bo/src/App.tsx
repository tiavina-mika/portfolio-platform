import dayjs from 'dayjs';
import { Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import i18n, { getCurrentLocale } from './config/i18n';
import { loadZodI18nLocale } from './config/i18n/zod-i18n';
import MuiThemeProvider from './MuiThemeProvider';
import { setLocaleSlice } from './redux/reducers/settings.reducer';
import { persistor, store } from './redux/store';
import RouterProvider from './routes/RouterProvider';
import { Locale } from './types/setting.type';
import { translateDateLocale } from './utils/date.utils';
import { getStoredLocale } from './utils/settings.utils';

const App = () => {
  // detect browser language, then save it to persisted store (redux + local storage)
  useEffect(() => {
    const persistedLocale = getStoredLocale();
    let locale = persistedLocale;

    if (!persistedLocale) {
      // get device lang
      const defaultLocale = getCurrentLocale();

      locale = defaultLocale as Locale;
      // change i18n lang
      i18n.changeLanguage(defaultLocale);
      // save lang to the store
      store.dispatch(setLocaleSlice(defaultLocale));
    }

    // translate date
    dayjs.locale(locale);
    translateDateLocale(locale!);
    // load zod locale for validations messages
    const initAsync = async () => {
      await loadZodI18nLocale(locale!);
    };

    initAsync();
  }, []);

  return (
    <Suspense fallback={<span>Loading</span>}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HelmetProvider>
            <MuiThemeProvider>
              <RouterProvider store={store} />
            </MuiThemeProvider>
          </HelmetProvider>
        </PersistGate>
      </Provider>
    </Suspense>
  );
};

export default App;
