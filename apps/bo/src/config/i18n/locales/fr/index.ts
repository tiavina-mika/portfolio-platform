import type enResources from '../en';

import cms from './_core/cms.json';
import common from './_core/common.json';
import dashboard from './_core/dashboard.json';
import project from './_core/entity.json';
import route from './_core/route.json';
import userInbox from './_core/user/inbox.json';
import userNotification from './_core/user/notification.json';
import user from './_core/user/user.json';
import zod from './_core/zod.json';
import clientEntity from './_domain/client-entity.json';
import clientRoute from './_domain/client-route.json';
import missionEntity from './_domain/mission-entity.json';
import missionRoute from './_domain/mission-route.json';
import paymentEntity from './_domain/payment-entity.json';
import projectDashboard from './_domain/project-dashboard.json';
import projectEntity from './_domain/project-entity.json';
import projectRoute from './_domain/project-route.json';
import quoteEntity from './_domain/quote-entity.json';
import quoteRoute from './_domain/quote-route.json';

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
  route: {
    ...route,
    ...projectRoute,
    ...clientRoute,
    ...quoteRoute,
    ...missionRoute,
    website: { ...route.website, ...projectRoute.website },
  },
  user: {
    ...user, ...userInbox, ...userNotification,
  },
  /*
   * the field names and generic messages the zod resolver builds its errors from — read directly
   * by `zod-i18n.ts`, and served as a namespace too so a validator can name one by hand
   */
  zod,
  project: {
    ...project, ...projectEntity, ...clientEntity, ...quoteEntity, ...missionEntity, ...paymentEntity,
  },
} satisfies LocaleShape;
