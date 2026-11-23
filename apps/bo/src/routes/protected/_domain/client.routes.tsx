import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { onEnter } from '@/redux/actions/_core/util.action';
import { onClientsEnter } from '@/redux/actions/_domain/client.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { clientsRouteSearchParams } from '@/validations/_domain/client.validations';

const Clients = lazy(() => import('@/pages/_domain/client/Clients'));

// the clients of the Aldaron workspace: one list, created and edited in a dialog over it
export const clientsRoute = createRoute({
  validateSearch: search => clientsRouteSearchParams.parse(search),
  getParentRoute: () => privateLayout,
  beforeLoad: onEnter(onClientsEnter),
  component: Clients,
  path: PATH_NAMES.clients,
  staticData: { breadcrumb: { labelKey: 'project:client.clients' } },
});
