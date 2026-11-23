import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientStatusEnum } from '@shared/domain-types';

import type { Locale } from '@/types/app.type';
import type { ClientInput } from '@/types/client.type';

import { translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  CLIENT_EDITABLE_FIELDS, CLIENT_LIST_FIELDS, CLIENT_ORDER_FIELDS,
} from '@/constants/_domain/client.constants';
import { escapeText, setValues } from '@/utils/_core/utils';
import { normalizeClientEmail } from '@/utils/_domain/client.utils';

type ClientsParams = {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: { status?: ClientStatusEnum };
  search?: { text?: string; kind?: string };
};

const buildClientQuery = () => new Parse.Query(DOMAIN_COLLECTIONS.client);

/*
 * a master-key save carries no session: the `beforeSave` trigger reads the author and the language
 * of its refusals from the context instead
 */
const buildSaveContext = (user: Parse.User, locale?: Locale) => ({ userId: user.id, locale });

/**
 * The clients of the back-office list, narrowed by the search box and the tab.
 * @returns the page of clients with the total count of the narrowed list
 */
export const getClientsService = async ({
  limit, skip, orderBy, order, filters, search,
}: ClientsParams): Promise<Record<string, any>> => {
  let query = buildClientQuery();

  // a part of the name or of the e-mail, whatever the case
  if (search?.text) {
    const text = escapeText(search.text);

    query = Parse.Query.or(
      buildClientQuery().matches('name', text),
      buildClientQuery().matches('email', text)
    );
  }

  if (search?.kind) query.equalTo('kind', search.kind);

  // the "active" and "archived" tabs of the list; the "all" tab sends no status
  if (filters?.status) query.equalTo('status', filters.status);

  const sortField = orderBy && CLIENT_ORDER_FIELDS.includes(orderBy) ? orderBy : 'updatedAt';

  if (order === 'asc') query.ascending(sortField);
  else query.descending(sortField);

  const result: Record<string, any> = await query
    .select(CLIENT_LIST_FIELDS)
    .limit(limit)
    .skip(skip)
    .withCount()
    .find(USE_MASTER_KEY);

  return result;
};

/**
 * One client, whatever its status.
 * @returns the client, or `false` when there is none: `false` rather than `undefined`, which the
 * Parse client would read as a successful empty answer
 */
export const getClientByIdService = async (id: string): Promise<Parse.Object | false> => {
  const client = await buildClientQuery()
    .select(CLIENT_LIST_FIELDS)
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY);

  return client ?? false;
};

/**
 * Another client already holding this e-mail address, to refuse a second one.
 * @param email the address in its stored form (trimmed, lowercase)
 * @param excludedId the client being saved, which may of course keep its own address
 */
export const findClientByEmailService = async (
  email: string, excludedId?: string
): Promise<Parse.Object | undefined> => {
  const query = buildClientQuery()
    .select(['name'])
    .equalTo('email', email);

  if (excludedId) query.notEqualTo('objectId', excludedId);

  return query.first(USE_MASTER_KEY);
};

/**
 * Creates a client, or writes the typed fields of an existing one. The e-mail form, the uniqueness
 * and the authors are the `beforeSave` trigger's job, so they hold for every way a client is saved.
 * @param values the validated fields; a `null` unsets the column
 * @param user the back-office user who saves it
 * @param locale the language of a refusal
 * @param client the client edited, left out to create one
 */
export const saveClientService = async (
  values: ClientInput, user: Parse.User, locale: Locale | undefined, client?: Parse.Object
): Promise<Parse.Object> => {
  const parseClient = client ?? new Parse.Object(DOMAIN_COLLECTIONS.client);

  setValues(parseClient, values, [...CLIENT_EDITABLE_FIELDS]);

  try {
    return await parseClient.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });
  } catch (error) {
    /*
     * two saves of one address at the same moment both pass the trigger's lookup: the unique index
     * refuses the second, and the refusal is turned into the readable one the trigger gives
     */
    if ((error as Parse.Error).code !== Parse.Error.DUPLICATE_VALUE) throw error;

    const holder = await findClientByEmailService(normalizeClientEmail(values.email), parseClient.id);

    throw new Error(translate('client.emailAlreadyUsed', locale, { name: holder?.get('name') ?? '' }));
  }
};

/**
 * Archives a client, or puts it back in the list. An anonymized client stays anonymized: putting it
 * back would bring an empty row back among the clients worked with.
 */
export const setClientArchivedService = async (
  client: Parse.Object, archived: boolean, user: Parse.User, locale: Locale | undefined
): Promise<Parse.Object> => {
  if (client.get('status') === ClientStatusEnum.ANONYMIZED) return client;

  client.set('status', archived ? ClientStatusEnum.ARCHIVED : ClientStatusEnum.ACTIVE);

  return client.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });
};
