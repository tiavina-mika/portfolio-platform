import type { UserModerationAction } from '@/types/user.type';

import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';

type CreateUserModerationLogParams = {
  targetUser: Parse.User;
  action: UserModerationAction;
  // left unset for a decision nobody took by hand: an automatic policy or an expiry
  performedBy?: Parse.User;
  reason?: string;
  details?: string;
  until?: Date | null;
  banType?: string;
};

export const USER_MODERATION_LOG_FIELDS = [
  'targetUser', 'action', 'performedBy', 'reason', 'details', 'until', 'banType', 'createdAt',
];

/**
 * Records one moderation decision on an account (ban, lift, expiry, policy suspension, early end
 * of a suspension). The account itself only keeps its current state — `banned`, the last
 * `isSuspendedUntil` — so without this row a suspension that was lifted leaves no trace of who
 * decided it, and a dispute cannot be answered.
 *
 * A failure is logged, never thrown: the decision is already applied to the account by the time
 * it is recorded, and failing the caller would report as failed an action that took effect.
 */
export const createUserModerationLog = async ({
  targetUser, action, performedBy, reason, details, until, banType,
}: CreateUserModerationLogParams): Promise<void> => {
  try {
    const moderationLog = new Parse.Object(collections.UserModerationLog);

    moderationLog.set('targetUser', targetUser);
    moderationLog.set('action', action);
    if (performedBy) moderationLog.set('performedBy', performedBy);
    if (reason) moderationLog.set('reason', reason);
    if (details) moderationLog.set('details', details);
    if (until) moderationLog.set('until', until);
    if (banType) moderationLog.set('banType', banType);

    await moderationLog.save(null, USE_MASTER_KEY);
  }
  catch (error) {
    logger.error('Failed to write the user moderation log', {
      userId: targetUser.id,
      action,
      error: (error as Error)?.message,
    });
  }
};
