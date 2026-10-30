/**
 * Fewest reviews before an average is worth printing as a number.
 *
 * One review is not an average: it is one person's opinion rendered with the same authority as a
 * hundred, and it moves by a whole star every time a second one arrives. Below this count every
 * surface shows the volume (or "new member") instead of the figure — the member is not penalised,
 * the reader is simply told there is nothing to read yet.
 *
 * Generic on purpose: the same threshold guards the figure on a profile, on a search result and on
 * the trusted-driver badge, so raising it has to move all three at once.
 */
export const MIN_REVIEWS_FOR_AVERAGE = 3;
