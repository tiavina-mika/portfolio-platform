import {
  DEFAULT_ROLES,
  HIGHEST_LEVEL_ROLES,
} from '@shared/constants';
import { NotificationTypeEnum, PlatformEnum, SexEnum } from '@shared/types';
import { capitalize } from 'string-ts';

import type { ISelectOption, TranslatedFieldOption } from '@/types/_core/app.type';

import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/_core/app.constants';
import { IRights, IRightsItem } from '@/types/_core/role.type';

export {
  DEFAULT_ROLES, HIGHEST_LEVEL_ROLES,
};

/*
 * ---------------------------------------------------------//
 * ---- fixing bug for await Parse.User.currentAsync() ---- //
 * ---------------------------------------------------------//
 */
/**
 * await Parse.User.currentAsync() save an user as bad ParseUser into localStorage
 * see https://github.com/parse-community/Parse-SDK-JS/issues/992
 */
export const userLocalStorageKey = 'Parse/' + import.meta.env.VITE_PARSE_APP_ID + '/currentUser';

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

export const notificationTypeOptions: ISelectOption[] = [
  {
    label: i18n.t('user:notifications.types.ride'),
    value: NotificationTypeEnum.RIDE,
  },
  {
    label: i18n.t('user:notifications.types.request'),
    value: NotificationTypeEnum.REQUEST,
  },
  {
    label: i18n.t('user:notifications.types.rate'),
    value: NotificationTypeEnum.RATE,
  },
  {
    label: i18n.t('user:notifications.types.account'),
    value: NotificationTypeEnum.ACCOUNT,
  },
  {
    label: i18n.t('user:notifications.types.ticket'),
    value: NotificationTypeEnum.TICKET,
  },
  {
    label: i18n.t('user:notifications.types.vehicle'),
    value: NotificationTypeEnum.VEHICLE,
  },
  {
    label: i18n.t('user:notifications.types.announcement'),
    value: NotificationTypeEnum.ANNOUNCEMENT,
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

// options for select input (Not used)
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
export const accountEmailVerificationOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('user:emailVerified'),
    value: true,
  },
  {
    label: i18n.t('user:emailNotVerified'),
    value: false,
  },
];

export const accountPhoneVerificationOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('user:phoneVerified'),
    value: true,
  },
  {
    label: i18n.t('user:phoneNotVerified'),
    value: false,
  },
];

/*
 * PROFILE COMPLETENESS — where the ratio of filled-in profile items has to land for the users list
 * to call a profile finished, and where it stops being a profile the operator can work with at
 * all. The middle band is the normal case (an account fills its profile in over time), so only the
 * two ends carry a loud tone.
 */
export const PROFILE_COMPLETENESS_COMPLETE_RATIO = 1;
export const PROFILE_COMPLETENESS_PARTIAL_RATIO = 0.5;

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
  {
    label: i18n.t('user:auditLogs.auditLogs'),
    tab: i18n.t('route:tabs.auditLogs'),
    key: 'auditLog',
    value: true,
  },
  ...recycleBinTabOptions,
];


export const roleTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'label', required: true, max: 100, transform: capitalize },
];

export const defaultRights: IRights = {
  create: false,
  find: false,
  get: false,
  update: false,
  delete: false,
  destroy: false,
};

/**
 * Read → write → delete order, matching an admin's natural reasoning ("can I see it?" before
 * "can I create/edit it?" before "can I remove it?") instead of the declaration order of
 * `defaultRights`. Drives the row order of the rights matrix in `RightsTableInput.tsx`.
 */
export const RIGHTS_DISPLAY_ORDER: (keyof IRights)[] = [
  'find', 'get', 'create', 'update', 'delete', 'destroy',
];

/**
 * The sidebar group each entity belongs to, in the order the rights panel lists them — an admin
 * looks for "Payments" where they find it in the menu, not in an alphabetical wall of resources.
 */
/** the sections of the role form, in the order its summary lists them */
export const ROLE_FORM_SECTIONS = ['identity', 'access', 'rights'] as const;
export type RoleFormSection = typeof ROLE_FORM_SECTIONS[number];

export const RIGHTS_GROUPS = ['operations', 'community', 'content', 'finance', 'admin'] as const;
export type RightsGroup = typeof RIGHTS_GROUPS[number];

/**
 * The shortcuts offered on one entity: each is the set of rights it grants. A right the signed-in
 * admin does not hold themselves is left out when a preset is applied.
 */
export const RIGHTS_PRESETS: Record<'none' | 'read' | 'manage' | 'all', (keyof IRights)[]> = {
  none: [],
  read: ['find', 'get'],
  manage: ['find', 'get', 'create', 'update'],
  all: ['find', 'get', 'create', 'update', 'delete'],
};

