import i18n from '@/config/i18n';

export const PATH_NAMES = {
  home: '/',
  users: '/' + i18n.t('route:users'),
  contacts: '/' + i18n.t('route:contacts'),
  articles: '/' + i18n.t('route:articles'),
  projects: '/' + i18n.t('route:projects'),
  pages: '/' + i18n.t('route:pages'),
  pageSections: '/' + i18n.t('route:pageSections'),
  categories: '/' + i18n.t('route:categories'),
  admins: '/' + i18n.t('route:admins'),
  login: '/' + i18n.t('route:login'),
  signUp: '/' + i18n.t('route:signup'),
  changePassword: '/' + i18n.t('route:users'),
  profile: '/' + i18n.t('route:profile'),
  roles: '/' + i18n.t('route:roles'),
  settings: '/' + i18n.t('route:settings'),
  miscellaneous: '/' + i18n.t('route:miscellaneous'),
  tests: '/' + i18n.t('route:tests'),
  jobs: '/jobs',
  logout: '/' + i18n.t('route:logout'),
  notFound: '/' + i18n.t('route:notFound'),
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
