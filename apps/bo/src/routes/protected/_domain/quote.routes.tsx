import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { onEnter } from '@/redux/actions/_core/util.action';
import { onQuotesEnter } from '@/redux/actions/_domain/quote.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { quotesRouteSearchParams } from '@/validations/_domain/quote.validation';

const Quotes = lazy(() => import('@/pages/_domain/quote/Quotes'));

// the quotes of the Aldaron workspace: one list, written and edited in a dialog over it
export const quotesRoute = createRoute({
  validateSearch: search => quotesRouteSearchParams.parse(search),
  getParentRoute: () => privateLayout,
  beforeLoad: onEnter(onQuotesEnter),
  component: Quotes,
  path: PATH_NAMES.quotes,
  staticData: { breadcrumb: { labelKey: 'project:quote.quotes' } },
});
