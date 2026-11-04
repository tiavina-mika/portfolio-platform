/**
 * classes that must always be governed by another class's rights instead of having their own
 * entry in the role rights UI — shared so the BO client (role rights UI/checks) and the server
 * (CLP rebuild) never drift apart on which classes alias which
 * @example PageSection is part of a Page and must follow the exact same rights as Page
 */
export const SHARED_CLASS_ALIASES: Record<string, string> = {
  PageSection: 'Page',
};
