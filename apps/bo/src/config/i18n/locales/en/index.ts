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

export default {
  cms,
  common,
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
};
