import { IDefaultPagination, IPagination } from '@/types/app.type';
import { Locale } from '@/types/setting.type';

export const LAYOUT_CONTENT_PADDING = 24;
export const FORCE_DEBUG = false; // show console.log for important data
export const FORCE_DELETE_STORED_DATA = false; // force to delete local stored data
export const SPACING = 16;
export const SPACING_X = 30;
export const SPACING_Y = 16;
export const DEFAULT_LOCALE: Locale = 'fr';
export const PERSISTED_STATE_KEY = 'persist:root';
export const CURRENCY = 'Ar';

export const NOTIFICATION_COLLECTIONS = ['Contact', '_User'];

export const EMAIL_SENDER = import.meta.env.VITE_ADMIN_EMAIL_SENDER;

export const SERVER_PORT = 8089;

/**
 * change this to your ipv4 ip address if you are using LAN network for example
 * NOTE: this should be the same as the server hostname
 */
// export const LOCAL_NETWORK_HOSTNAME = '192.168.88.10';
export const LOCAL_NETWORK_HOSTNAME = 'localhost';
const WEBSITE_PORT = 9012;

export const SIGNUP_TOTAL_STEP = 3;
// eslint-disable-next-line @cspell/spellchecker
export const APP_NAME = 'Tiavina Mika';

export const WEBSITE_URL = {
  // change this to your ipv4 ip address if you are using LAN network for example
  local: `http://${LOCAL_NETWORK_HOSTNAME}:${WEBSITE_PORT}`,
};

export const PREVIEW_PAGE_GRID = {
  left: { xs: 12, md: 8, lg: 9 },
  right: { xs: 12, md: 4, lg: 3 },
  spacing: 2,
};

export const NOTIFICATIONS_COUNT = 10;

export const IMAGES = {
  whiteIconLogo: '/images/icon-logo-white.svg',
  blackIconLogo: '/images/icon-logo-black.svg',
  whiteLogo: '/images/logo-white.svg',
  defaultLogo: '/images/logo.svg',
};

export const COLORS = {
  authBackground: '#000',
  authTextFieldPlaceholder: '#fff',
};

export { DEFAULT_ROLES, HIGHEST_LEVEL_ROLES as HIGHEST_LEVEL_DEFAULT_ROLES } from '@shared/constants';
export const SHOW_NOTIFICATIONS_APP_BAR = false;

export const ROLE_DEFAULT_LIMIT = 10;
export const RELATION_OPTIONS_LIMIT = 200;

const DEFAULT_LIMIT = 20;

export const PAGINATION: IDefaultPagination = {
  selected: [],
  rowsPerPage: DEFAULT_LIMIT,
  rowsPerPageOptions: [DEFAULT_LIMIT, 50, 75],
  orderBy: 'updatedAt',
  order: 'desc',
};

export const DEFAULT_PAGINATION: IPagination = {
  currentPage: 0,
  rowsPerPage: PAGINATION.rowsPerPage,
  orderBy: PAGINATION.orderBy,
  order: PAGINATION.order,
};

export const DEFAULT_QUERIES_INPUT = {
  limit: PAGINATION.rowsPerPage,
  skip: 0,
  orderBy: 'updatedAt',
  order: 'desc',
};

export const DISABLE_USER_ACCOUNT_CONFIRMATION = false;
export const RESPONSIVE_BREAKPOINT = 'lg';
export const SIDEBAR_WIDTH = 266;
export const TOOLBAR_SMALL_SCREEN_HEIGHT = 56;
export const VERIFICATION_CODE_LENGTH = 6;

export const DOWNLOAD_ALERTS_LIMIT = 8;
export const Errors = {
  notFound: '404',
  redirect: 'redirect',
};

export const COLLECTIONS = {
  article: 'Article',
  category: 'Category',
  contact: 'Contact',
  page: 'Page',
  project: 'Project',
  role: '_Role',
  user: '_User',
};
