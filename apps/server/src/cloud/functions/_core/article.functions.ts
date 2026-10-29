import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { scopeCountries } from '@/utils/_core/agent-context.utils';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import {
  articleForClientSchema, getArticlesSchema, getArticleSchema, incrementArticleViewCountSchema,
} from '@/validations/_core/article.validations';

import { searchUserPointerQuery } from '../../services/_core/user.service.cloud';
import { Article } from '../../triggers/_core/article.triggers';
import {
  contentCountriesQuery, contentCountryQuery, convertIdToPointer, convertIdsToPointer, filtersDatesQuery,
  multiBooleanQuery,
} from '../../utils/_core/parse.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getArticles',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include = [],
    } = request.params;
    let query = new Parse.Query(Article);

    if (search) {
      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.title = "Bonjour"
            new Parse.Query(Article).matches('translated.' + locale + '.title', text),
            new Parse.Query(Article).matches('translated.' + locale + '.description', text),
            new Parse.Query(Article).matches('translated.' + locale + '.content', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      // search by translated fields
      ['title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            or.push(
              new Parse.Query(Article).matches(`translated.${locale}.${field}`, escapeText(search[field]))
            );
          });

          query = Parse.Query.or(...or);
        }
      });

      // search by a category
      if (search.category) {
        query.equalTo('categories', convertIdToPointer('Category', search.category));
      }

      // the author is a pointer, so it is matched through a sub-query on the User class
      if (search.user) {
        searchUserPointerQuery(query, search.user);
      }

      // 0 is a bound an editor means — "not shared at all" — so it is checked, not treated as unset
      if (search.minShares !== undefined) {
        query.greaterThanOrEqualTo('totalMediaShare', +search.minShares);
      }

      if (search.maxShares !== undefined) {
        query.lessThanOrEqualTo('totalMediaShare', +search.maxShares);
      }

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    // the countries the agent's roles cover, whether or not a filter asks for any
    const countries = scopeCountries(search?.countries);

    if (countries) contentCountriesQuery(query, countries);

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .exists('user')
      .include(['user', 'updatedBy', ...include]);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      if (filters.categories) {
        query.containedIn('categories', convertIdsToPointer('Category', filters.categories));
      }

      if (filters.category) {
        query.equalTo('categories', convertIdToPointer('Category', filters.category));
      }

      /*
       * everything one author wrote, linked from an article's own page. Takes an object id, unlike
       * `search.user` above, which matches an author by name or email.
       */
      if (filters.user) {
        query.equalTo('user', convertIdToPointer(collections.User, filters.user));
      }
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    return result;
  }, ['find'], collections.Article),
  parseFunctionValidation(getArticlesSchema)
);

Parse.Cloud.define(
  'getArticle',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const article = await new Parse.Query(Article)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(['createdBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!article) return false;

    return article;
  }, ['get'], collections.Article),
  parseFunctionValidation(getArticleSchema)
);

Parse.Cloud.define(
  'getArticleForClient',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const {
      slug, locale, defaultLocale, country,
    } = request.params;
    let query = new Parse.Query(Article);

    query = Parse.Query.or(
      // query the current locale
      new Parse.Query(Article).equalTo('translated.' + locale + '.slug', slug),
      // query the default locale if not translated
      new Parse.Query(Article).equalTo('translated.' + defaultLocale + '.slug', slug)
    );

    contentCountryQuery(query, country);

    const article = await query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include(['categories', 'user'])
      .select([
        'translated.' + locale,
        'categories.translated.' + locale,
        'previewImage',
        'image',
        'images',
        'user',
        'updatedAt',
        'totalMediaShare',
      ])
      .first(USE_MASTER_KEY);

    if (!article) return false;

    return article;
  }),
  // -------- validation -------- //
  parseFunctionValidation(articleForClientSchema)
);

/**
 * Increment the view counter of a published article. Called by the public website on a visitor's
 * first view of that article in the browsing session, with no session and no master key on the
 * caller side: articles are world-readable but never world-writable, so the counter is bumped here
 * with the master key instead. Unpublished, deleted or unknown articles are ignored rather than
 * rejected — a stale link must not surface an error to a visitor.
 */
Parse.Cloud.define(
  'incrementArticleViewCount',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { id } = request.params;

    const article = await new Parse.Query(Article)
      .equalTo('objectId', id)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['views'])
      .first(USE_MASTER_KEY);

    if (!article) return 0;

    article.increment('views', 1);
    await article.save(null, USE_MASTER_KEY);

    return (article.get('views') as number) || 0;
  }),
  // -------- validation -------- //
  parseFunctionValidation(incrementArticleViewCountSchema)
);
