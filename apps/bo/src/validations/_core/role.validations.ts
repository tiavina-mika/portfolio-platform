import {
  any, array, coerce, object, preprocess, string,
} from 'zod';

import { ROLE_SESSION_TIMEOUT_MAX_HOURS, ROLE_SESSION_TIMEOUT_MIN_HOURS } from '@/constants/_core/auth.constants';
import { roleTranslatedFieldsObj } from '@/constants/_core/user.constants';
import { generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec } from '@/validations/_core/zodSchema.validations';

const translatedRoleFormFieldsSchema = generateTranslatedFieldsInputSchema(roleTranslatedFieldsObj);

/*
 * optional per-role inactivity timeout, asked for in hours and stored in minutes (converted in
 * the role action). The number input hands back an empty string when the admin clears it, which
 * must read as "no override" rather than as the number 0 — hence the preprocess. The bounds are
 * what stops an admin from logging everyone out instantly (too low) or disabling the inactivity
 * protection altogether (too high)
 */
const sessionTimeoutHoursSchema = preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  coerce
    .number()
    .min(ROLE_SESSION_TIMEOUT_MIN_HOURS)
    .max(ROLE_SESSION_TIMEOUT_MAX_HOURS)
    .optional()
).optional();

export const roleSchema = object({
  name: string().nonempty(),
  children: array(string()),
  ui: array(string()).optional(),
  countries: array(string()).optional(),
  rights: array(any()),
  sessionTimeoutHours: sessionTimeoutHoursSchema,
  ...translatedRoleFormFieldsSchema.shape,
}).refine(
  (value: any) => {
    return !value.children.includes(value.name);
  },
  {
    message: 'Error',
    path: ['name'],
  }
);

/**
 * Decode and encode translated fields for role
 * Decode: { 'fr:label': 'Manager' } => { translated: { fr: { label: 'Manager' } } }
 * Encode: { translated: { fr: { label: 'Manager' } } } => { 'fr:label': 'Manager' }
 */
export const roleCodec = getTranslatedFieldsCodec(roleTranslatedFieldsObj);

export const rolesForUserSchema = object({
  roles: string()
    .array(),
});
