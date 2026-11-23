import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientStatusEnum } from '@shared/domain-types';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { normalizeClientEmail } from '@/utils/_domain/client.utils';

import { findClientByEmailService } from '../../services/_domain/client.service.cloud';
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
 * TODO(link:020-add-the-quote-collection-to-the-aldaron-workspace): refuse, in a `beforeDelete`, the
 * deletion of a client that still has quotes (and missions, with
 * 050-add-the-mission-collection-to-the-aldaron-workspace): the client is archived instead. No
 * function deletes a client today and `delete` is the owner's alone, so nothing can lose a history yet.
 */
