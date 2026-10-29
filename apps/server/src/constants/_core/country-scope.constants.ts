import { collections } from './constants';

/**
 * The classes that carry a stored `country`, and so can be kept inside the countries a back-office
 * role covers. An account is left out on purpose: an agent must always be able to read their own, and
 * the user lists are scoped in their functions instead.
 */
export const COUNTRY_SCOPED_CLASSES: string[] = [
  collections.Ride,
  collections.Request,
  collections.Payment,
  collections.Contact,
  collections.Report,
  collections.Rating,
  collections.Vehicle,
  collections.Article,
  collections.Page,
];

// the editorial content: a row saved before its `country` existed is the default country's
export const CONTENT_CLASSES: string[] = [collections.Article, collections.Page];

/**
 * The classes whose rows are counted or changed in bulk by the back-office with the master key, kept
 * inside the agent's countries. The accounts are in: a count of them is a figure of the platform.
 */
export const COUNTRY_SCOPED_BULK_CLASSES: string[] = [
  ...COUNTRY_SCOPED_CLASSES.filter((className) => !CONTENT_CLASSES.includes(className)),
  collections.User,
];
