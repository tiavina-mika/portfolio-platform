/**
 * Where a piece of content (article, page, category) is published. A content filed under `agency`
 * alone belongs to the Aldaron website only.
 */
export enum TargetEnum {
  PORTFOLIO = 'portfolio',
  AGENCY = 'agency'
}

// what an Aldaron offer can include
export enum OfferIncludeEnum {
  STATIC_WEBSITE = 'staticWebsite',
  MOBILE = 'mobile',
  BACK_OFFICE = 'backOffice',
  WEB_APP = 'webApp'
}
