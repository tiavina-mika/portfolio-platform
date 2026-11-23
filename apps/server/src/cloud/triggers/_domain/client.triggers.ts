import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientStatusEnum } from '@shared/domain-types';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { normalizeClientEmail } from '@/utils/_domain/client.utils';

import { findClientByEmailService } from '../../services/_domain/client.service.cloud';
import { hasClientMissionsService } from '../../services/_domain/mission.service.cloud';
import { hasClientQuotesService } from '../../services/_domain/quote.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

/*
 * A client is saved by its Cloud Functions with the master key, so the session is not on the request:
 * the functions hand the user and the language over through the save's context.
 */
Parse.Cloud.beforeSave(
  DOMAIN_COLLECTIONS.client,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const client = request.object;
    const locale = (request.context?.locale as Locale | undefined) ?? DEFAULT_LANGUAGE;
    const userId = (request.context?.userId as string | undefined) ?? request.user?.id;
    const author = userId ? convertIdToPointer<Parse.User>(collections.User, userId) : undefined;

    // ----------- creation ----------- //
    if (!client.existed()) {
      client.set('status', ClientStatusEnum.ACTIVE);
      if (author) client.set('createdBy', author);
    }

    if (author) client.set('updatedBy', author);

    // ------- one e-mail, one client ------- //
    if (!client.dirty('email') || !client.get('email')) return;

    const email = normalizeClientEmail(client.get('email'));

    client.set('email', email);

    /*
     * checked here so the refusal is readable; the unique index on `email` is what still holds when
     * two saves of the same address run at the same moment
     */
    const sameEmailClient = await findClientByEmailService(email, client.id);

    if (sameEmailClient) {
      throw new Error(translate('client.emailAlreadyUsed', locale, { name: sameEmailClient.get('name') }));
    }
  })
);

/*
 * A client named on a quote or a mission carries a history: it is archived, never deleted, whatever
 * deletes it (no function does, and `delete` is the owner's alone, but a raw master-key call would).
 */
Parse.Cloud.beforeDelete(
  DOMAIN_COLLECTIONS.client,
  parseFunction(async (request: Parse.Cloud.BeforeDeleteRequest): Promise<void> => {
    // no function deletes a client, so no call hands a language over: the default one is used
    const name = request.object.get('name') ?? '';

    if (await hasClientQuotesService(request.object)) {
      throw new Error(translate('client.hasQuotes', DEFAULT_LANGUAGE, { name }));
    }
    if (await hasClientMissionsService(request.object)) {
      throw new Error(translate('client.hasMissions', DEFAULT_LANGUAGE, { name }));
    }
  })
);
