import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { ISelectOption } from '@/types/app.type';
import { IRights, IRightsItem } from '@/types/role.type';
import {
  SexEnum, PlatformEnum,
} from '@/types/user.type';

// options for user platform
export const userPlatformOptions: ISelectOption[] = [
  {
    label: 'IOS',
    value: 'ios',
  },
  {
    label: 'Android',
    value: 'android',
  },
  {
    label: 'Macos',
    value: 'macos',
  },
  {
    label: 'Windows',
    value: 'windows',
  },
  {
    label: 'Web',
    value: 'web',
  },
  {
    label: 'Back office',
    value: 'bo',
  },
];

// Not used
export const repliedOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('user:contacts.replied'),
    value: true,
  },
  {
    label: i18n.t('user:contacts.notReplied'),
    value: false,
  },
];

// options for select input
export const sexOptions: ISelectOption[] = [
  {
    label: i18n.t('user:male'),
    value: SexEnum.MALE,
  },
  {
    label: i18n.t('user:female'),
    value: SexEnum.FEMALE,
  },
];

// options for select input (not used)
export const onlineOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('user:online'),
    value: true,
  },
  {
    label: i18n.t('user:offline'),
    value: false,
  },
];

// options for select input
export const accountVerificationOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('user:verified'),
    value: true,
  },
  {
    label: i18n.t('user:unverified'),
    value: false,
  },
];

export const usersTabOptions = [
  {
    label: i18n.t('common:news'),
    tab: i18n.t('route:tabs.news'),
    key: 'seen',
    value: false,
  },
  {
    label: i18n.t('user:administrators'),
    tab: i18n.t('common:route.administrators'),
    key: 'platform',
    value: PlatformEnum.BO,
    forAdmin: true,
  },
  ...recycleBinTabOptions,
];

export const defaultRights: IRights = {
  create: false,
  find: false,
  get: false,
  update: false,
  delete: false,
  destroy: false,
};

export const ENTITIES_WITH_RIGHTS_OPTIONS: Omit<IRightsItem, 'rights'>[] = [
  {
    label: i18n.t('user:users'),
    className: '_User', // database collection name
  },
  {
    label: i18n.t('user:role.roles'),
    className: '_Role',
  },
  {
    label: i18n.t('cms:articles'),
    className: 'Article',
  },
  {
    label: i18n.t('cms:pages'),
    className: 'Page',
  },
  {
    label: i18n.t('common:project.project'),
    className: 'Project',
  },
  {
    label: i18n.t('cms:category.categories'),
    className: 'Category',
  },
  {
    label: i18n.t('user:contacts.contact'),
    className: 'Contact',
  },
];
