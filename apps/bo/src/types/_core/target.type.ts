import type { OfferIncludeEnum, TargetEnum } from '@shared/types';

/**
 * Where an article, a page and a category are published. `targets` is absent on a content saved
 * before the field existed, which reads as the portfolio alone. The three `offer*` fields are only
 * kept while `aldaron` is one of the targets.
 */
export interface ITargetAttributes {
  targets?: TargetEnum[];
  offerIncludes?: OfferIncludeEnum[];
  // in euros
  offerPrice?: number;
  offerDurationDays?: number;
}
