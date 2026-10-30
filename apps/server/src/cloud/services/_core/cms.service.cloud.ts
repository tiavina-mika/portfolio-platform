import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '@shared/constants';

import type { Locale } from '@/types/app.type';


import { getArticleTranslatedDefaultValues, getPageTranslatedDefaultValues } from '@/cloud/utils/_core/cms.utils.cloud';
import { DEFAULT_LANGUAGE, locales, translate } from '@/config/i18n';
import {
  collections, DEFAULT_QUERY_LIMIT, LOCALES, USE_MASTER_KEY,
} from '@/constants/_core/constants';

import { contentCountryQuery } from '../../utils/_core/parse.utils.cloud';
import { getAllowedCountryCodes } from '../../utils/_core/role.utils.cloud';

/**
 * Refuses a technical code another row of the same collection already carries. The apps read a
 * category or a page by its code (`equalTo('code', …).first()`) — the help center root, the CGU —
 * so two rows sharing one would make them read either of the two at random. Binned rows are
 * checked too: the unique index in `db-indexes.ts` covers them, and letting the save through here
 * would only trade this readable message for a raw duplicate-key error from Mongo.
 * @param item the category or page being saved
 * @param locale the language the error is written in
 */
export const assertTechnicalCodeIsAvailable = async (
  item: Parse.Object,
  locale: Locale
): Promise<void> => {
  const code = item.get('code');

  // no code at all is the common case, and an empty string is how the back-office clears one
  if (typeof code !== 'string' || !code) return;

  const query = new Parse.Query(item.className)
    .equalTo('code', code)
    .select(['translated']);

  if (item.id) query.notEqualTo('objectId', item.id);

  const existingItem = await query.first(USE_MASTER_KEY);

  if (!existingItem) return;

  // a category is labelled by its `name`, a page by its `title`
  const translated = existingItem.get('translated') ?? {};
  const label = (fields?: { name?: string; title?: string }) => fields?.name ?? fields?.title;
  const name = label(translated[locale]) ?? label(translated[DEFAULT_LANGUAGE]) ?? existingItem.id;

  throw new Error(translate('cms.codeAlreadyUsed', locale, { name }));
};

/**
 * appends an incrementing numeric suffix (-2, -3, ...) to `slug` until no other object of the
 * same collection and country uses it for the given locale, so translated.<locale>.slug stays unique
 * per class and country: a country's website only shows its own content, so two countries may both
 * write "tips"
 * @param params.className
 * @param params.locale
 * @param params.slug
 * @param params.country the country the content is written for
 * @param params.excludeId current object id, to ignore itself on update (undefined on creation)
 * @returns
 */
const getUniqueSlug = async ({
  className, locale, slug, country, excludeId,
}: {
  className: 'Page' | 'Article';
  locale: string;
  slug: string;
  country: string;
  excludeId?: string;
}): Promise<string> => {
  if (!slug) return slug;

  let candidate = slug;
  let suffix = 2;

  while (true) {
    const query = new Parse.Query(collections[className])
      .equalTo(`translated.${locale}.slug`, candidate)
      .select(['objectId']);

    contentCountryQuery(query, country);
    if (excludeId) query.notEqualTo('objectId', excludeId);

    const existing = await query.first(USE_MASTER_KEY);

    if (!existing) return candidate;

    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
};

/**
 * function called in beforeSave trigger
 * it's used for article and page objects
 * @param request
 * @returns
 */
export const beforeSave = async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
  const item = request.object;
  const prevItem = request.original;
  const user = request.user;

  const dirtyKeys = item.dirtyKeys();

  request.context.dirtyKeys = dirtyKeys;

  // without user //
  if (item.existed() && dirtyKeys.includes('shares')) {
    item.increment('totalMediaShare', 1);
  }

  if (!user) return;

  // --------- creation and update --------- //
  const country: string = item.get('country') ?? prevItem?.get('country') ?? DEFAULT_COUNTRY_CODE;

  // a content is written for a country the platform runs in, and for one the editor's roles cover
  if (item.dirtyKeys().includes('country') || !prevItem) {
    const allowedCountries = await getAllowedCountryCodes(user);

    if (!(country in COUNTRIES) || (allowedCountries && !allowedCountries.includes(country))) {
      throw new Error(translate('error.unauthorizedToDoThisAction', DEFAULT_LANGUAGE));
    }
  }

  item.set('country', country);

  const className = item.className as 'Page' | 'Article';
  const slugFunction = className === 'Page' ? getPageTranslatedDefaultValues : getArticleTranslatedDefaultValues;

  const translated = slugFunction(item.get('translated'));

  // make sure the slug is unique per locale within the same collection
  for (const locale of LOCALES) {
    if (translated[locale]?.slug) {
      translated[locale].slug = await getUniqueSlug({
        className, locale, slug: translated[locale].slug, country, excludeId: item.id,
      });
    }
  }

  item.set('translated', translated);
  // ----------- creation ----------- //
  if (!item.existed() || !prevItem) {
    item.set('deleted', false);
    item.set('user', user);
    return;
  }

  // updatedBy should be different from deletedBy
  if (dirtyKeys.includes('deleted') && item.get('deleted')) {
    item.set('deletedCategories', item.get('categories') || []);
    item.unset('categories');
    return;
  }

  // ----------- update ----------- //
  item.set('updatedBy', user);
};

/**
 * concatenates the rich-text `content` of every non-deleted `Page` (published `translated`
 * content plus the autosaved `draft`, since a draft can reference editor-uploaded images
 * before it is ever published) — used by `purgeOrphanedEditorFilesJob` to check whether a
 * Cloudinary file uploaded from the TipTap editor is still referenced anywhere before deleting it
 * @returns
 */
export const getPageEditorContentHaystack = async (): Promise<string> => {
  const contents: string[] = [];
  let skip = 0;

  while (true) {
    const batch = await new Parse.Query(collections.Page)
      .notEqualTo('deleted', true)
      .select(['translated'])
      .limit(DEFAULT_QUERY_LIMIT)
      .skip(skip)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    for (const page of batch) {
      const translated = page.get('translated') || {};

      for (const locale of locales) {
        if (translated[locale]?.content) contents.push(translated[locale].content);
      }
    }

    skip += DEFAULT_QUERY_LIMIT;
    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  return contents.join('\n');
};

/**
 * same as `getPageEditorContentHaystack` for `Article` (no `draft`/autosave field on this class)
 * @returns
 */
export const getArticleEditorContentHaystack = async (): Promise<string> => {
  const contents: string[] = [];
  let skip = 0;

  while (true) {
    const batch = await new Parse.Query(collections.Article)
      .notEqualTo('deleted', true)
      .select(['translated'])
      .limit(DEFAULT_QUERY_LIMIT)
      .skip(skip)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    for (const article of batch) {
      const translated = article.get('translated') || {};

      for (const locale of locales) {
        if (translated[locale]?.content) contents.push(translated[locale].content);
      }
    }

    skip += DEFAULT_QUERY_LIMIT;
    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  return contents.join('\n');
};
