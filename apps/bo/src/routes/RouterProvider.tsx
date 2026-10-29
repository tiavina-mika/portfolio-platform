import { RouterProvider as TanstackRouterProvider } from '@tanstack/react-router';

import { Store } from '@/redux/store';

import router from './routes';

type Props = {
  store: Store;
};
const RouterProvider = ({
  store,
}: Props) => {
  return (
    <TanstackRouterProvider context={{ store }} router={router} />
  );
};

export default RouterProvider;
