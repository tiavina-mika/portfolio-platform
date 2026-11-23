import Parse from 'parse';

import type { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';
import type { TargetEnum } from '@shared/types';

import { Locale } from '@/types/_core/setting.type';
import { IQuote, IQuoteInput } from '@/types/_domain/quote.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

/*
 * Every quote call goes through a Cloud Function: the server checks the Aldaron workspace there, which
 * a direct query could not, and computes the number and the total. The workspace and the language
 * travel with each call.
 */
type RequestContext = { locale: Locale; workspace: TargetEnum };

// `toJSON` writes a stored date as a `{ __type, iso }` object: the dates are read off the object instead
const toISODate = (quote: Parse.Object, field: string): string | undefined => (
  (quote.get(field) as Date | undefined)?.toISOString()
);

// the client comes back as a nested Parse object: the list only needs its id, name and e-mail
const toQuote = (quote: Parse.Object): IQuote => {
  const client = quote.get('client');

  return {
    ...toJSONWithId<IQuote>(quote),
    client: { id: client?.id, name: client?.get('name') ?? '', email: client?.get('email') ?? '' },
    issuedAt: toISODate(quote, 'issuedAt'),
    validUntil: toISODate(quote, 'validUntil'),
    acceptedAt: toISODate(quote, 'acceptedAt'),
  };
};

export const fetchQuotes = async ({
  limit, skip, orderBy, order, filters, search, locale, workspace,
}: {
  limit: number;
  skip: number;
  orderBy?: string;
  order?: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
} & RequestContext): Promise<{ results: IQuote[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getQuotes', {
    limit, skip, orderBy, order, filters, search, locale, workspace,
  });

  return { results: result.results.map(toQuote), count: result.count };
};

export const createQuote = async (values: IQuoteInput, context: RequestContext): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('createQuote', { ...values, ...context });

  return toQuote(quote);
};

export const updateQuote = async (
  id: string, values: IQuoteInput, context: RequestContext
): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('updateQuote', { id, ...values, ...context });

  return toQuote(quote);
};

export const changeQuoteStatus = async (
  id: string,
  change: { status: QuoteStatusEnum; acceptanceMethod?: QuoteAcceptanceMethodEnum },
  context: RequestContext
): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('changeQuoteStatus', { id, ...change, ...context });

  return toQuote(quote);
};
