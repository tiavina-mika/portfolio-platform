/**
 * The websites a piece of content (article, page, category) is written for. A content filed under
 * `box` alone belongs to the Aldaron website only.
 */
export enum WebsiteEnum {
  PORTFOLIO = 'portfolio',
  BOX = 'box'
}

// what a box (an Aldaron offer) can include
export enum BoxIncludeEnum {
  STATIC_WEBSITE = 'staticWebsite',
  MOBILE = 'mobile',
  BACK_OFFICE = 'backOffice',
  WEB_APP = 'webApp'
}
