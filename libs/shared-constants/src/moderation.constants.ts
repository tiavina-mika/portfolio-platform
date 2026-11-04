/**
 * What an automatic check found in a member-written text, and why it is refused.
 *
 * A plain object rather than an enum so this stays a dependency-free constants file; the matching
 * union type is derived from it in `text-moderation.utils.ts`.
 */
export const USER_TEXT_VIOLATIONS = {
  /** A phone number: the usual way a ride is taken off the platform, commission included. */
  PHONE: 'phone',
  /** An email address — same purpose as a phone number, and a personal detail besides. */
  EMAIL: 'email',
  /** A link: an off-platform booking page, a payment link, or plain spam. */
  URL: 'url',
  /** An insult. Judged on whole words only — a substring match flags ordinary sentences. */
  PROFANITY: 'profanity',
} as const;

/**
 * Digits in a row that read as a phone number rather than as a figure someone is quoting.
 *
 * Malagasy mobile numbers are 10 digits (`034 12 345 67`), 9 without the leading zero, 12 in
 * international form — but the separators people type are arbitrary, so the check counts digits
 * once the separators are removed. Seven is below every real number and above the figures a review
 * legitimately contains: a price (`25000`), a year, a seat count, a time.
 */
export const USER_TEXT_MIN_PHONE_DIGITS = 7;

/**
 * Insults refused in a review, its public answer, and anywhere else a member writes for others to
 * read. French, Malagasy and English, since all three are typed here.
 *
 * Deliberately short, and it is meant to stay short: a long list is a list that refuses legitimate
 * sentences, and the automatic filter is not the moderation system — reporting a review is. What
 * this stops is the text nobody would defend, posted on a profile its owner cannot take down.
 *
 * Matched on whole words, accents folded and letters un-stretched, so `c o n n a r d`, `connnard`
 * and `CONNARD` are the same word while `concert` is not one.
 */
export const USER_TEXT_PROFANITY_WORDS = [
  // fr
  'connard', 'connasse', 'salope', 'enfoire', 'encule', 'batard', 'pute', 'putain', 'merde',
  'nique', 'niquer', 'ta gueule',
  // mg
  'adala', 'bado', 'voay',
  // en
  'asshole', 'bastard', 'bitch', 'fuck', 'fucking', 'shit', 'motherfucker', 'whore', 'cunt',
] as const;
