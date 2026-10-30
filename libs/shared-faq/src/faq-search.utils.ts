import type { FaqItem, FaqTheme } from './faq.type';

/**
 * Lowercased, accents and typographic apostrophes removed: "Réservation", "reservation" and
 * "RESERVATION" must find the same answers, and so must "l’app" and "l'app" — a phone keyboard
 * types the straight apostrophe, the content uses the curly one.
 */
export const normalizeFaqText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’]/g, '\'');

const getSearchableText = (item: FaqItem): string => {
  const tableCells = item.table ? [...item.table.head, ...item.table.rows.flat()] : [];

  return normalizeFaqText([item.question, item.answer, ...tableCells].join(' '));
};

/**
 * The themes that answer a search: an item is kept when every word of the query is found in its
 * question, its answer or its table, and a theme with no item left is dropped. An empty query keeps
 * everything.
 */
export const searchFaqThemes = (themes: FaqTheme[], query: string): FaqTheme[] => {
  const words = normalizeFaqText(query).split(/\s+/).filter(Boolean);

  if (words.length === 0) return themes;

  return themes
    .map((theme) => ({
      ...theme,
      items: theme.items.filter((item) => {
        const text = getSearchableText(item);

        return words.every((word) => text.includes(word));
      }),
    }))
    .filter((theme) => theme.items.length > 0);
};

export const countFaqItems = (themes: FaqTheme[]): number =>
  themes.reduce((count, theme) => count + theme.items.length, 0);
