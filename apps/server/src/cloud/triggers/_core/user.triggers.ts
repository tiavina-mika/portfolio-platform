import { DEFAULT_COUNTRY_CODE } from '@shared/constants';
import { getCountryByDialCode } from '@shared/utils';
import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';
import type { ParseTriggerValidation } from '@/types/utils.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  FROM_PROJECT, HIGHEST_LEVEL_ROLES, SKIP_SIGN_UP_VERIFICATION, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { SIGN_UP_IDENTITY_FIELDS } from '@/constants/_core/user.constants';
import { RegisterStepEnum } from '@/types/user.type';
import { logger } from '@/utils/_core/logger';
import { normalizePhone } from '@/utils/_core/phone.utils';
import { resolveSignUpIdentity } from '@/utils/_core/signup-identity.utils';
import { isOwnerEmail } from '@/utils/_core/user.utils';
import { emergencyContactSchema, profileVisibilitySchema } from '@/validations/_core/user.validations';

import { isImpersonatedSessionService } from '../../services/_core/impersonation.service.cloud';
import {
  assertValidInvitationForSignup, findPendingInvitationByEmail, findValidInvitationByToken,
  grantInvitationRoles,
} from '../../services/_core/invitation.service.cloud';
import {
  autoConfirmSignUpIfAllowed, deleteUser, releaseUnverifiedEmailSignup, releaseUnverifiedPhoneSignup,
  saveUserAndSendCodeToEmail, saveUserAndSendCodeToPhone, sendStoredCodeToEmail, sendStoredCodeToPhone,
} from '../../services/_core/user.service.cloud';
import { hasRole, updateRoleForUser } from '../../services/_core/userRole.service.cloud';
import { deleteFile } from '../../utils/_core/file.utils.cloud';
import { runJob } from '../../utils/_core/job.utils.cloud';
import { isHighestRole } from '../../utils/_core/role.utils.cloud';
import {
  generateEncryptedVerificationCode, getUserPlatforms, logoutUserOtherDevices, revertServerManagedUserFields,
} from '../../utils/_core/user.utils.cloud';
import { parseFunction, setBooleanFields, shouldSkipTriggerCascade } from '../../utils/_core/utils.cloud';
import { parseTriggerValidation, signupTriggerValidation } from '../../utils/_core/validation.utils.cloud';


