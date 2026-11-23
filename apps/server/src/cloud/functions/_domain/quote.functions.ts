import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { QuoteStatusEnum } from '@shared/domain-types';
import { canAmendQuote, canReviseQuote } from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';

import type { QuoteInput, QuoteRequestPrefill } from '@/types/quote.type';

import { translate } from '@/config/i18n';
import { parseQuoteRequestMessage } from '@/utils/_domain/quote-request.utils';
import {
  changeQuoteStatusSchema, createQuoteSchema, getQuoteSchema, getQuotesSchema, prepareQuoteFromContactSchema,
  quoteInputSchema, reviseQuoteSchema, updateQuoteSchema,
} from '@/validations/_domain/quote.validations';

import {
  findOrCreateClientFromContactService, getConvertibleContactService, linkContactToQuoteService,
} from '../../services/_domain/contact-quote.service.cloud';
import {
  changeQuoteStatusService, getQuoteByIdService, getQuotesService, type QuoteRevision, reviseQuoteService,
  saveQuoteService,
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

/*
 * a new quote, or an amendment of an accepted one (`parentQuote`): only an accepted quote is amended,
 * said here before anything is written; the trigger holds the same rule for every save
 */
Parse.Cloud.define(
  'createQuote',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const { parentQuote: parentQuoteId, contact: contactId, locale } = request.params;
      // checked again here: the request may have been turned into a quote since the form was opened
      const contact = contactId ? await getConvertibleContactService(contactId, locale) : undefined;

      if (parentQuoteId) {
        const parentQuote = await getQuoteByIdService(parentQuoteId);

        if (!parentQuote) throw new Error(translate('quote.parentNotFound', locale));
        if (!canAmendQuote(parentQuote.get('status'))) {
          throw new Error(translate('quote.amendmentNotAllowed', locale, {
            number: parentQuote.get('number'),
            status: translate(`quote.statuses.${parentQuote.get('status')}`, locale),
          }));
        }
      }

      const quote = await saveQuoteService(
        toQuoteInput(request.params), request.user!, locale, { parentQuoteId }
      );

      if (contact) await linkContactToQuoteService(contact, quote);

      return quote;
    },
    ['create'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(createQuoteSchema)
);

type QuoteFromContact = {
  // the client the quote will be written for: found by the request's e-mail, or created from it
  client: Parse.Object;
  prefill: QuoteRequestPrefill;
};

/*
 * the first step of "Create the client and the quote" on a quote request of the site: the client, and
 * what the draft starts from. Nothing of the quote is written yet: the form opens prefilled, and saving it
 * calls `createQuote` with the request, which then points to the quote
 */
Parse.Cloud.define(
  'prepareQuoteFromContact',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<QuoteFromContact> => {
      await assertAgencyWorkspace(request);

      const { id, locale } = request.params;
      const contact = await getConvertibleContactService(id, locale);
      const client = await findOrCreateClientFromContactService(contact, request.user!, locale);
      const fallbackTitle = translate('quote.requestTitle', locale, { name: client.get('name') });

      return { client, prefill: parseQuoteRequestMessage(contact.get('message') ?? '', fallbackTitle) };
    },
    ['create'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(prepareQuoteFromContactSchema)
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

      return saveQuoteService(toQuoteInput(request.params), request.user!, locale, { quote });
    },
    ['update'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(updateQuoteSchema)
);

/*
 * a sent quote changed before the client answers: a new draft version under the same number, the
 * sent version expiring. An accepted quote is never revised: it is completed by an amendment
 */
Parse.Cloud.define(
  'reviseQuote',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<QuoteRevision> => {
      await assertAgencyWorkspace(request);

      const quote = await getQuoteOrThrow(request);
      const { locale } = request.params;
      const status: QuoteStatusEnum = quote.get('status');

      if (status === QuoteStatusEnum.ACCEPTED) {
        throw new Error(translate('quote.acceptedNotRevisable', locale, { number: quote.get('number') }));
      }
      if (!canReviseQuote(status)) {
        throw new Error(translate('quote.revisionNotAllowed', locale, {
          status: translate(`quote.statuses.${status}`, locale),
        }));
      }

      return reviseQuoteService(quote, request.user!, locale);
    },
    // a revision writes a new quote and moves the one revised
    ['create', 'update'],
    DOMAIN_COLLECTIONS.quote
  ),
  parseFunctionValidation(reviseQuoteSchema)
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
