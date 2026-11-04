import type { FAQ_LOCALES } from './faq.constants';

export type FaqLocale = typeof FAQ_LOCALES[number];

/** A small table drawn under an answer (commission tiers, refund scale, documents…). */
export type FaqTable = {
  head: string[];
  /** one array per row, with as many cells as `head` */
  rows: string[][];
};

export type FaqItem = {
  /** stable across languages and releases: it is the anchor a link can point to (`/faq#ban`) */
  id: string;
  question: string;
  answer: string;
  table?: FaqTable;
};

export type FaqTheme = {
  /** stable across languages and releases: the anchor of the theme's section (`/faq#commission`) */
  id: string;
  title: string;
  items: FaqItem[];
};

/** The whole FAQ in one language, as written in `content/<locale>.json`. */
export type FaqContent = {
  themes: FaqTheme[];
};
