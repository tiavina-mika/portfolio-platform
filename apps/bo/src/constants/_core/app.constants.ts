import {
  APP_NAME,
  DEFAULT_COUNTRY,
  PERSISTED_STATE_KEY,
} from '@shared/constants';
import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { Locale } from '@shared/utils';
import { capitalize } from 'string-ts';

import i18n from '@/config/i18n';
import {
  DefaultMUIColorType, IDefaultPagination, IListTabValue, IPagination, ISelectOption,
  TranslatedFieldOption,
} from '@/types/_core/app.type';

export {
  APP_NAME, PERSISTED_STATE_KEY,
};

export const AUTOCOMPLETE_SEARCH_DEBOUNCE_MS = 300;

export const defaultUserEventFields = [
  'created', 'updated', 'deleted', 'seen', 'lastSeen', 'unseen',
];
export const defaultUserPointerFields = defaultUserEventFields.map((field: string) => field + 'By');

/*
 * the tone each of those events takes on the history timeline. The rail of dots is scanned before
 * any of the labels are read, so the colour is what says whether the record appeared, was changed,
 * or left — the readings the back-office acts on. Being opened by a colleague is not one of them,
 * so the three "seen" events stay neutral.
 */
export const USER_EVENT_COLORS: Record<string, DefaultMUIColorType> = {
  created: 'primary',
  updated: 'warning',
  deleted: 'error',
  seen: 'default',
  lastSeen: 'default',
  unseen: 'default',
};

/*
 * the CMS classes name the account that created a record `user` rather than `createdBy`, which is
 * what every other event on the timeline follows
 */
export const CMS_HISTORY_AUTHOR_FIELDS: Record<string, string> = { created: 'user' };

/*
 * the entry of a list's tab counts standing for the tab the strip opens on, which scopes nothing
 * and so has no database field of its own to be keyed by (the other tabs use `IListTabValue.key`)
 */
export const ALL_TAB_COUNT_KEY = 'all';

/*
 * keys a list row carries for the list itself rather than for a column of the table. Both
 * renderings pair the remaining keys with the head cells by position, so anything added here
 * must be skipped by both or every column after it lands under the wrong header.
 */
export const ROW_META_FIELDS = ['id', 'unseen'];

export const unseenTabOption: IListTabValue = {
  label: capitalize(i18n.t('route:tabs.news')),
  tab: i18n.t('route:tabs.news'),
  key: 'seen',
  value: false,
};

/**
 * tab to always show
 */
export const recycleBinTabOptions: IListTabValue[] = [
  {
    label: i18n.t('common:recycleBin'),
    tab: i18n.t('route:tabs.recycleBin'),
    key: 'deleted',
    value: true,
  },
];

export const defaultTabOptions: IListTabValue[] = [
  unseenTabOption,
  ...recycleBinTabOptions,
];

// options for select input
export const booleanOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('common:yes'),
    value: true,
  },
  {
    label: i18n.t('common:no'),
    value: false,
  },
];

export const orderSelectOptions: ISelectOption[] = [
  {
    value: 'asc',
    label: i18n.t('common:ascending'),
  },
  {
    value: 'desc',
    label: i18n.t('common:descending'),
  },
];

/*
 * the translated fields of the website's home header, in the order the settings panel lists them.
 * `title` belongs here even though it is the newest of the three: the public site reads
 * `translated.<locale>.title` for its home heading, and a field left out of this list is neither
 * validated nor written back to the App — it would be edited in the back-office and silently lost.
 */
export const appTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'title', required: true, max: 200 },
  { name: 'description', required: true, max: 200 },
  { name: 'quote', required: true, max: 100 },
];

/*
 * where an admin with no role assigned writes to ask for one — the access-refused page is mounted
 * outside the dashboard, so there is no in-app way to reach anyone from it
 */
export const ADMIN_CONTACT_EMAIL: string = import.meta.env.VITE_ADMIN_EMAIL_SENDER ?? '';

