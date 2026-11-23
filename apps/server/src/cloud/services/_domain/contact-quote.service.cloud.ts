import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientKindEnum, ClientStatusEnum } from '@shared/domain-types';
import { TargetEnum } from '@shared/types';

import type { Locale } from '@/types/app.type';
import type { ClientInput } from '@/types/client.type';

import { translate } from '@/config/i18n';
import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { CLIENT_LIST_FIELDS } from '@/constants/_domain/client.constants';
import { normalizeClientEmail } from '@/utils/_domain/client.utils';
import { clientInputSchema } from '@/validations/_domain/client.validations';

import { saveClientService } from './client.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { hasRight } from '../../utils/_core/role.utils.cloud';

/*
 * A quote request of the Aldaron site is a `Contact` (a generic message): it is turned into a client
 * and a quote here, on the domain side, so the generic contacts never know about quotes.
 */

// what the conversion reads of a contact, and the number of the quote it already became, if any
const CONVERTIBLE_CONTACT_FIELDS = ['name', 'email', 'phone', 'message', 'target', 'deleted', 'quote.number'];

/**
 * The quote request a quote is about to be written from: an Aldaron message, not in the bin, with an
 * e-mail to find or create its client by, and not yet turned into a quote.
 * @throws the translated reason the message cannot become a quote
 */
export const getConvertibleContactService = async (id: string, locale?: Locale): Promise<Parse.Object> => {
  const contact = await new Parse.Query(collections.Contact)
    .include('quote')
    .select(CONVERTIBLE_CONTACT_FIELDS)
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY);

  if (!contact || contact.get('deleted')) throw new Error(translate('quote.contactNotFound', locale));
  if (contact.get('target') !== TargetEnum.AGENCY) throw new Error(translate('quote.contactNotAgency', locale));
  if (contact.get('quote')) {
    throw new Error(translate('quote.contactAlreadyConverted', locale, {
      number: contact.get('quote').get('number') ?? '',
    }));
  }
  if (!contact.get('email')) throw new Error(translate('quote.contactHasNoEmail', locale));

  return contact;
};

/**
 * The client a quote request is written for: the client already holding its e-mail address (whatever
 * the case it was typed in), or a new one made from the message (an individual, with the name, e-mail
 * and phone the visitor gave). Creating one needs the right to create clients.
 * @throws when the client found is archived or anonymized, or when one must be created without the right
 */
export const findOrCreateClientFromContactService = async (
  contact: Parse.Object, user: Parse.User, locale?: Locale
): Promise<Parse.Object> => {
  const email = normalizeClientEmail(contact.get('email'));
  const existing = await new Parse.Query(DOMAIN_COLLECTIONS.client)
    .select(CLIENT_LIST_FIELDS)
    .equalTo('email', email)
    .first(USE_MASTER_KEY);

  if (existing) {
    if (existing.get('status') !== ClientStatusEnum.ACTIVE) {
      throw new Error(translate('quote.clientNotActive', locale));
    }

    return existing;
  }

  if (!(await hasRight(user, DOMAIN_COLLECTIONS.client, ['create']))) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }

  // the same reading of the fields as a client typed in the back-office (trimmed, empty boxes unset)
  const values = clientInputSchema.parse({
    name: contact.get('name')?.trim() || email,
    kind: ClientKindEnum.INDIVIDUAL,
    email,
    phone: contact.get('phone'),
  }) as ClientInput;

  return saveClientService(values, user, locale);
};

/**
 * Marks a quote request as turned into a quote, so it shows its quote and is never converted twice.
 * @param contact the contact as read by `getConvertibleContactService`
 */
export const linkContactToQuoteService = async (
  contact: Parse.Object, quote: Parse.Object
): Promise<void> => {
  contact.set('quote', convertIdToPointer(DOMAIN_COLLECTIONS.quote, quote.id));

  await contact.save(null, USE_MASTER_KEY);
};
