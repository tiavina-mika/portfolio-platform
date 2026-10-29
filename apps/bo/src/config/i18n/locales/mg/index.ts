import type enResources from '../en';

import cms from './_core/cms.json';
import common from './_core/common.json';
import dashboard from './_core/dashboard.json';
import project from './_core/entity.json';
import finance from './_core/finance.json';
import route from './_core/route.json';
import statistics from './_core/statistics.json';
import userInbox from './_core/user/inbox.json';
import userNotification from './_core/user/notification.json';
import userPayment from './_core/user/payment.json';
import user from './_core/user/user.json';
import zod from './_core/zod.json';
import projectDashboard from './_domain/project-dashboard.json';
import projectEntity from './_domain/project-entity.json';
import projectRoute from './_domain/project-route.json';

/*
 * checked against the English shape: a key missing here fails the build. The back-office has no
 * fallback language (it would be downloaded for every admin who does not read it), so a missing key
 * would otherwise show up as its raw path on screen
 */
type LocaleShape = typeof enResources;

export default {
  common,
  cms,
  dashboard: { ...dashboard, ...projectDashboard },
  finance,
  route: { ...route, ...projectRoute, website: { ...route.website, ...projectRoute.website } },
  statistics,
  user: {
    ...user, ...userInbox, ...userNotification, ...userPayment,
  },
  /*
   * the field names and generic messages the zod resolver builds its errors from — read directly
   * by `zod-i18n.ts`, and served as a namespace too so a validator can name one by hand
   */
  zod,
  project: { ...project, ...projectEntity },
} satisfies LocaleShape;
