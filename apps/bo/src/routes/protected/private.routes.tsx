import { createRoute, redirect } from '@tanstack/react-router';
import Parse from 'parse';
import { z } from 'zod';

import DashboardLayout from '@/pages/DashboardLayout';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import { onSettingsEnter } from '@/redux/actions/app.action';
import { checkSession } from '@/redux/actions/auth.action';
import { onEnter, onDashboardEnter } from '@/redux/actions/util.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/role.reducer';
import { PATH_NAMES } from '@/utils/pathnames';

import articleRoutes, { articlesLayout } from './article.routes';
import categoryRoutes, { categoriesLayout } from './category.routes';
import contactRoutes, { contactsLayout } from './contact.routes';
import miscRoutes, { jobsRoute, miscLayout, testsRoute } from './misc.routes';
import pageRoutes, { pagesLayout } from './page.routes';
import projectRoutes, { projectsLayout } from './project.routes';
import rolesRoute from './role.routes';
import userRoutes, { usersLayout } from './users.routes';
import { appLayout } from '../routes';
import pageSectionRoutes, { pageSectionsLayout } from './pageSection.routes';

/**
 * add id to pathless route (sub layouts)
 * @see: https://github.com/TanStack/router/discussions/696
 */
export const privateLayout = createRoute({
  id: 'private',
  getParentRoute: () => appLayout,
  component: DashboardLayout,
  beforeLoad: async ({
    context, location,
  }) => {
    const {
      store,
    } = context;

    // check if there is user and if the session is still valid before entering the dashboard
    await store?.dispatch(checkSession());
    if (store) {
      const user = await Parse.User.currentAsync();

      // load / check roles
      await store.dispatch(onDashboardEnter());
      // get current user roles (from store)
      const roles = getRoleCurrentUserRolesSelector(store.getState());

      // only those with roles can access the dashboard
      if (roles.length === 0) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: PATH_NAMES.logout,
          search: { redirect: location.href },
        });
      }

      /*
       * If the user is logged out, redirect them to the login page
       * NOTE: redirect is only available in beforeLoad and loader (not in component or in action)
       */
      if (!user) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: PATH_NAMES.login,
          search: {

            /*
             * Use the current location to power a redirect after login
             * (Do not use `router.state.resolvedLocation` as it can
             * potentially lag behind the actual current location)
             */
            redirect: location.href,
          },
        });
      }
    }
  },
});

const homeRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Home,
  path: '/',
});

const profileRoute = createRoute({
  getParentRoute: () => privateLayout,
  component: Profile,
  path: PATH_NAMES.profile,
});

export const settingsRoute = createRoute({
  validateSearch: search => z.object({ tab: z.string().optional() }).parse(search),
  getParentRoute: () => privateLayout,
  component: Settings,
  beforeLoad: onEnter(onSettingsEnter),
  path: PATH_NAMES.settings,
});

const privateRoutes = privateLayout.addChildren([
  homeRoute,
  // use addChildren in the root because of type errors
  miscLayout.addChildren(miscRoutes),
  jobsRoute,
  testsRoute,
  articlesLayout.addChildren(articleRoutes),
  projectsLayout.addChildren(projectRoutes),
  contactsLayout.addChildren(contactRoutes),
  pagesLayout.addChildren(pageRoutes),
  pageSectionsLayout.addChildren(pageSectionRoutes),
  usersLayout.addChildren(userRoutes),
  profileRoute,
  settingsRoute,
  rolesRoute,
  categoriesLayout.addChildren(categoryRoutes),
]);

export default privateRoutes;
