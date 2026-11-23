import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { TargetEnum } from '@shared/types';

import type { ClientInput } from '@/types/client.type';

import { translate } from '@/config/i18n';
import {
  archiveClientSchema, clientInputSchema, createClientSchema, getClientSchema, getClientsSchema,
  updateClientSchema,
} from '@/validations/_domain/client.validations';

import {
  getClientByIdService, getClientsService, saveClientService, setClientArchivedService,
} from '../../services/_domain/client.service.cloud';
import { resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * The clients exist in the Aldaron workspace only: every function first checks that the account's
 * roles open it, then `fromBO` checks the right on the collection. Both apply — holding Aldaron opens
 * the workspace, not every action in it.
 */
const assertAgencyWorkspace = (request: Parse.Cloud.FunctionRequest): Promise<TargetEnum> => (
  resolveWorkspace(request.user, TargetEnum.AGENCY, request.params.locale)
);

// the client named by the request, or the translated "not found" error
const getClientOrThrow = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const client = await getClientByIdService(request.params.id);

  if (!client) throw new Error(translate('client.notFound', request.params.locale));

  return client;
};

// the typed fields, as the validation leaves them (trimmed, empty boxes turned into `null`)
const toClientInput = (params: Record<string, unknown>): ClientInput => (
  clientInputSchema.parse(params) as ClientInput
);

Parse.Cloud.define(
  'getClients',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest) => {
      await assertAgencyWorkspace(request);

      return getClientsService(request.params as Parameters<typeof getClientsService>[0]);
    },
    ['find'],
    DOMAIN_COLLECTIONS.client
  ),
  parseFunctionValidation(getClientsSchema)
);

Parse.Cloud.define(
  'getClient',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
      await assertAgencyWorkspace(request);

      return getClientByIdService(request.params.id);
    },
    ['get'],
    DOMAIN_COLLECTIONS.client
  ),
  parseFunctionValidation(getClientSchema)
);

Parse.Cloud.define(
  'createClient',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      return saveClientService(toClientInput(request.params), request.user!, request.params.locale);
    },
    ['create'],
    DOMAIN_COLLECTIONS.client
  ),
  parseFunctionValidation(createClientSchema)
);

Parse.Cloud.define(
  'updateClient',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const client = await getClientOrThrow(request);

      return saveClientService(toClientInput(request.params), request.user!, request.params.locale, client);
    },
    ['update'],
    DOMAIN_COLLECTIONS.client
  ),
  parseFunctionValidation(updateClientSchema)
);

// archiving is an edit of the client, not a deletion: nothing is lost and it can be undone
Parse.Cloud.define(
  'archiveClient',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const client = await getClientOrThrow(request);

      return setClientArchivedService(client, request.params.archived, request.user!, request.params.locale);
    },
    ['update'],
    DOMAIN_COLLECTIONS.client
  ),
  parseFunctionValidation(archiveClientSchema)
);
