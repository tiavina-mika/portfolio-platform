import {
  QUOTE_ACCEPTANCE_PROOF_EXTENSIONS, QUOTE_ACCEPTANCE_PROOF_FOLDER, QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB,
} from '@shared/domain-constants';
import Parse from 'parse';

import type { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';
import type { TargetEnum } from '@shared/types';

import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import { IFileCloud } from '@/types/_core/file.type';
import { Locale } from '@/types/_core/setting.type';
import { IQuote, IQuoteInput, IQuoteParent } from '@/types/_domain/quote.type';
import { uploadFilesAPI } from '@/utils/_core/file.utils';
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

// the quote revised or amended comes back as a nested Parse object: the list names it by number and version
const toQuoteParent = (parent: Parse.Object | undefined): IQuoteParent | undefined => (
  parent
    ? { id: parent.id ?? '', number: parent.get('number') ?? '', version: parent.get('version') ?? 1 }
    : undefined
);

// the client comes back as a nested Parse object: the list only needs its id, name and e-mail
const toQuote = (quote: Parse.Object): IQuote => {
  const client = quote.get('client');

  return {
    ...toJSONWithId<IQuote>(quote),
    client: { id: client?.id, name: client?.get('name') ?? '', email: client?.get('email') ?? '' },
    parentQuote: toQuoteParent(quote.get('parentQuote')),
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

/**
 * @param parentQuoteId the accepted quote the new one amends, left out for a first quote
 */
export const createQuote = async (
  values: IQuoteInput, context: RequestContext, parentQuoteId?: string
): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('createQuote', { ...values, parentQuote: parentQuoteId, ...context });

  return toQuote(quote);
};

/**
 * Revises a sent quote: the server writes a draft copy as its next version and expires the sent one.
 * @returns the new draft and the version it replaces, now expired
 */
export const reviseQuote = async (
  id: string, context: RequestContext
): Promise<{ quote: IQuote; revisedQuote: IQuote }> => {
  const result = await Parse.Cloud.run('reviseQuote', { id, ...context });

  return { quote: toQuote(result.quote), revisedQuote: toQuote(result.revisedQuote) };
};

export const updateQuote = async (
  id: string, values: IQuoteInput, context: RequestContext
): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('updateQuote', { id, ...values, ...context });

  return toQuote(quote);
};

/**
 * Uploads the proof of an acceptance with the other back-office files, under a generated name: the
 * name the file had on the user's computer often carries the client's name.
 * @returns the stored file, or `undefined` when the upload answered nothing
 */
export const uploadQuoteAcceptanceProof = async (
  file: File, locale: Locale
): Promise<IFileCloud | undefined> => {
  const [uploaded] = await uploadFilesAPI({
    files: [file],
    folder: QUOTE_ACCEPTANCE_PROOF_FOLDER,
    sessionToken: (await fetchCurrentUserSessionToken()) ?? null,
    locale,
    config: { use_filename: false },
    validation: {
      maxFileSize: QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB,
      acceptedFileTypes: [...QUOTE_ACCEPTANCE_PROOF_EXTENSIONS],
    },
  });

  return uploaded;
};

export const changeQuoteStatus = async (
  id: string,
  {
    status, acceptanceMethod, acceptanceProof,
  }: { status: QuoteStatusEnum; acceptanceMethod?: QuoteAcceptanceMethodEnum; acceptanceProof?: IFileCloud },
  context: RequestContext
): Promise<IQuote> => {
  const quote = await Parse.Cloud.run('changeQuoteStatus', {
    id,
    status,
    acceptanceMethod,
    // the server takes the two fields a proof is made of, and refuses any other
    acceptanceProof: acceptanceProof && { publicId: acceptanceProof.publicId, url: acceptanceProof.url },
    ...context,
  });

  return toQuote(quote);
};
