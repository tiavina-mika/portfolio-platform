/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 */
import type { IMfa } from '@/types/auth.type';
import type { IBan } from '@/types/user.type';

import { DISABLE_USER_ACCOUNT_CONFIRMATION, USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';
import { hasNoVerifiedContact } from '@/utils/_core/user.utils';

import {
  deleteUserSessionByTokenService, markUserOfflineAfterLogoutService,
} from '../../services/_core/userSession.service.cloud';
import { createMfaChallengeToken } from '../../utils/_core/mfa.utils.cloud';
import { onStaffSessionOpened } from '../../utils/_core/session.utils.cloud';
import { isUserCurrentlyBanned, markUserSignedIn } from '../../utils/_core/user.utils.cloud';
import { createAccountNotVerifiedError, parseFunction } from '../../utils/_core/utils.cloud';

/*
 * ------------------------------------------ //
 * -------------- before login -------------- //
 * ------------------------------------------ //
 */
Parse.Cloud.beforeLogin(
  parseFunction(async (request: Parse.Cloud.TriggerRequest<Parse.User>): Promise<void> => {
    const user = request.object;

    if (isUserCurrentlyBanned(user)) {
      logger.error(`Blocked login attempt for banned user ${user.id}`);
      const bans: IBan[] = user.get('bans') || [];
      const latestBan = bans[bans.length - 1];

      /*
       * `@types/parse`'s legacy `class Error` (see src/types/global-parse.d.ts) doesn't declare
       * `extends Error`, even though `Parse.Error` does extend the native `Error` at runtime.
       */
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new Parse.Error(
        Parse.Error.OPERATION_FORBIDDEN,
        JSON.stringify({
          code: 'ACCOUNT_BANNED',
          type: latestBan?.type,
          reason: latestBan?.reason,
          reasonDetails: latestBan?.reasonDetails,
          until: latestBan?.until,
        })
      );
    }

    /*
     * for development purposes, we disable the account confirmation step for BO users,
     * so that they can log in directly after account creation without having to verify their email
     */
    if (!DISABLE_USER_ACCOUNT_CONFIRMATION && user.get('platform') === 'bo') {
      if (!user.get('emailVerified')) {
        // resend automatically the account verification code — a refusal here must not unblock the login
        try {
          await Parse.Cloud.run('sendVerificationCode', { email: user.get('email') });
        }
        catch (error) {
          logger.error(`Could not resend the verification code to BO user ${user.id}`, {
            error: (error as Error).message,
          });
        }

        /*
         * the login stops here: returning instead let an unconfirmed account in, and skipped the
         * MFA check below. SCRIPT_FAILED (141) is the code the back-office login waits for to
         * send the person to the code-entry screen.
         */
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new Parse.Error(
          Parse.Error.SCRIPT_FAILED,
          JSON.stringify({ code: 'ACCOUNT_NOT_VERIFIED' })
        );
      }
    }

    /*
     * Parse hands out a session on `signUp` and on a raw `/login` with the `username` (the number
     * of a phone account) before any code was entered; only `loginWithPhone` / `loginWithEmail`
     * checked the confirmation. An account that confirmed nothing yet cannot sign in, whichever
     * way the request arrives.
     */
    if (
      user.get('platform') !== 'bo' &&
      hasNoVerifiedContact({
        emailVerified: user.get('emailVerified'),
        phoneVerified: user.get('phoneVerified'),
      })
    ) {
      logger.warn(`Blocked login attempt for unverified account ${user.id}`);
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw createAccountNotVerifiedError();
    }

    const mfa: IMfa | undefined = user.get('mfa');

    if (mfa?.enabled) {
      const mfaChallengeToken = createMfaChallengeToken(user.id);

      /*
       * throwing here blocks the login outright — no session is created — exactly like the ban
       * case above. The BO exchanges mfaChallengeToken for a real session via verifyMfaLogin once
       * the TOTP/backup code is confirmed (see mfa.service.cloud.ts).
       */
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new Parse.Error(
        Parse.Error.OPERATION_FORBIDDEN,
        JSON.stringify({ code: 'MFA_REQUIRED', mfaChallengeToken })
      );
    }

    markUserSignedIn(user);
    await user.save(null, USE_MASTER_KEY);
  })
);

/*
 * ------------------------------------------ //
 * -------------- after logout -------------- //
 * ------------------------------------------ //
 */
Parse.Cloud.afterLogout(
  parseFunction(async (request: Parse.Cloud.TriggerRequest): Promise<void> => {
    const { object: session } = request;
    const user = session.get('user');

    await deleteUserSessionByTokenService(session.get('sessionToken'));

    /*
     * the session only holds a pointer to its user, with none of its columns: the old test on
     * `email`/`phone` was therefore always false, and nobody was ever marked offline on logout —
     * a member stayed displayed "online" long after signing out
     */
    if (!user) return;

    await markUserOfflineAfterLogoutService(user);
  })
);

/*
 * ------------------------------------------ //
 * --------------- after login -------------- //
 * ------------------------------------------ //
 * Parse only lets a trigger run on a session at logout, so the lifetime of a staff session is
 * bounded here, right after `/login` created it (the other ways of opening one go through
 * `issueParseSession`, which does the same).
 */
Parse.Cloud.afterLogin(
  parseFunction(async (request: Parse.Cloud.TriggerRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const sessionToken = user.getSessionToken();

    if (sessionToken) await onStaffSessionOpened(user, sessionToken);
  })
);
