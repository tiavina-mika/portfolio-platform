/**
 * Where a review stands between being written and being shown. Reviews are published blind: a
 * review is PENDING — its author sees it, nobody else does, and it counts towards no score — until
 * the ride's payout has left and the person reviewed has written theirs about the author, or the
 * review window has ended, whichever comes first. This way nobody writes with the other's review
 * in front of them. It is PUBLISHED then, or DISCARDED if the ride is refunded instead — a trip
 * that turned out not to happen cannot keep reviews about it.
 *
 * Reviews written before this field existed have none, and read as published.
 */
export enum RatingPublicationStatusEnum {
  PENDING = 'pending',
  PUBLISHED = 'published',
  DISCARDED = 'discarded'
}
