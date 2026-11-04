/**
 * Short public name of a member: first name and last-name initial (`Jean R.`).
 *
 * Used wherever a name leaves the app (shared messages, public pages): a full name is enough to
 * find someone on social networks and arrange a trip off the platform, the initial is not. The
 * first name is optional on this platform (only the last name is required), so without one the
 * first word of the last name is kept with the initial of the next word, and a single-word last
 * name is kept as is.
 * @param firstName the member's first name, possibly empty
 * @param lastName the member's last name, possibly made of several words
 * @returns the short name, or an empty string when there is no name at all
 */
export const toShortDisplayName = (firstName?: string | null, lastName?: string | null): string => {
  const first = (firstName ?? '').trim().replace(/\s+/g, ' ');
  const lastWords = (lastName ?? '').trim().split(/\s+/).filter(Boolean);

  if (first) {
    const initial = lastWords[0]?.charAt(0).toUpperCase();

    return initial ? `${first} ${initial}.` : first;
  }

  const [head, next] = lastWords;

  if (!head) return '';
  if (!next) return head;

  return `${head} ${next.charAt(0).toUpperCase()}.`;
};
