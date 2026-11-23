import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { QuoteStatusEnum } from '@shared/domain-types';
import { TargetEnum } from '@shared/types';

import type { QuoteInput } from '@/types/quote.type';

import { translate } from '@/config/i18n';
import {
  changeQuoteStatusSchema, createQuoteSchema, getQuoteSchema, getQuotesSchema, quoteInputSchema,
  updateQuoteSchema,
} from '@/validations/_domain/quote.validations';

import {
  changeQuoteStatusService, getQuoteByIdService, getQuotesService, saveQuoteService,
} from '../../services/_domain/quote.service.cloud';
import { resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * The quotes exist in the Aldaron workspace only: every function first checks that the account's
 * roles open it, then `fromBO` checks the right on the collection. Both apply — holding Aldaron opens
 * the workspace, not every action in it.
 */
const assertAgencyWorkspace = (request: Parse.Cloud.FunctionRequest): Promise<TargetEnum> => (
  resolveWorkspace(request.user, TargetEnum.AGENCY, request.params.locale)
);

// the quote named by the request, or the translated "not found" error
const getQuoteOrThrow = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const quote = await getQuoteByIdService(request.params.id);

  if (!quote) throw new Error(translate('quote.notFound', request.params.locale));

  return quote;
};

// the typed fields, as the validation leaves them (trimmed, empty boxes turned into `null`)
const toQuoteInput = (params: Record<string, unknown>): QuoteInput => quoteInputSchema.parse(params);

Parse.Cloud.define(
  'getQuotes',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest) => {
      await assertAgencyWorkspace(request);

      return getQuotesService(request.params as Parameters<typeof getQuotesService>[0]);
    },
    ['find'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(getQuotesSchema)
);

Parse.Cloud.define(
  'getQuote',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
      await assertAgencyWorkspace(request);

      return getQuoteByIdService(request.params.id);
    },
    ['get'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(getQuoteSchema)
);

Parse.Cloud.define(
  'createQuote',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      return saveQuoteService(toQuoteInput(request.params), request.user!, request.params.locale);
    },
    ['create'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(createQuoteSchema)
);

// only a draft is edited: the trigger refuses it anyway, this gives the reason before anything is written
Parse.Cloud.define(
  'updateQuote',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const quote = await getQuoteOrThrow(request);
      const { locale } = request.params;

      if (quote.get('status') !== QuoteStatusEnum.DRAFT) {
        throw new Error(translate('quote.notEditable', locale, {
          status: translate(`quote.statuses.${quote.get('status')}`, locale),
        }));
      }

      return saveQuoteService(toQuoteInput(request.params), request.user!, locale, quote);
    },
    ['update'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(updateQuoteSchema)
);

// sending, accepting, refusing or expiring a quote: an edit of its status, never of its content
Parse.Cloud.define(
  'changeQuoteStatus',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const quote = await getQuoteOrThrow(request);
      const {
        status, acceptanceMethod, acceptanceProof, locale,
      } = request.params;

      return changeQuoteStatusService(
        quote, { status, acceptanceMethod, acceptanceProof }, request.user!, locale
      );
    },
    ['update'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(changeQuoteStatusSchema)
);
