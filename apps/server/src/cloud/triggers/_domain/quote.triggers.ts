import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientStatusEnum, QuoteStatusEnum } from '@shared/domain-types';
import { canChangeQuoteStatus, computeQuoteAmounts } from '@shared/domain-utils';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { QUOTE_FROZEN_FIELDS, QUOTE_NUMBER_TIME_ZONE } from '@/constants/_domain/quote.constants';
import { QuoteParentRelationEnum } from '@/types/quote.type';
import {
  buildQuoteCounterName, canAttachQuoteAcceptanceProof, formatQuoteNumber, getQuoteNumberYear,
  getQuoteParentRelation, isQuoteAcceptanceProofFile,
} from '@/utils/_domain/quote.utils';

import { takeNextCounterValueService } from '../../services/_core/counter.service.cloud';
import { getClientByIdService } from '../../services/_domain/client.service.cloud';
import { getQuoteByIdService } from '../../services/_domain/quote.service.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

/*
 * The columns only the server writes. On an existing quote a change to one of them is put back as it
 * was, whatever wrote it: the validation of the functions already refuses them, this holds for any
 * other save. `paidAmount` is not in the list: it stays 0 until the payments exist.
 * TODO(link:060-add-quote-payments-with-the-30-40-30-schedule): let the payment trigger keep
 * `paidAmount` up to date, and put it back here for every other save.
 */
const SERVER_OWNED_FIELDS = ['number', 'version', 'parentQuote', 'issuedAt', 'acceptedAt', 'createdBy'] as const;

const restoreOriginalValue = (quote: Parse.Object, original: Parse.Object, field: string): void => {
  const value = original.get(field);

  if (value === undefined) quote.unset(field);
  else quote.set(field, value);
};

const translateStatus = (status: QuoteStatusEnum, locale: Locale): string => (
  translate(`quote.statuses.${status}`, locale)
);

// the client of a quote must be one still worked with: archived or anonymized clients get no new quote
const assertActiveClient = async (quote: Parse.Object, locale: Locale): Promise<void> => {
  const client = await getClientByIdService(quote.get('client')?.id);

  if (!client || client.get('status') !== ClientStatusEnum.ACTIVE) {
    throw new Error(translate('quote.clientNotActive', locale));
  }
};

// the quote this one revises or amends, or `null` for a first quote
const getParentQuote = async (quote: Parse.Object, locale: Locale): Promise<Parse.Object | null> => {
  const parentId: string | undefined = quote.get('parentQuote')?.id;

  if (!parentId) return null;

  const parent = await getQuoteByIdService(parentId);

  if (!parent) throw new Error(translate('quote.parentNotFound', locale));

  return parent;
};

/*
 * a revision or an amendment carries on the dealings with the same client: its client is the one of
 * the quote it points to, from its creation to its last edit
 */
const assertParentClient = (quote: Parse.Object, parent: Parse.Object, locale: Locale): void => {
  if (quote.get('client')?.id !== parent.get('client')?.id) {
    throw new Error(translate('quote.parentClientMismatch', locale, { number: parent.get('number') }));
  }
};

/**
 * What a new quote pointing to another one becomes, read from where that quote stands, whatever saved
 * it: pointing to a sent quote it is its next version, under its number; pointing to an accepted one it
 * is an amendment, under a number of its own (taken later, like any new quote). A draft, a refused or an
 * expired quote is pointed to by nothing.
 * @returns whether the quote took its number from the parent (a revision)
 */
const applyParentRelation = (quote: Parse.Object, parent: Parse.Object, locale: Locale): boolean => {
  const relation = getQuoteParentRelation(parent.get('status'));

  if (!relation) {
    throw new Error(translate('quote.parentNotAllowed', locale, {
      number: parent.get('number'),
      status: translateStatus(parent.get('status'), locale),
    }));
  }

  if (relation !== QuoteParentRelationEnum.REVISION) return false;

  quote.set('number', parent.get('number'));
  quote.set('version', (parent.get('version') ?? 1) + 1);

  return true;
};

/**
 * A quote that left `draft` is what the client received: its content no longer changes, and its
 * status only moves forward (`draft → sent → accepted | refused | expired`). Sending it dates it,
 * accepting it dates the acceptance, requires the way the client said yes and is the only move that may
 * join a proof file.
 */
