import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import {
  getProjectsSchema, getProjectSchema, projectForClientSchema,
} from '@/validations/_domain/project.validations';

import {
  getProjectByIdService, getProjectForClientService, getProjectsService,
} from '../../services/_domain/project.service.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getProjects',
  fromBO(
    (request: Parse.Cloud.FunctionRequest) => (
      getProjectsService(request.params as Parameters<typeof getProjectsService>[0])
    ),
    ['find'],
    DOMAIN_COLLECTIONS.project
  ),
  parseFunctionValidation(getProjectsSchema)
);

Parse.Cloud.define(
  'getProject',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
      const { id, include } = request.params;

      return getProjectByIdService(id, include);
    },
    ['get'],
    DOMAIN_COLLECTIONS.project
  ),
  parseFunctionValidation(getProjectSchema)
);

Parse.Cloud.define(
  'getProjectForClient',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { slug, locale, defaultLocale } = request.params;

    return getProjectForClientService(slug, locale, defaultLocale);
  }),
  parseFunctionValidation(projectForClientSchema)
);
