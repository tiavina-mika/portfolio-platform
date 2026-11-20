import type { BoxIncludeEnum, WebsiteEnum } from '@shared/types';

/**
 * What an article, a page and a category say about the website they are written for. `websites`
 * is absent on a content saved before the field existed, which reads as the portfolio alone. The
 * three `box*` fields are only kept while `box` is one of the websites.
 */
export interface IWebsiteAttributes {
  websites?: WebsiteEnum[];
  boxIncludes?: BoxIncludeEnum[];
  // in euros
  boxPrice?: number;
  boxDurationDays?: number;
}
