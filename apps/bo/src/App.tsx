import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import ErrorBoundary from '@/components/ErrorBoundary';
import Loading from '@/components/Loading';

import MuiThemeProvider from './MuiThemeProvider';
import { persistor, store } from './redux/store';
import RouterProvider from './routes/RouterProvider';


const App = () => {
  return (
    <Suspense fallback={<Loading loading />}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HelmetProvider>
            <MuiThemeProvider>
              <ErrorBoundary>
                <RouterProvider store={store} />
              </ErrorBoundary>
            </MuiThemeProvider>
          </HelmetProvider>
        </PersistGate>
      </Provider>
    </Suspense>
  );
};

export default App;