export const IMAGES = {
  whiteIconLogo: '/images/icon-logo-white.svg',
  blackIconLogo: '/images/icon-logo-black.svg',
  whiteLogo: '/images/logo-white.svg',
  defaultLogo: '/images/logo.svg',
};


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

/**
 * safety cap for "export all filtered rows" (CSV/Excel) — bounds the query instead of
 * removing the limit entirely, see .claude/rules/parse-patterns.md query discipline rule
 */
export const EXPORT_MAX_ROWS = 5000;
export const Errors = {
  notFound: '404',
  redirect: 'redirect',
};

export const DEFAULT_LOCALE: Locale = DEFAULT_COUNTRY.locale;

const WEBSITE_PORT = 9002;

/**
 * change this to your ipv4 ip address if you are using LAN network for example
 * NOTE: this should be the same as the server hostname
 */
// export const LOCAL_NETWORK_HOSTNAME = '192.168.88.10';
export const LOCAL_NETWORK_HOSTNAME = 'localhost';

export const WEBSITE_URL = {
  // change this to your ipv4 ip address if you are using LAN network for example
  local: `http://${LOCAL_NETWORK_HOSTNAME}:${WEBSITE_PORT}`,
};

export const NOTIFICATIONS_COUNT = 10;

export const SHOW_NOTIFICATIONS_APP_BAR = false;

/*
 * port of the local server the BO talks to when it runs on localhost — 8090 is the dev one; the
 * E2E suite runs its own server on another port and passes it through VITE_LOCAL_SERVER_PORT
 */
export const SERVER_PORT = Number(import.meta.env.VITE_LOCAL_SERVER_PORT) || 8090;
export const FORCE_DEBUG = false; // show console.log for important data
export const FORCE_DELETE_STORED_DATA = false; // force to delete local stored data

export const DOWNLOAD_ALERTS_LIMIT = 8;

export const COLLECTIONS = {
  article: 'Article',
  category: 'Category',
  contact: 'Contact',
  page: 'Page',
  role: '_Role',
  user: '_User',
  notification: 'Notification',
  payment: 'Payment',
  rating: 'Rating',
  report: 'Report',
  ...DOMAIN_COLLECTIONS,
};

/*
 * how often the badges that cannot be pushed are refetched instead (see
 * LIVE_QUERY_SUBSCRIBABLE_CLASSES). Slow enough that an admin left on a screen all day costs a
 * handful of count queries an hour, quick enough that a new support ticket or report is noticed
 * within the minute it takes someone to walk back to their desk.
 */
export const NOTIFICATION_COUNT_POLL_INTERVAL_MS = 60_000;

/*
 * a badge past this reads as "a lot" either way, and the exact figure is what makes the pill
 * wide enough to push the sidebar label it sits next to out of line
 */
export const NOTIFICATION_BADGE_MAX = 99;

/*
 * how long the badge recounts triggered by LiveQuery events are held back before firing. A
 * bulk action or an import publishes an event per row, each of which would otherwise cost one
 * count query per connected back-office; a fifth of a second is under the threshold at which a
 * badge feels late and long enough to collapse a burst into a single query.
 */
export const NOTIFICATION_COUNT_DEBOUNCE_MS = 200;

export const NOTIFICATION_COLLECTIONS = [
  COLLECTIONS.payment,
  COLLECTIONS.contact,
  COLLECTIONS.user,
  COLLECTIONS.report,
];

// the address the support team answers at — the about page offers it as a link
export const SUPPORT_EMAIL = DEFAULT_COUNTRY.support.email;

/*
 * placeholders for the support lines: the real ones are an operational detail set per environment
 * through VITE_SUPPORT_PHONE_YAS / _AIRTEL / _ORANGE, which win over these
 */
export const DEFAULT_SUPPORT_PHONES = DEFAULT_COUNTRY.support.placeholderPhones;
