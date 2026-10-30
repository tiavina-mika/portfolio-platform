import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  PROJECT_FOR_CLIENT_FIELDS, PROJECT_LIST_FIELDS, PROJECT_SEARCH_TRANSLATED_FIELDS,
} from '@/constants/_domain/project.constants';
import { escapeText, isBoolean } from '@/utils/_core/utils';

import { filtersDatesQuery, multiBooleanQuery } from '../../utils/_core/parse.utils.cloud';

type ProjectsParams = {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: { deleted?: boolean; types?: string[] };
  search?: Record<string, any>;
  locales: string[];
  include?: string[];
};

const buildProjectQuery = () => new Parse.Query(DOMAIN_COLLECTIONS.project);

/**
 * The projects of the back-office list, narrowed by the search box and the tab filters.
 * @returns the page of projects with the total count of the narrowed list
 */
export const getProjectsService = async ({
  limit, skip, orderBy, order, filters, search, locales, include = [],
}: ProjectsParams): Promise<Record<string, any>> => {
  let query = buildProjectQuery();

  if (search) {
    // search by the translated texts, ex: translated.fr.title = "Bonjour"
    if (search.text) {
      const text = escapeText(search.text);
      const or = locales.flatMap((locale) => ['title', 'description', 'content'].map(
        (field) => buildProjectQuery().matches(`translated.${locale}.${field}`, text)
      ));

      query = Parse.Query.or(...or);
    }

    // search by a translated field of its own
    PROJECT_SEARCH_TRANSLATED_FIELDS.forEach((field) => {
      if (!search[field]) return;

      const or = locales.map(
        (locale) => buildProjectQuery().matches(`translated.${locale}.${field}`, escapeText(search[field]))
      );

      query = Parse.Query.or(...or);
    });

    if (search.types && !filters?.types) query.containedIn('types', search.types);

    if (search.technologies) query.containedIn('technologies', search.technologies);

    // query dates
    filtersDatesQuery(query, search);

    // [true, false] query
    multiBooleanQuery(query, search.active, 'active');
  }

  query.limit(limit)
    .skip(skip)
    .equalTo('deleted', false)
    .exists('user')
    .select(PROJECT_LIST_FIELDS)
    .include(['user', ...include]);

  if (filters) {
    // overrides the deleted query above
    if (isBoolean(filters.deleted)) query.equalTo('deleted', filters.deleted!);

    // the filter wins over the search when both are defined
    if (filters.types) query.containedIn('types', filters.types);
  }

  if (order === 'desc') {
    query.descending(orderBy ?? 'createdAt');
  }
  else {
    query.ascending(orderBy ?? 'createdAt');
  }

  const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

  return result;
};

/**
 * One project for the back-office form.
 * @returns the project, or `false` when it does not exist or is in the bin: `false` rather than
 * `undefined`, which the client would serialize as a successful empty answer
 */
export const getProjectByIdService = async (
  id: string, include: string[] = []
): Promise<Parse.Object | false> => {
  const project = await buildProjectQuery()
    .equalTo('objectId', id)
    .notEqualTo('deleted', true)
    .include(include)
    .first(USE_MASTER_KEY);

  return project ?? false;
};

/**
 * A published project by its slug, for the public website. The slug is looked up in the visitor's
 * locale first, then in the default one for a project not translated yet.
 * @returns the project narrowed to the visitor's locale, or `false` when there is none
 */
export const getProjectForClientService = async (
  slug: string, locale: string, defaultLocale: string
): Promise<Parse.Object | false> => {
  const project = await Parse.Query.or(
    buildProjectQuery().equalTo(`translated.${locale}.slug`, slug),
    buildProjectQuery().equalTo(`translated.${defaultLocale}.slug`, slug)
  )
    .equalTo('deleted', false)
    .equalTo('active', true)
    .select([`translated.${locale}`, ...PROJECT_FOR_CLIENT_FIELDS])
    .first(USE_MASTER_KEY);

  return project ?? false;
};
