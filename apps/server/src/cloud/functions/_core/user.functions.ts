import { ProfileFieldEnum, type ProfileVisibility, ProfileVisibilityEnum } from '@shared/types';

import { translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  PROFILE_FIELD_COLUMNS, PUBLIC_USER_PROFILE_FIELDS,
} from '@/constants/_core/user.constants';
import { getProfileFieldVisibility, getReadableProfileColumns } from '@/utils/_core/user.utils';
import {
  SaveLanguageSchema, getUserProfileSchema, deleteAccountSchema, exportMyDataSchema,
} from '@/validations/_core/user.validations';

import { assertStepUpVerified } from '../../services/_core/stepUpVerification.service.cloud';
import {
  areTravellingTogether,
  getAccountDeletionBlocker,
  runAccountDeletionCleanups,
} from '../../services/_core/user.service.cloud';
import { getUserDataExport } from '../../services/_core/userDataExport.service.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * Another member's profile, as the app shows it. Two things make the field list non-negotiable
 * here: the query runs with the master key, and the caller chooses the `select`. Left open, any
 * signed-in account could read any column of any account — phone number, mobile money numbers,
 * the encrypted MFA secret and pending verification codes included.
 *
 * Photo, name, sex, age, phone, email, address and presentation each follow the audience the
 * member picked for them (`profileVisibility`): everyone, only the people they are actually
 * travelling with (a confirmed booking either way round — the rule the leading carpooling
 * platforms apply to a phone number), or nobody else. The account's own profile is always whole.
 */
Parse.Cloud.define(
  'getUserProfile',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | boolean> => {
    const currentUser = request.user;
    const { id, select = [], locale } = (request).params;

    if (!currentUser) throw new Error(translate('error.pleaseLogin', locale));

    const isOwnProfile = currentUser.id === id;
    const owner = isOwnProfile ? undefined : await new Parse.Query(Parse.User)
      .equalTo('objectId', id)
      .select(['profileVisibility'])
      .first(USE_MASTER_KEY);
    const visibility = owner?.get('profileVisibility') as ProfileVisibility | undefined;
    // the booking lookup only matters when some field is actually kept for fellow travellers
    const hasRidersOnlyField = Object.values(ProfileFieldEnum).some(
      (field) => getProfileFieldVisibility(visibility, field) === ProfileVisibilityEnum.RIDERS
    );
    const isTravellingTogether = !isOwnProfile && hasRidersOnlyField &&
      await areTravellingTogether(currentUser.id, id);

    const readableFields = [
      ...PUBLIC_USER_PROFILE_FIELDS,
      ...(isOwnProfile
        ? Object.values(PROFILE_FIELD_COLUMNS).flat()
        : getReadableProfileColumns(visibility, isTravellingTogether)),
    ];
    const requestedFields = select.filter((field: string) => readableFields.includes(field));

    const user = await new Parse.Query(Parse.User)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .select(requestedFields.length > 0 ? requestedFields : readableFields)
      .first(USE_MASTER_KEY);

    // should not throw an error
    if (!user) {
      return false;
    }

    return user;
  }),
  parseFunctionValidation(getUserProfileSchema)
);

Parse.Cloud.define(
  'deleteAccount',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    assertStepUpVerified(currentUser);

    const { reason } = request.params;

    const blocker = await getAccountDeletionBlocker(currentUser);

    if (blocker) {
      /*
       * `@types/parse`'s legacy `class Error` (see src/types/global-parse.d.ts) doesn't declare
       * `extends Error`, even though `Parse.Error` does extend the native `Error` at runtime.
       */
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, JSON.stringify(blocker));
    }

    await runAccountDeletionCleanups(currentUser);

    currentUser.set('deleted', true);
    if (reason) currentUser.set('deletionReason', reason);
    await currentUser.save(null, USE_MASTER_KEY);
  }),
  parseFunctionValidation(deleteAccountSchema)
);

/**
 * GDPR right of access/portability (art. 15/20) — self-service, returns every piece of personal
 * data Portfolio holds about the caller as a single JSON payload. Read-only, no side effects.
 */
Parse.Cloud.define(
  'exportMyData',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    return getUserDataExport(currentUser);
  }),
  parseFunctionValidation(exportMyDataSchema)
);

/**
 * Save the language of the account making the call. The target is taken from the session, never
 * from a parameter — an arbitrary `userId` let anyone switch a stranger's app language.
 */
Parse.Cloud.define(
  'saveUserLanguage',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { locale } = request.params;
    const currentUser = request.user;

    if (!currentUser) return;

    currentUser.set('locale', locale);
    await currentUser.save(null, USE_MASTER_KEY);
  }),
  parseFunctionValidation(SaveLanguageSchema)
);