/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  Parse.User,

  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const prevUser = request.original;
    const currentUser = request.user;
    const dirtyKeys = user.dirtyKeys() || [];

    request.context.dirtyKeys = dirtyKeys;

    if (shouldSkipTriggerCascade(request)) {
      logger.info(`Skipping User beforeSave [${user.id}] by ${currentUser?.get('username')} due to disableTriggers flag`);
      return;
    }

    logger.debug(`Start User beforeSave [${user.id}] by ${currentUser?.get('username')} with changed fields: ${dirtyKeys.join(', ')}`);

    /*
     * `_User` is self-managed: the ACL Parse writes at sign-up gives the account write access to
     * its own row, and the CLP stays open enough for profile edits. That leaves every column
     * writable by its owner, including the ones the platform runs on — trip counters, the monthly
     * ride count the commission tier is read from, verification and moderation state. A single
     * `PUT /parse/users/me` was enough to erase a cancellation history or land in the cheapest
     * commission bracket. Reverting the change here (rather than throwing) keeps a legitimate
     * profile save working when the client happens to echo a field back untouched.
     */
    if (!request.master) {
      // at sign-up the email and username are the identity the client types, resolved below
      const revertibleKeys = user.existed()
        ? dirtyKeys
        : dirtyKeys.filter((key) => !SIGN_UP_IDENTITY_FIELDS.includes(key));
      const revertedKeys = revertServerManagedUserFields(user, revertibleKeys);

      if (revertedKeys.length > 0) {
        logger.warn(
          `User beforeSave [${user.id}]: reverted server-managed fields ${revertedKeys.join(', ')}`
        );
      }
    }

    // password change / account deletion are blocked while the caller is an impersonated session
    const impersonationRestrictedFields = ['password', 'deleted'];

    if (impersonationRestrictedFields.some((field) => dirtyKeys.includes(field))) {
      const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;

      if (await isImpersonatedSessionService(currentUser?.getSessionToken())) {
        throw new Error(translate('error.actionBlockedDuringImpersonation', locale));
      }
    }

    // if (user.get('fromBO')) user.unset('fromBO');

    // ----------- creation ----------- //
    if (!user?.existed()) {
      /*
       * a client signing up picks neither its `username` (Parse enforces its uniqueness, so a
       * chosen one squats somebody else's number or email) nor a step that skips the credential
       * checks: the server derives the identity and refuses what it cannot derive one from.
       * Master-key creations (seeds, admin tools) set their own.
       */
      if (!request.master) {
        const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;
        const identity = resolveSignUpIdentity({
          registerStep: user.get('registerStep'),
          email: user.get('email'),
          phone: user.get('phone'),
          isFromBO: user.get('platform') === FROM_PROJECT.BO,
        });

        if (!identity) throw new Error(translate('user.invalidSignUp', locale));

        user.set('username', identity.username);
        if (identity.email) user.set('email', identity.email);
        else user.unset('email');
        if (identity.phone) user.set('phone', identity.phone);
        else user.unset('phone');
      }

      user.set('deleted', false);
      /*
       * the country is derived, never typed: the dial code of the number the account signs up with,
       * the default country for an e-mail sign-up that gave none. Stored once, so a later change of
       * number does not move the account's rules, and every country-specific value is read from it.
       */
      if (!user.get('country')) {
        user.set('country', getCountryByDialCode(user.get('phone')?.code)?.code ?? DEFAULT_COUNTRY_CODE);
      }
      /*
       * the back-office "new accounts" badge and its "Nouveautés" tab both query
       * `equalTo('seen', false)`, and Mongo does not match a document where the field is simply
       * absent — leaving it unset made every freshly registered account invisible to both
       */
      user.set('seen', false);
      /*
       * the home screen's one-off "have a car?" invitation: the app removes the field as soon as
       * it has shown it. Removed rather than set to false so accounts that predate it (no field)
       * and accounts that already saw it read the same way.
       */
      user.set('showDriverBanner', true);
      /*
       * seeded with the counters the app and the back office read on a profile. No refusal
       * counter any more: a driver cannot turn a passenger away before the booking, so what is
       * counted is the bookings they confirmed and the ones they called off afterwards.
       */
      user.set('requestStats', {
        canceled: 0, completed: 0, confirmed: 0, canceledByDriver: 0, totalDistance: 0,
      });
      user.set('rideStats', { canceled: 0, completed: 0, totalDistance: 0 });
      // flipped once by the first ride the account publishes, never back: it decides the app's role tabs
      user.set('hasPublishedRide', false);
      if (user.has('platform')) {
        user.set('platforms', [
          {
            name: user.get('platform'),
            count: 1,
            lastConnectedAt: dayjs().toDate(),
          },
        ]);
      }

      if (user.get('platform') === FROM_PROJECT.BO) {
        const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;
        const invitationToken = user.get('invitationToken');

        await assertValidInvitationForSignup(user.get('email'), invitationToken, locale);

        // stash the raw token (not the live object) — the only channel guaranteed to survive into afterSave
        request.context.invitationToken = invitationToken;
        user.unset('invitationToken');
      } else {
        // server clock, not the client's — this timestamp is the RGPD proof of consent
        user.set('acceptedTermsAt', dayjs().toDate());
      }

      /*
       * a phone-signup account uses its phone number as the login identity (see loginWithPhone) —
       * block creation if that number is already verified on another account, rather than silently
       * creating a second account no one can log into by phone (Parse's own username uniqueness
       * check does not catch this, since the two accounts have different usernames)
       */
      if (user.get('registerStep') === RegisterStepEnum.VERIFY_PHONE) {
        const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;
        const phoneNumber = user.get('phone')?.number;

        const existingVerifiedPhone = await new Parse.Query(Parse.User)
          .equalTo('phone.number', phoneNumber)
          .equalTo('phoneVerified', true)
          .select(['objectId'])
          .first(USE_MASTER_KEY);

        if (existingVerifiedPhone) {
          throw new Error(translate('user.phoneNumberAlreadyUsed', locale));
        }

        await releaseUnverifiedPhoneSignup(phoneNumber);
      }

      // same rule for an address: one only typed, never confirmed, must not lock its real owner out
      if (user.get('registerStep') === RegisterStepEnum.VERIFY_EMAIL) {
        await releaseUnverifiedEmailSignup(user.get('email'));
      }

      /*
       * a sign-up is created with its unconfirmed flag and its code in this very write: setting
       * them in afterSave cost two extra saves of the same row before the response could leave.
       * Test and local environments confirm on the spot instead (see `autoConfirmSignUpIfAllowed`).
       */
      if (user.get('platform') !== FROM_PROJECT.BO) {
        const isPhoneSignUp = user.get('registerStep') === RegisterStepEnum.VERIFY_PHONE;

        user.set('phoneVerified', false);

        if (!SKIP_SIGN_UP_VERIFICATION) {
          if (!isPhoneSignUp) user.set('emailVerified', false);
          user.set(
            'verification',
            generateEncryptedVerificationCode(undefined, isPhoneSignUp ? 'phone' : 'email')
          );
        }
      }

      return;
    }

    // ------------ edition ------------ //
    user.set('updatedBy', currentUser);

    /*
     * checked here rather than in the trigger validator: the validator runs before this handler,
     * so `context.dirtyKeys` is still empty there and a per-field check would never fire
     */
    if (dirtyKeys.includes('profileVisibility')) {
      await parseTriggerValidation(profileVisibilitySchema, ['profileVisibility'])(request);
    }

    /*
     * written straight from the profile like the payment numbers, but checked here because this
     * number is the one the SOS texts: normalized first so every way of typing it is stored — and
     * compared with the account's own number — the same way
     */
    if (dirtyKeys.includes('emergencyContact')) {
      const emergencyContact = user.get('emergencyContact');

      if (emergencyContact?.phone) {
        user.set('emergencyContact', { ...emergencyContact, phone: normalizePhone(emergencyContact.phone) });
      }

      await parseTriggerValidation(emergencyContactSchema, ['emergencyContact', 'phone'])(request);
    }

    // sex and birthday change count and date are always in edition
    if (dirtyKeys.includes('sex') && user.get('sex')) {
      user.increment('sexChangeCount', 1);
      user.set('lastSexChangeAt', dayjs().toDate());
    }

    if (dirtyKeys.includes('birthday') && user.get('birthday')) {
      user.increment('birthdayChangeCount', 1);
      user.set('lastBirthdayChangeAt', dayjs().toDate());
    }

    /*
     * A number another account has already verified cannot become this one's. Without this, the
     * member types it at sign-up step two, receives nothing (the code goes to the real owner) or
     * — worse — confirms it and the save is rejected by the unique index on verified numbers,
     * long after the only moment the message could still be acted on. Said here, it lands on the
     * form that asked for the number.
     */
    if (dirtyKeys.includes('phone') && !request.context.isContactChangeConfirmed) {
      const prevPhoneNumber = prevUser?.get('phone')?.number;
      const newPhoneNumber = user.get('phone')?.number;

      if (newPhoneNumber && newPhoneNumber !== prevPhoneNumber) {
        const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;
        const existingVerifiedPhone = await new Parse.Query(Parse.User)
          .equalTo('phone.number', newPhoneNumber)
          .equalTo('phoneVerified', true)
          .notEqualTo('objectId', user.id)
          .select(['objectId'])
          .first(USE_MASTER_KEY);

        if (existingVerifiedPhone) {
          throw new Error(translate('user.phoneNumberAlreadyUsed', locale));
        }
      }
    }

    /*
     * changing the phone number invalidates its verification — otherwise a user could edit
     * `phone.number` to an arbitrary, never-verified number while `phoneVerified` stays true
     * (a resubmission of the same number, e.g. sign-up step two after a phone sign-up, is not
     * a change and must not un-verify the phone that was just confirmed by OTP). A number replaced
     * from the profile arrives already confirmed by the code sent to it, so it keeps its flag.
     */
    if (dirtyKeys.includes('phone') && user.get('phoneVerified') && !request.context.isContactChangeConfirmed) {
      const prevPhoneNumber = prevUser?.get('phone')?.number;
      const newPhoneNumber = user.get('phone')?.number;

      if (prevPhoneNumber && newPhoneNumber && prevPhoneNumber !== newPhoneNumber) {
        user.set('phoneVerified', false);
      }
    }

    // logout from other devices if password changed
    if (dirtyKeys.includes('password') && currentUser && request.context.logoutOtherDevices) {
      const currentSessionToken = currentUser.getSessionToken();

      if (currentSessionToken) {
        await logoutUserOtherDevices(user, currentSessionToken);
        logger.info(`User ${user.id} logged out from other devices`);
      }
    }

    // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
    setBooleanFields(user, request, ['deleted', 'seen']);

    // anonymise PII when soft-deleted, preserve originals for audit log
    if (dirtyKeys.includes('deleted') && user.get('deleted')) {
      const suffix = user.id;

      user.set('emailBefore', prevUser?.get('email') ?? user.get('email'));
      user.set('usernameBefore', prevUser?.get('username') ?? user.get('username'));
      user.set('firstNameBefore', prevUser?.get('firstName') ?? user.get('firstName'));
      user.set('lastNameBefore', prevUser?.get('lastName') ?? user.get('lastName'));
      user.set('phoneBefore', prevUser?.get('phone') ?? user.get('phone'));
      user.set('email', `deleted_${suffix}@deleted.local`);
      user.set('username', `deleted_${suffix}`);
      user.unset('firstName');
      user.unset('lastName');
      user.unset('phone');
      user.unset('birthday');
      // a third party's number, with no audit value once the account is gone — not kept aside
      user.unset('emergencyContact');
      /*
       * the number is gone, so the flag saying it was confirmed has nothing left to describe —
       * and left behind it would keep the row inside the unique verified-number index
       */
      user.unset('phoneVerified');
    }

    if (!prevUser) return;

    const newPlatforms = getUserPlatforms(prevUser, user);

    user.set('platforms', newPlatforms);
  }),
  // -------- validation -------- //
  signupTriggerValidation() as ParseTriggerValidation
);

