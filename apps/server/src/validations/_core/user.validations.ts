import {
  CONSENT_VERSION, DEFAULT_PROFILE_VISIBILITY, EMERGENCY_CONTACT_NAME_MAX_LENGTH,
  FIXED_VISIBILITY_PROFILE_FIELDS,
} from '@shared/constants';
import {
  ContactChangeTypeEnum, EmergencyContactRelationshipEnum, ProfileFieldEnum, ProfileVisibilityEnum, SexEnum,
} from '@shared/types';
import { getSmsCountryByDialCode, isNationalMobileNumber } from '@shared/utils';
import { isAtLeastMinimumAge } from '@shared/validations';
import { z } from 'zod';


import { isSamePhone } from '@/utils/_core/phone.utils';
import { capitalizeFirstLetter } from '@/utils/_core/utils';
import { localeFieldSchema, objectIdFieldSchema } from '@/validations/_core/util.validations';

export const SEX_CHANGE_LIMIT = 2;

export const RoleNamesSchema = z.array(z.string());

export const lastNameFieldSchema = z
  .string()
  .nonempty()
  .max(112);

export const firstNameFieldSchema = z
  .string()
  .max(112)
  .optional();

export const phoneFieldSchema = z.object({
  code: z.string(),
  number: z.string().or(z.number()),
});

export const signUpInfoSchema = z.object({
  lastName: z.string()
    .nonempty()
    .max(112)
    .transform(capitalizeFirstLetter),
  firstName: z.string()
    .max(112)
    .optional()
    .transform(val => val ? capitalizeFirstLetter(val) : val),
  phone: phoneFieldSchema,
  sex: z.enum(SexEnum),
  birthday: z.date()
    .refine(isAtLeastMinimumAge, { params: { key: 'minimumAgeNotMet' } }),
  address: z.string()
    .max(150)
    .optional()
    .transform(val => val ? capitalizeFirstLetter(val) : val),
  aboutMe: z.string().max(500).optional(),
});

/**
 * Validates the RGPD consent sent by the client at sign-up (mobile/web only, not BO). The
 * acceptance timestamp itself is stamped server-side in the User beforeSave trigger — the
 * client's clock can't be trusted as proof of consent time.
 */
export const consentSchema = z.object({
  consentVersion: z.string().refine((value) => value === CONSENT_VERSION, {
    params: { key: 'consentVersionMismatch' },
  }),
});

export const sexChangeSchema = z.object({
  sexChangeCount: z.number().refine(
    (count) => count < SEX_CHANGE_LIMIT,
    { params: { key: 'sexChangeLimitReached' } }
  ),
});

export const SaveLanguageSchema = z.object({
  locale: z.string(),
});

/**
 * user creation is not the same for the backoffice and the website or mobile app
 * @param locale
 * @returns
 */
export const userCreationFromBOSchema = z.object({
  email: z.string().email().nonempty(),
  lastName: z.string()
    .max(112),
  firstName: z.string()
    .max(112)
    .optional(),
  password: z.string()
    .min(8)
    .max(64),
  invitationToken: z.string().nonempty(),
});

export const userActivityStatsSchema = z.object({
  userId: z.string().nonempty(),
  months: z.number().min(1).max(24).optional(),
});

/**
 * `select` is a hint, not a grant: the function intersects it with the public profile field list
 * before querying, so an unexpected field name is dropped rather than served.
 */
export const getUserProfileSchema = z.object({
  id: objectIdFieldSchema,
  select: z.array(z.string()).max(40).optional(),
  locale: localeFieldSchema.optional(),
});

export const deleteAccountSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const exportMyDataSchema = z.object({});

/**
 * `profileVisibility` as the member writes it on their own account: fixed keys (the profile
 * fields), one of the three audiences each — anything else is refused rather than stored. A field
 * whose audience is a product rule only accepts its default audience.
 */
export const profileVisibilitySchema = z.object({
  profileVisibility: z.partialRecord(z.enum(ProfileFieldEnum), z.enum(ProfileVisibilityEnum)).refine(
    (visibility) => FIXED_VISIBILITY_PROFILE_FIELDS.every(
      (field) => visibility[field] === undefined || visibility[field] === DEFAULT_PROFILE_VISIBILITY[field]
    )
  ),
});

/**
 * `emergencyContact` as the member writes it on their own account (absent once removed), read with
 * the account's own `phone` so the member cannot list themselves: the whole point is someone else
 * to warn. The number is expected normalized (bare dial code, no leading 0) — the trigger does it.
 */
export const emergencyContactSchema = z.object({
  emergencyContact: z.object({
    name: z.string().trim().nonempty().max(EMERGENCY_CONTACT_NAME_MAX_LENGTH),
    relationship: z.enum(EmergencyContactRelationshipEnum),
    phone: z.object({
      code: z.string(),
      number: z.string(),
    }).refine(
      // the SOS texts this number: only a country an SMS provider reaches, its code stored bare
      (phone) => {
        const country = getSmsCountryByDialCode(phone.code);

        return !!country && !phone.code.startsWith('+') && isNationalMobileNumber(phone.number, country);
      },
      { params: { key: 'invalidEmergencyContactPhone' } }
    ),
  }).optional(),
  phone: phoneFieldSchema.optional(),
}).refine(
  ({ emergencyContact, phone }) => !emergencyContact || !phone ||
    !isSamePhone(emergencyContact.phone, { code: phone.code, number: String(phone.number) }),
  { params: { key: 'emergencyContactIsOwnPhone' }, path: ['emergencyContact'] }
);

/**
 * A new login email or phone number, sent a code before it replaces the current one. One object
 * rather than a discriminated union, so it stays a plain object schema like every function schema;
 * the refinement makes the value the `type` names mandatory.
 */
export const contactChangeValueShape = {
  type: z.enum(ContactChangeTypeEnum),
  email: z.string().trim().email().max(120).optional(),
  phone: z.object({
    code: z.string().trim().regex(/^\+?\d{1,4}$/),
    number: z.string().trim().regex(/^\d{6,12}$/),
  }).optional(),
};

/** Whether the value the `type` of a contact change names was actually given. */
export const hasContactChangeValue = (value: {
  type: `${ContactChangeTypeEnum}`; email?: string; phone?: unknown;
}): boolean => (value.type === ContactChangeTypeEnum.EMAIL ? !!value.email : !!value.phone);

export const requestContactChangeSchema = z.object({
  ...contactChangeValueShape,
  locale: localeFieldSchema.optional(),
}).refine(hasContactChangeValue, { path: ['type'] });

export const confirmContactChangeSchema = z.object({
  code: z.string().trim().length(6),
  locale: localeFieldSchema.optional(),
});

/** A number the driver wants to be paid on, sent a code before it can receive a payout */
export const requestPayoutPhoneVerificationSchema = z.object({
  phone: contactChangeValueShape.phone.unwrap(),
  locale: localeFieldSchema.optional(),
});

export const confirmPayoutPhoneVerificationSchema = confirmContactChangeSchema;