const checkUpdatedQuote = (quote: Parse.Object, original: Parse.Object, locale: Locale): void => {
  SERVER_OWNED_FIELDS.forEach((field) => {
    if (quote.dirty(field)) restoreOriginalValue(quote, original, field);
  });

  const from: QuoteStatusEnum = original.get('status');
  const to: QuoteStatusEnum = quote.get('status');

  if (from !== QuoteStatusEnum.DRAFT && QUOTE_FROZEN_FIELDS.some((field) => quote.dirty(field))) {
    throw new Error(translate('quote.notEditable', locale, { status: translateStatus(from, locale) }));
  }

  // the proof is joined by the acceptance itself, and must be a file the back-office stored
  if (quote.dirty('acceptanceProof')) {
    if (!canAttachQuoteAcceptanceProof(from, to)) {
      throw new Error(translate('quote.acceptanceProofNotAllowed', locale));
    }
    if (!isQuoteAcceptanceProofFile(quote.get('acceptanceProof'), process.env.CLOUDINARY_NAME)) {
      throw new Error(translate('quote.acceptanceProofInvalid', locale));
    }
  }

  if (from === to) {
    // the acceptance method belongs to the acceptance: it is not changed afterwards
    if (quote.dirty('acceptanceMethod')) restoreOriginalValue(quote, original, 'acceptanceMethod');
    return;
  }

  if (!canChangeQuoteStatus(from, to)) {
    throw new Error(translate('quote.statusChangeNotAllowed', locale, {
      from: translateStatus(from, locale),
      to: translateStatus(to, locale),
    }));
  }

  if (to === QuoteStatusEnum.SENT && !original.get('issuedAt')) quote.set('issuedAt', new Date());

  if (to === QuoteStatusEnum.ACCEPTED) {
    if (!quote.get('acceptanceMethod')) throw new Error(translate('quote.acceptanceMethodRequired', locale));
    quote.set('acceptedAt', new Date());
  } else if (quote.dirty('acceptanceMethod')) {
    restoreOriginalValue(quote, original, 'acceptanceMethod');
  }
};

/*
 * A quote is saved by its Cloud Functions with the master key, so the session is not on the request:
 * the functions hand the user and the language over through the save's context.
 */
Parse.Cloud.beforeSave(
  DOMAIN_COLLECTIONS.quote,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const quote = request.object;
    const locale = (request.context?.locale as Locale | undefined) ?? DEFAULT_LANGUAGE;
    const userId = (request.context?.userId as string | undefined) ?? request.user?.id;
    const author = userId ? convertIdToPointer<Parse.User>(collections.User, userId) : undefined;
    const isNew = !quote.existed();

    if (isNew) {
      // whatever was sent, a quote is born a draft, first version, with nothing paid
      quote.set('status', QuoteStatusEnum.DRAFT);
      quote.set('version', 1);
      quote.set('paidAmount', 0);
      ['number', 'issuedAt', 'acceptedAt', 'acceptanceMethod', 'acceptanceProof']
        .forEach((field) => quote.unset(field));
      if (author) quote.set('createdBy', author);
    } else if (request.original) {
      checkUpdatedQuote(quote, request.original, locale);
    }

    const isClientSet = isNew || quote.dirty('client');

    if (isClientSet) await assertActiveClient(quote, locale);

    const parent = isClientSet ? await getParentQuote(quote, locale) : null;

    if (parent) assertParentClient(quote, parent, locale);

    // a revision takes the number of the quote it revises, so it takes none from the counter below
    const isRevision = isNew && !!parent && applyParentRelation(quote, parent, locale);

    if (author) quote.set('updatedBy', author);

    // the server is the source of truth of the total, whatever the form showed
    quote.set('totalAmount', computeQuoteAmounts(quote.get('lines') ?? [], quote.get('taxRate')).totalAmount);

    if (!isNew || isRevision) return;

    /*
     * the number is taken last, once every refusal above is behind: a refused quote takes no number,
     * so the numbering of a year has no gap. The counter is incremented by the database itself, so two
     * quotes created at the same moment never share one
     */
    const year = getQuoteNumberYear(new Date(), QUOTE_NUMBER_TIME_ZONE);
    const sequence = await takeNextCounterValueService(buildQuoteCounterName(year));

    quote.set('number', formatQuoteNumber(year, sequence));
  })
);
