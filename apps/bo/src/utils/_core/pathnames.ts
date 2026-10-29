import i18n from '@/config/i18n';

export const PATH_NAMES = {
  home: '/',
  users: '/' + i18n.t('route:users'),
  contacts: '/' + i18n.t('route:contacts'),
  notifications: '/' + i18n.t('route:notifications'),
  broadcast: '/' + i18n.t('route:broadcast'),
  reports: '/' + i18n.t('route:reports'),
  ratings: '/' + i18n.t('route:ratings'),
  payments: '/' + i18n.t('route:payments'),
  articles: '/' + i18n.t('route:articles'),
  pages: '/' + i18n.t('route:pages'),
  pageSections: '/' + i18n.t('route:pageSections'),
  categories: '/' + i18n.t('route:categories'),
  admins: '/' + i18n.t('route:admins'),
  login: '/' + i18n.t('route:login'),
  mfaVerify: '/' + i18n.t('route:mfaVerify'),
  changePassword: '/' + i18n.t('route:users'),
  profile: '/' + i18n.t('route:profile'),
  roles: '/' + i18n.t('route:roles'),
  settings: '/' + i18n.t('route:settings'),
  about: '/' + i18n.t('route:about'),
  miscellaneous: '/' + i18n.t('route:miscellaneous'),
  invite: '/invite' as const,
  logout: '/' + i18n.t('route:logout'),
  notFound: '/' + i18n.t('route:notFound'),
  unauthorized: '/' + i18n.t('route:unauthorized'),
  vehicles: '/' + i18n.t('route:vehicles'),
  rides: '/' + i18n.t('route:rides'),
  requests: '/' + i18n.t('route:requests'),
  projects: '/' + i18n.t('route:projects'),
  /*
   * every view sits under the statistics segment: the sidebar holds a single entry for the whole
   * section, and it (like the breadcrumb group) is matched on the first segment of the address
   */
  statistics: {
    root: '/' + i18n.t('route:statistics'),
    users: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsUsers'),
    rides: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsRides'),
    payments: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsPayments'),
    vehicles: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsVehicles'),
    cancellations: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsCancellations'),
    reports: '/' + i18n.t('route:statistics') + '/' + i18n.t('route:statisticsReports'),
  },
  finance: {
    root: '/' + i18n.t('route:finance'),
    drivers: i18n.t('route:financeDrivers'),
  },
  account: {
    root: '/' + i18n.t('route:account'),
    confirmResetPasswordCode: '/' + i18n.t('route:confirmCode'),
    resetPassword: '/' + i18n.t('route:emailResetPassword'),
    verifyAccount: '/' + i18n.t('route:verifyAccount'),
  },

  // static pathnames (no '/' at the beginning)
  create: i18n.t('route:add'),
  edit: i18n.t('route:edit'),
  blocks: i18n.t('route:blocks'),
};