const rightsEntityGroups: Record<string, RightsGroup> = {
  _User: 'community',
  Contact: 'community',
  Report: 'community',
  Notification: 'community',
  Article: 'content',
  Page: 'content',
  Category: 'content',
  Payment: 'finance',
  _Role: 'admin',
  UserAuditLog: 'admin',
};

export const getRightsEntityGroup = (className: string): RightsGroup => (
  rightsEntityGroups[className] ?? 'admin'
);

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
    label: i18n.t('cms:category.categories'),
    className: 'Category',
  },
  {
    label: i18n.t('user:contacts.contact'),
    className: 'Contact',
  },
  {
    label: i18n.t('user:payments.payments'),
    className: 'Payment',
  },
  {
    label: i18n.t('user:notifications.notifications'),
    className: 'Notification',
  },
  {
    label: i18n.t('user:reports.reports'),
    className: 'Report',
  },
  {
    label: i18n.t('user:auditLogs.auditLogs'),
    className: 'UserAuditLog',
  },
];

/**
 * Open registry: a business domain (ride/request/vehicle) contributes its own entities to the
 * generic role rights table (`containers/roles/RoleForm.tsx`) instead of this generic constants
 * file hard-coding `Ride`/`Request`/`Vehicle`, so the generic core stays reusable by a non-carpooling clone.
 */
const extraRightsEntities: Omit<IRightsItem, 'rights'>[] = [];

export const registerRightsEntities = (
  entities: Omit<IRightsItem, 'rights'>[],
  group: RightsGroup
): void => {
  extraRightsEntities.push(...entities);
  entities.forEach((entity) => {
    rightsEntityGroups[entity.className] = group;
  });
};

export const getRightsEntities = (): Omit<IRightsItem, 'rights'>[] => [
  ...ENTITIES_WITH_RIGHTS_OPTIONS,
  ...extraRightsEntities,
];

export const SIGNUP_TOTAL_STEP = 3;

export const ROLE_DEFAULT_LIMIT = 10;

/*
 * the review of the accounts holding the highest powers: an account nobody signed in with for this
 * long is one to check or to withdraw, and the server refuses to run with fewer owners than the
 * minimum — one locked out of their account could then never be unlocked by another
 */
export const HIGHEST_ROLE_STALE_LOGIN_DAYS = 90;
export const HIGHEST_ROLE_MIN_OWNERS = 2;
export const RELATION_OPTIONS_LIMIT = 200;

/*
 * how many rows each list of the user detail page shows: the latest few, enough to answer "what
 * happened lately" — the full history is one "view all" away, on the list page it comes from
 */
export const USER_DETAIL_BLOCK_LIMIT = 5;
// the audit trail mixes five kinds of actions, so a few more rows are needed to see a pattern
export const USER_AUDIT_TRAIL_LIMIT = 8;
// a ticket thread read inline under its row: the whole of it, a support thread stays short
export const USER_TICKET_THREAD_LIMIT = 50;

export const DISABLE_USER_ACCOUNT_CONFIRMATION = false;
export const VERIFICATION_CODE_LENGTH = 6;

/*
 * Limits of the one-off message an administrator writes to a user. The subject matches what a
 * mailbox shows before truncating it in the list; the body is deliberately short — this is a nudge
 * ("verify your number", "finish your profile"), not a letter, and it also has to fit a text
 * message without turning into a long chain of segments.
 */
export const MESSAGE_TO_USER_SUBJECT_MAX_LENGTH = 60;
export const MESSAGE_TO_USER_MAX_LENGTH = 300;

/*
 * The ready-made nudges the message dialog offers, in the order an account is chased: prove the
 * mailbox, prove the handset, then fill in the rest of the profile. Each key names a
 * `user:message.templates.<key>` entry holding the label, the subject and the body.
 */
export const USER_MESSAGE_TEMPLATE_KEYS = ['verifyEmail', 'verifyPhone', 'completeProfile'] as const;

/**
 * The domain of the placeholder address a closed account is given in place of its own: it is not a
 * way to reach anyone, so it must never stand in for the name of the member it belonged to.
 */
export const DELETED_ACCOUNT_EMAIL_DOMAIN = '@deleted.local';

/*
 * How long support can suspend an account from its sessions block, in hours: a day, the time a
 * carrier usually takes to block a stolen SIM, a week. Strings, since each one is the value of a
 * toggle button; `user:sessions.suspension.durations.<hours>` holds the label.
 */
export const SESSION_SUSPENSION_DURATION_HOURS = ['24', '48', '168'] as const;
export const DEFAULT_SESSION_SUSPENSION_DURATION_HOURS = '48';

/*
 * the suspension offered alongside "sign out all devices" for a stolen phone: long enough for the
 * carrier to block the SIM, so the thief cannot sign back in with a code sent to it meanwhile
 */
export const STOLEN_DEVICE_SUSPENSION_HOURS = 48;
