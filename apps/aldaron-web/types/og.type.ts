/**
 * How the text of a share card is laid out: centered under the brand for a site page (home, contact,
 * blog, a content page), left-aligned with the chip and the brand on one row for a single piece of
 * content (an article, a project)
 */
export enum OgCardLayoutEnum {
  CENTERED = 'centered',
  LEFT = 'left'
}

/**
 * What a share card (the 1200×630 image a link preview shows) says. Every text is already
 * translated in the page's language: the card never bakes a language in.
 */
export type OgCard = {
  layout: OgCardLayoutEnum;
  /** short label in the pill: the page name, the article category */
  chip?: string;
  title?: string;
  subtitle?: string;
};
