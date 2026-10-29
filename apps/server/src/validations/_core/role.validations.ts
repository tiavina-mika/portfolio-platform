import {
  COUNTRIES, ROLE_SESSION_TIMEOUT_MAX_MINUTES, ROLE_SESSION_TIMEOUT_MIN_MINUTES,
} from '@shared/constants';
import {
  string, object, array, boolean, partialRecord, number,
} from 'zod';

import { collections } from '@/constants/_core/constants';
import {
  ROLE_LABEL_MAX_LENGTH, ROLE_NAME_MAX_LENGTH, ROLE_NAME_PATTERN, ROLE_NAMES_LISTED_MAX_COUNT,
  ROLE_NAMES_MAX_COUNT,
} from '@/constants/_core/role.constants';

import { localeFieldSchema } from './util.validations';

export const roleNamesSchema = object({
  roleNames: array(string().optional()),
});

export const addRolesToUserSchema = roleNamesSchema.extend({
  userId: string(),
  roleNames: array(string()).min(1).max(ROLE_NAMES_MAX_COUNT),
});

export const getRolesDelegationSchema = object({
  userId: string(),
  roleNames: array(string()).max(ROLE_NAMES_LISTED_MAX_COUNT),
});

export const removeRolesForUserSchema = object({
  userId: string(),
  roleNames: array(string()).min(1).max(ROLE_NAMES_MAX_COUNT),
});

const validClassNamesList: string[] = [
  ...Object.values(collections),
  '_Role',
];

const validClassNames = string().refine(
  (value) => validClassNamesList.includes(value),
  { message: 'Invalid class name' }
);

const rightsEntrySchema = object({
  className: validClassNames,
  rights: object({
    create: boolean(),
    update: boolean(),
    get: boolean(),
    find: boolean(),
    delete: boolean(),
    destroy: boolean(),
  }).partial(),
});

// ex: { fr: { label: 'Manager' }, en: { label: 'Manager' } }
const roleTranslatedSchema = partialRecord(
  localeFieldSchema,
  object({ label: string().max(ROLE_LABEL_MAX_LENGTH).optional() })
).optional();

/*
 * a role's own back-office inactivity timeout, overriding the BO default — `null` clears it back
 * to the default, `undefined` leaves whatever is already stored untouched. Bounded on both ends:
 * without a floor an administrator could log everyone out instantly, without a ceiling the
 * inactivity protection could be silently turned off
 */
const sessionTimeoutMinutesSchema = number()
  .int()
  .min(ROLE_SESSION_TIMEOUT_MIN_MINUTES)
  .max(ROLE_SESSION_TIMEOUT_MAX_MINUTES)
  .nullish();

/*
 * the countries a role covers, each one a country the platform runs in. An empty list is a role for
 * every country; `undefined` leaves whatever is already stored untouched
 */
const roleCountriesSchema = array(
  string().refine((code) => code in COUNTRIES)
).max(Object.keys(COUNTRIES).length).optional();

// applied at creation only: roles created before this format was enforced keep their name
const roleNameSchema = string().regex(ROLE_NAME_PATTERN).max(ROLE_NAME_MAX_LENGTH);

export const createRoleSchema = object({
  roleName: roleNameSchema,
  childRoleNames: array(string()).max(10).optional(),
  rights: array(rightsEntrySchema).max(50).optional(),
  ui: array(string()).max(50).optional(),
  translated: roleTranslatedSchema,
  sessionTimeoutMinutes: sessionTimeoutMinutesSchema,
  countries: roleCountriesSchema,
});

export const updateRoleSchema = object({
  name: string(),
  childRoleNames: array(string()).max(10).optional(),
  rights: array(rightsEntrySchema).max(50).optional(),
  ui: array(string()).max(50).optional(),
  translated: roleTranslatedSchema,
  sessionTimeoutMinutes: sessionTimeoutMinutesSchema,
  countries: roleCountriesSchema,
});

// the review of the highest-role accounts takes no filter: there are only a handful of them
export const getHighestRoleAccountsSchema = object({});
