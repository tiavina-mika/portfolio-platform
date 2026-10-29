import { getDisplayContacts, getDisplayIdentifier } from '@shared/utils';
import {
  FiBell, FiCode, FiCreditCard, FiFileText, FiLayers, FiLayout, FiMessageCircle, FiUsers,
} from 'react-icons/fi';

import type { GlobalSearchEntityKey } from '@/types/_core/globalSearch.type';
import type { Locale } from '@/types/_core/setting.type';
import type { IUser } from '@/types/_core/user.type';
import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';

import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

/*
 * a member who signed up by phone has no email and may have no name yet, and a ticket's requester
 * may have left a number only: the result is named by what exists (name, phone, email), and its
 * second line is the next way to reach them rather than a repeat of the first
 */
const getUserTitle = (item: Record<string, any>): string => getUserFullName(item as IUser) || item.username;

const getUserSubtitle = (item: Record<string, any>): string | undefined =>
  getDisplayContacts(item as IUser).find((contact) => contact !== getUserTitle(item));

const getContactTitle = (item: Record<string, any>): string =>
  getDisplayIdentifier({ lastName: item.name, phone: item.phone, email: item.email });

const getContactSubtitle = (item: Record<string, any>): string | undefined =>
  getDisplayContacts({ phone: item.phone, email: item.email }).find(
    (contact) => contact !== getContactTitle(item)
  );


export interface IGlobalSearchEntityConfig {
  label: string;
  icon: IconType;
  path: keyof typeof PATH_NAMES;
  getTitle: (item: Record<string, any>) => string;
  getSubtitle: (item: Record<string, any>) => string | undefined;
}

/**
 * per-entity display config for the AppBar's global search results dropdown — icons and labels
 * mirror the ones already used for the same entities in SideBar.tsx / NotificationCenter.tsx, for
 * visual consistency across the BO
 */
export const getGlobalSearchEntityConfig = (
  t: TFunction,
  locale: Locale
): Record<GlobalSearchEntityKey, IGlobalSearchEntityConfig> => ({
  article: {
    label: t('cms:articles'),
    icon: FiFileText,
    path: 'articles',
    getTitle: (item) => getTranslatedField(item.translated, locale, 'title'),
    getSubtitle: () => undefined,
  },
  category: {
    label: t('cms:category.categories'),
    icon: FiLayers,
    path: 'categories',
    getTitle: (item) => getTranslatedField(item.translated, locale, 'name'),
    getSubtitle: () => undefined,
  },
  page: {
    label: t('cms:pages'),
    icon: FiLayout,
    path: 'pages',
    getTitle: (item) => getTranslatedField(item.translated, locale, 'title'),
    getSubtitle: () => undefined,
  },
  contact: {
    label: t('user:contacts.contacts'),
    icon: FiMessageCircle,
    path: 'contacts',
    getTitle: getContactTitle,
    getSubtitle: getContactSubtitle,
  },
  user: {
    label: t('user:users'),
    icon: FiUsers,
    path: 'users',
    getTitle: getUserTitle,
    getSubtitle: getUserSubtitle,
  },
  project: {
    label: t('project:project.projects'),
    icon: FiCode,
    path: 'projects',
    getTitle: (item) => getTranslatedField(item.translated, locale, 'name'),
    getSubtitle: (item) => item.society,
  },
  payment: {
    label: t('user:payments.payments'),
    icon: FiCreditCard,
    path: 'payments',
    getTitle: (item) => item.snapshot?.payer?.name,
    getSubtitle: (item) => item.snapshot?.receiver?.name,
  },
  notification: {
    label: t('user:notifications.notifications'),
    icon: FiBell,
    path: 'notifications',
    getTitle: (item) => item.snapshot?.from?.name,
    getSubtitle: (item) => item.snapshot?.from?.email,
  },
});