/*
 * ----------------------------------------------------- //
 * -------------------- after save --------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.afterSave(
  Parse.User,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const currentUser = request.user;
    const { locale } = request.context;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    logger.debug(`Start User afterSave [${user.id}] by ${currentUser?.id}`);

    if (shouldSkipTriggerCascade(request)) {
      logger.info(`Skipping User afterSave [${user.id}] by ${currentUser?.id} due to disableTriggers flag`);
      return;
    }

    /*
     * -------------------------------- //
     * ----------- creation ----------- //
     * -------------------------------- //
     */
    if (!user.existed()) {
      // verify directly the user if it's a local environment
      if (user.get('platform') === 'bo') {
        if (!(await autoConfirmSignUpIfAllowed(user, 'emailVerified', true))) {
          const updatedUser = await saveUserAndSendCodeToEmail(user, locale as Locale);

          logger.info(`Verification code sent to user ${updatedUser?.id}`);
        }

        const invitationToken = request.context.invitationToken as string | undefined;
        const invitation = invitationToken ? await findValidInvitationByToken(invitationToken) : undefined;

        /*
         * the roles land once the address is proven (local and test confirm on the spot): the
         * session handed out at sign-up must not carry them before the code was typed. Otherwise
         * the update branch below gives them when the code is accepted.
         */
        if (invitation && user.get('emailVerified')) {
          await grantInvitationRoles(user, invitation);
        }
      } else {
        // phone sign-up — there is no email to verify, the phone itself is the OTP-proven channel
        const isPhoneSignUp = user.get('registerStep') === RegisterStepEnum.VERIFY_PHONE;
        const isConfirmedOnTheSpot = await autoConfirmSignUpIfAllowed(
          user, isPhoneSignUp ? 'phoneVerified' : 'emailVerified'
        );

        // the flag and the code were written with the account (see beforeSave): only the sending is left
        if (!isConfirmedOnTheSpot && isPhoneSignUp) {
          await sendStoredCodeToPhone(user, (locale as Locale) ?? 'fr', request.ip);
          logger.info(`Verification code sent to user ${user.id}`);
        } else if (!isConfirmedOnTheSpot) {
          sendStoredCodeToEmail(user, (locale as Locale) ?? 'fr');
          logger.info(`Verification code sent to user ${user.id}`);
        }
      }


      /*
       * -------------------------------------------- //
       * ---- add default role for owner emails ----- //
       * -------------------------------------------- //
       * add to owner role — only once the email is confirmed: anybody can type an owner's address
       * at sign-up, and the role must go to whoever proves they read it. Outside local/test the
       * account is not confirmed yet at this point; the update branch below grants the role when
       * the code is accepted.
       */
      if (user.get('emailVerified') && isOwnerEmail(user.get('email'))) {
        // trusted server-side bootstrap (env-controlled allowlist) — not a user-driven request
        await updateRoleForUser([HIGHEST_LEVEL_ROLES[0]!], user, undefined, { bypassEscalationGuard: true });
      }

      logger.info(`End User creation afterSave [${user.id}] by ${currentUser?.get('username')}`);

      return;
    }

    /*
     * -------------------------------- //
     * ------------ update ------------ //
     * -------------------------------- //
     */
    /*
     * An account that reaches the SMS confirmation step gets its code here, exactly as a phone
     * sign-up does on creation: the step and the code that makes it passable are one thing. This
     * is the email sign-up arriving from the profile step, whose number has just been typed —
     * nothing else moves `registerStep` to this value on an existing account.
     */
    if (dirtyKeys.includes('registerStep') && user.get('registerStep') === RegisterStepEnum.VERIFY_PHONE) {
      if (!(await autoConfirmSignUpIfAllowed(user, 'phoneVerified'))) {
        const updatedUser = await saveUserAndSendCodeToPhone(user, (locale as Locale) ?? 'fr', request.ip);

        logger.info(`Verification code sent to user ${updatedUser?.id}`);
      }
    }

    /*
     * the code sent to an owner's address was accepted: the proof the role was waiting for. Skipped
     * for an account already holding it — `updateRoleForUser` replaces the account's whole set of
     * roles, so granting again would strip any other role the owner was given since.
     */
    if (dirtyKeys.includes('emailVerified') && user.get('emailVerified') && isOwnerEmail(user.get('email'))) {
      if (!(await hasRole([HIGHEST_LEVEL_ROLES[0]!], user))) {
        // trusted server-side bootstrap (env-controlled allowlist) — not a user-driven request
        await updateRoleForUser([HIGHEST_LEVEL_ROLES[0]!], user, undefined, { bypassEscalationGuard: true });
      }
    }

    // roles of the invitation land once the address is proven, like the OWNERS_EMAILS role above
    if (dirtyKeys.includes('emailVerified') && user.get('emailVerified') && user.get('platform') === 'bo') {
      const pendingInvitation = await findPendingInvitationByEmail(user.get('email'));

      if (pendingInvitation) await grantInvitationRoles(user, pendingInvitation);
    }

    // deleted — currentUser is null when saved via master key inside a Cloud Function (self-deletion)
    if (dirtyKeys.includes('deleted') && user.get('deleted')) {
      const deleted = currentUser ?? user;
      const updatedUser = await deleteUser(user, deleted);

      logger.info(`User ${updatedUser?.id} deleted by ${deleted.get('username')}`);
    }

    logger.info(`End User update afterSave [${user.id}] by ${currentUser?.get('username')}`);
  })
);

