import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { isInWorkspaces } from '@/utils/_core/rights.utils';
import {
  getProjectsSchema, getProjectSchema, projectForClientSchema,
} from '@/validations/_domain/project.validations';

import {
  getProjectByIdService, getProjectForClientService, getProjectsService,
} from '../../services/_domain/project.service.cloud';
import { getUserWorkspaces, resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getProjects',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest) => {
      const params = request.params as Parameters<typeof getProjectsService>[0];

      // an Aldaron project is listed only to an account whose roles open Aldaron
      const workspace = await resolveWorkspace(request.user, params.workspace, request.params.locale);

      return getProjectsService({ ...params, workspace });
    },
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
      const project = await getProjectByIdService(id, include);

      // an Aldaron project does not exist for an account whose roles do not open Aldaron
      if (project && !isInWorkspaces([project.get('target')], await getUserWorkspaces(request.user))) {
        return false;
      }

      return project;
    },
    ['get'],
    DOMAIN_COLLECTIONS.project
  ),
  parseFunctionValidation(getProjectSchema)
);

Parse.Cloud.define(
  'getProjectForClient',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const {
      slug, locale, defaultLocale, target,
    } = request.params;

    return getProjectForClientService(slug, locale, defaultLocale, target);
  }),
  parseFunctionValidation(projectForClientSchema)
);
