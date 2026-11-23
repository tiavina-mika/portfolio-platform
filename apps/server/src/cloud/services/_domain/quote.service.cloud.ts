import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { QuoteStatusEnum, type QuoteAcceptanceMethodEnum } from '@shared/domain-types';

import type { IUploadedFile, Locale } from '@/types/app.type';
import type { QuoteInput } from '@/types/quote.type';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  QUOTE_EDITABLE_FIELDS, QUOTE_LIST_FIELDS, QUOTE_ORDER_FIELDS,
} from '@/constants/_domain/quote.constants';
import { escapeText, setValues } from '@/utils/_core/utils';

import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';

type QuotesParams = {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: { status?: QuoteStatusEnum };
  search?: { text?: string };
};

const buildQuoteQuery = () => new Parse.Query(DOMAIN_COLLECTIONS.quote);

/*
 * a master-key save carries no session: the `beforeSave` trigger reads the author and the language
 * of its refusals from the context instead
 */
const buildSaveContext = (user: Parse.User, locale?: Locale) => ({ userId: user.id, locale });

/**
 * The quotes of the back-office list, narrowed by the search box and the tab, each with the name of
 * its client read through the pointer.
 * @returns the page of quotes with the total count of the narrowed list
 */
export const getQuotesService = async ({
  limit, skip, orderBy, order, filters, search,
}: QuotesParams): Promise<Record<string, any>> => {
  let query = buildQuoteQuery();

  // a part of the number or of the title, whatever the case
  if (search?.text) {
    const text = escapeText(search.text);

    query = Parse.Query.or(
      buildQuoteQuery().matches('number', text),
      buildQuoteQuery().matches('title', text)
    );
  }

  // one tab per status; the "all" tab sends none
  if (filters?.status) query.equalTo('status', filters.status);

  const sortField = orderBy && QUOTE_ORDER_FIELDS.includes(orderBy) ? orderBy : 'updatedAt';

  if (order === 'asc') query.ascending(sortField);
  else query.descending(sortField);

  const result: Record<string, any> = await query
    .include('client')
    .select(QUOTE_LIST_FIELDS)
    .limit(limit)
    .skip(skip)
    .withCount()
    .find(USE_MASTER_KEY);

  return result;
};

/**
 * One quote, whatever its status, with its client's name.
 * @returns the quote, or `false` when there is none: `false` rather than `undefined`, which the
 * Parse client would read as a successful empty answer
 */
export const getQuoteByIdService = async (id: string): Promise<Parse.Object | false> => {
  const quote = await buildQuoteQuery()
    .include('client')
    .select(QUOTE_LIST_FIELDS)
    .equalTo('objectId', id)
    .first(USE_MASTER_KEY);

  return quote ?? false;
};

/**
 * Whether a client is named on at least one quote, whatever its status: such a client carries a
 * history and is archived, never deleted.
 */
export const hasClientQuotesService = async (client: Parse.Object): Promise<boolean> => {
  const quote = await buildQuoteQuery()
    .select([])
    .equalTo('client', client)
    .first(USE_MASTER_KEY);

  return !!quote;
};

/**
 * Creates a draft quote, or writes the typed fields of an existing one. The number, the total, the
 * status and the authors are the `beforeSave` trigger's job, so they hold for every way a quote is
 * saved — including the refusal to edit a quote that left `draft`.
 * @param values the validated fields; a `null` unsets the column
 * @param user the back-office user who saves it
 * @param locale the language of a refusal
 * @param quote the quote edited, left out to create one
 */
export const saveQuoteService = async (
  values: QuoteInput, user: Parse.User, locale: Locale | undefined, quote?: Parse.Object
): Promise<Parse.Object> => {
  const parseQuote = quote ?? new Parse.Object(DOMAIN_COLLECTIONS.quote);
  const { client, ...fields } = values;

  setValues(parseQuote, fields, QUOTE_EDITABLE_FIELDS.filter((field) => field !== 'client'));
  // only a new client is written, so an unchanged one is not seen as a change by the trigger
  if (parseQuote.get('client')?.id !== client) {
    parseQuote.set('client', convertIdToPointer(DOMAIN_COLLECTIONS.client, client));
  }

  const saved = await parseQuote.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });

  // read again so the answer carries the client's name, as the list shows it
  return (await getQuoteByIdService(saved.id)) || saved;
};

type QuoteStatusChange = {
  status: QuoteStatusEnum;
  acceptanceMethod?: QuoteAcceptanceMethodEnum;
  acceptanceProof?: IUploadedFile;
};

/**
 * Moves a quote to another status. Whether the move is allowed, the dates it sets and whether the proof
 * is one of the platform's files are the trigger's checks.
 * @param change the new status, and how the client said yes (with the file that shows it, if any) when
 * the quote is accepted
 */
export const changeQuoteStatusService = async (
  quote: Parse.Object,
  { status, acceptanceMethod, acceptanceProof }: QuoteStatusChange,
  user: Parse.User,
  locale: Locale | undefined
): Promise<Parse.Object> => {
  quote.set('status', status);
  if (status === QuoteStatusEnum.ACCEPTED) quote.set('acceptanceMethod', acceptanceMethod);
  // only the two fields the proof is made of, whatever else the object carried
  if (acceptanceProof) {
    quote.set('acceptanceProof', { publicId: acceptanceProof.publicId, url: acceptanceProof.url });
  }

  const saved = await quote.save(null, { ...USE_MASTER_KEY, context: buildSaveContext(user, locale) });

  return (await getQuoteByIdService(saved.id)) || saved;
};
