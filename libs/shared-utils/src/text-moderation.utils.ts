import {
  USER_TEXT_MIN_PHONE_DIGITS, USER_TEXT_PROFANITY_WORDS, USER_TEXT_VIOLATIONS,
} from '@shared/constants';

/** What an automatic check found in a member-written text — the keys of `USER_TEXT_VIOLATIONS`. */
export type UserTextViolation = (typeof USER_TEXT_VIOLATIONS)[keyof typeof USER_TEXT_VIOLATIONS];

/**
 * Digit runs long enough to be a phone number, whatever the writer used to separate them: spaces,
 * dots, dashes, slashes and the `+` of an international prefix all count as part of one number.
 * `261.34 12 345 67` and `0341234567` are therefore the same find.
 */
const PHONE_LIKE_PATTERN = /(?:\+?\d[\s.\-/()]*){7,}/g;

/** Anything shaped like an address. Deliberately loose: `nom (at) domaine.mg` is one too. */
const EMAIL_LIKE_PATTERN =
  /[\p{L}\d._%+-]+\s*(?:@|\(\s*at\s*\)|\[\s*at\s*\]|\bat\b)\s*[\p{L}\d.-]+\s*\.\s*\p{L}{2,}/iu;

/**
 * A link, with or without its scheme, plus the bare social handles used instead of one.
 *
 * No `g` flag, here or on the e-mail pattern above: a global regex kept at module level carries its
 * `lastIndex` from one `.test()` to the next, so the second call on the same text would start
 * reading halfway through it and answer `false`.
 */
const URL_LIKE_PATTERN =
  /(?:https?:\/\/|www\.)\S+|\b[\p{L}\d-]+\.(?:com|net|org|mg|fr|io|me|app|link)\b|(?:wa\.me|t\.me)\//iu;

/**
 * Text with its accents folded, its stretched letters collapsed and its lookalike digits turned
 * back into letters, so one spelling of a word is every spelling of it. `Çonnnard`, `c0nnard` and
 * `CONNARD` all reduce to `connard`.
 * @param text the text as written
 * @returns the folded form, lower-cased
 */
const foldText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    /*
     * a run of three or more identical letters collapses to **two**, not to one: French and English
     * are full of legitimate doubles, and `connnard` → `conard` would have slipped past the list
     * while `connard` was in it
     */
    .replace(/(.)\1{2,}/g, '$1$1');

/** Whether a folded text contains one of the refused words as a whole word. */
const hasProfanity = (foldedText: string): boolean => {
  // non-letters become single spaces so a word stays a word however it was punctuated
  const normalized = ` ${foldedText.replace(/[^\p{L}\d]+/gu, ' ').trim()} `;

  return USER_TEXT_PROFANITY_WORDS.some((word) => normalized.includes(` ${word} `));
};

/**
 * The first thing wrong with a text a member wrote for other members to read — a review, its
 * public answer — or `undefined` when there is nothing wrong with it.
 *
 * Three of the four checks are about **contact details**, and that is the point: a phone number or
 * an address in a review takes the next ride off the platform, which costs the commission that
 * pays for the guarantees (the refund, the payout held until arrival, the dispute) the ride was
 * sold with. It also publishes, on a profile its owner cannot edit, a personal detail the platform
 * otherwise releases only once a booking ties two accounts together.
 *
 * It is a filter, not a moderation system: it refuses what nobody would defend and leaves judgment
 * to the report flow. The first find wins — the writer is told one thing to fix, not a list — so
 * the order is the order in which a refusal is most useful to them, not the cheapest to compute.
 * @param text the text as the member typed it
 * @returns which check it failed, or `undefined` when it passes
 */
export const findUserTextViolation = (text?: string | null): UserTextViolation | undefined => {
  if (!text?.trim()) return undefined;

  const folded = foldText(text);

  if (hasProfanity(folded)) return USER_TEXT_VIOLATIONS.PROFANITY;
  /*
   * e-mail before link: `rakoto (at) domaine.mg` matches both, and telling the writer to remove an
   * address is more use to them than telling them to remove a link they did not think they wrote
   */
  if (EMAIL_LIKE_PATTERN.test(text)) return USER_TEXT_VIOLATIONS.EMAIL;
  if (URL_LIKE_PATTERN.test(text)) return USER_TEXT_VIOLATIONS.URL;

  /*
   * counted on the digits that survive the separators, not on the match's own length: `034 12 345
   * 67` is 10 digits and 13 characters, and a length test on the raw match would also catch a
   * sentence that merely quotes two prices in a row
   */
  const phoneMatches = text.match(PHONE_LIKE_PATTERN) ?? [];
  const hasPhone = phoneMatches
    .some((match) => (match.match(/\d/g) ?? []).length >= USER_TEXT_MIN_PHONE_DIGITS);

  if (hasPhone) return USER_TEXT_VIOLATIONS.PHONE;

  return undefined;
};