/*
 * ----------------------------------------------------- //
 * ------------------- before delete ------------------- //
 * ----------------------------------------------------- //
 * The CLP of `_User` lets a signed-in account delete its own row (its ACL names it), so without this
 * a member could erase themselves straight from the SDK — past the step-up code and the "no ride
 * under way" check of `deleteAccount`, and with the cleanup of their rides and bookings running
 * behind them. Erasing an account goes through a Cloud Function (master key), or through a session
 * holding a highest role; the check has to come before the delete, since an afterDelete that
 * refuses comes too late to keep the row.
 */
Parse.Cloud.beforeDelete(
  Parse.User,
  parseFunction(async (request: Parse.Cloud.BeforeDeleteRequest<Parse.User>): Promise<void> => {
    if (request.master) return;

    if (!request.user || !(await isHighestRole(request.user))) {
      throw new Error(translate('error.unauthorizedToDoThisAction', DEFAULT_LANGUAGE));
    }
  })
);

/*
 * ----------------------------------------------------- //
 * -------------------- after delete ------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.afterDelete(
  Parse.User,
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const currentUser = request.user;

    logger.info(`User ${user.id} deleted from the database at ${dayjs().format()} by ${currentUser?.get('username')}`);

    if (!currentUser) return;

    await runJob('deleteOrDestroyUserRelationsJob', { userId: user.id, type: 'destroy' });

    if (user.has('image') && user.get('image').publicId) {
      // remove all files
      await deleteFile(user, 'image');
    }
  })
);
