import articleRoutes, { articlesLayout } from '@/routes/protected/_core/article.routes';
import broadcastRoute from '@/routes/protected/_core/broadcast.routes';
import categoryRoutes, { categoriesLayout } from '@/routes/protected/_core/category.routes';
import contactRoutes, { contactsLayout } from '@/routes/protected/_core/contact.routes';
import financeRoutes, { financeLayout } from '@/routes/protected/_core/finance.routes';
import miscRoutes, { miscLayout } from '@/routes/protected/_core/misc.routes';
import notificationRoutes, { notificationsLayout } from '@/routes/protected/_core/notification.routes';
import pageRoutes, { pagesLayout } from '@/routes/protected/_core/page.routes';
import pageSectionRoutes, { pageSectionsLayout } from '@/routes/protected/_core/pageSection.routes';
import paymentRoutes, { paymentsLayout } from '@/routes/protected/_core/payment.routes';
import {
  aboutRoute, homeRoute, profileRoute, settingsRoute,
} from '@/routes/protected/_core/private.routes';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import reportRoutes, { reportsLayout } from '@/routes/protected/_core/report.routes';
import roleRoutes, { rolesLayout } from '@/routes/protected/_core/role.routes';
import {
  statisticsCancellationsRoute,
  statisticsOverviewRoute,
  statisticsPaymentsRoute,
  statisticsReportsRoute,
  statisticsUsersRoute,
} from '@/routes/protected/_core/statistics.routes';
import userRoutes, { usersLayout } from '@/routes/protected/_core/users.routes';
import projectRoutes, { projectsLayout } from '@/routes/protected/_domain/project.routes';

/**
 * Composition point of the private route tree: the only place that lists the core routes and the
 * domain ones side by side. The files under `_core/` declare their own routes and never import a
 * domain one, so removing the domain means removing its lines here.
 */
const privateRoutes = privateLayout.addChildren([
  homeRoute,
  // use addChildren in the root because of type errors
  miscLayout.addChildren(miscRoutes),
  statisticsOverviewRoute,
  statisticsUsersRoute,
  statisticsPaymentsRoute,
  statisticsCancellationsRoute,
  statisticsReportsRoute,
  articlesLayout.addChildren(articleRoutes),
  paymentsLayout.addChildren(paymentRoutes),
  financeLayout.addChildren(financeRoutes),
  projectsLayout.addChildren(projectRoutes),
  pagesLayout.addChildren(pageRoutes),
  pageSectionsLayout.addChildren(pageSectionRoutes),
  usersLayout.addChildren(userRoutes),
  profileRoute,
  settingsRoute,
  aboutRoute,
  notificationsLayout.addChildren(notificationRoutes),
  broadcastRoute,
  reportsLayout.addChildren(reportRoutes),
  rolesLayout.addChildren(roleRoutes),
  contactsLayout.addChildren(contactRoutes),
  categoriesLayout.addChildren(categoryRoutes),
]);

export default privateRoutes;
