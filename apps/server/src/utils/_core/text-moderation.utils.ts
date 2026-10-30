import { findUserTextViolation } from '@shared/utils';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';

/**
 * Refuses a text a member wrote for other members to read when an automatic check finds something
 * in it that must not be published: an insult, a phone number, an e-mail address or a link.
 *
 * Thrown from the write path rather than filtered on display — a review is averaged into a score
 * and e-mailed to the person it is about the moment it is saved, so there is no later point at
 * which hiding it would still help. The writer is told which one thing to take out, in their own
 * language, so the refusal is actionable instead of mysterious.
 * @param text the text as the member typed it
 * @param locale language of the error thrown
 */
export const assertUserTextIsPublishable = (
  text: string | undefined | null,
  locale: Locale = DEFAULT_LANGUAGE
): void => {
  const violation = findUserTextViolation(text);

  if (!violation) return;

  throw new Error(translate(`error.userText.${violation}`, locale));
};
