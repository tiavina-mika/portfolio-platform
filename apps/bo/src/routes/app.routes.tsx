import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import Loading from '@/components/Loading';
import NotFoundPage from '@/pages/_core/NotFoundPage';
import { IRouteContext } from '@/types/_core/app.type';

/*
 * development only: the condition is resolved at build time, so a production bundle neither ships
 * the devtools chunk nor shows the toggle to admins
 */
const RouterDevtools = import.meta.env.DEV
  ? lazy(async () => {
    const { TanStackRouterDevtools } = await import('@tanstack/react-router-devtools');

    return { default: TanStackRouterDevtools };
  })
  : null;

/*
 * The root route lives here rather than beside the tree it roots: every branch of that tree names
 * it as its parent, so keeping it in the file that assembles the tree made the two import each
 * other — and which of the two was left half-built then depended on whichever module the entry
 * point happened to reach first. On its own it imports nothing from the tree, so there is no
 * cycle left to order.
 */
export const appLayout = createRootRouteWithContext<IRouteContext>()({
  component: () => (
    <Suspense fallback={<Loading loading />}>
      <Outlet />
      {/* bottom-right rather than the default bottom-left, where the toggle used to hide the sidebar */}
      {RouterDevtools && <RouterDevtools position="bottom-right" />}
    </Suspense>
  ),
  notFoundComponent: () => (
    <NotFoundPage />
  ),
});
