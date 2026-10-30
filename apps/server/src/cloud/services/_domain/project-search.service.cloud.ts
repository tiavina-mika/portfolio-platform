import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY, USE_MASTER_KEY } from '@/constants/_core/constants';
import { PROJECT_SUMMARY_FIELDS } from '@/constants/_domain/project.constants';
import { escapeText } from '@/utils/_core/utils';

import { type GlobalSearchQuery, registerGlobalSearchEntity } from '../_core/globalSearch.service.cloud';

const searchProjects: GlobalSearchQuery = (rawText, locales) => {
  const text = escapeText(rawText);
  const or = locales.map(
    (locale) => new Parse.Query(DOMAIN_COLLECTIONS.project).matches(`translated.${locale}.title`, text)
  );

  return Parse.Query.or(...or)
    .equalTo('deleted', false)
    .select(PROJECT_SUMMARY_FIELDS)
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

registerGlobalSearchEntity('project', { className: DOMAIN_COLLECTIONS.project, search: searchProjects });
