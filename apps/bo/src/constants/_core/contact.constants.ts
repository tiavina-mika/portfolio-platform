// the list opens on every message, the recycle bin being the only other scope
export const CONTACT_ALL_SCOPE = 'all';

// the bin is a scope of the same list rather than a page of its own, offered to who may destroy
export const CONTACT_DELETED_SCOPE = 'deleted';

// larger than a table page: a page is scrolled inside its column and replaces what is shown
export const CONTACT_PAGE_SIZE = 30;

// newest message first: the one just received is the one worth reading
export const CONTACT_SORT = { orderBy: 'createdAt', order: 'desc' } as const;

// the list is searched by typing, so the query waits for the last keystroke
export const CONTACT_SEARCH_DEBOUNCE = 500;

// the i18n key naming each language a visitor can write in
export const CONTACT_LOCALE_LABEL_KEYS: Record<string, string> = {
  fr: 'common:lang.french',
  en: 'common:lang.english',
  mg: 'common:lang.malagasy',
};
