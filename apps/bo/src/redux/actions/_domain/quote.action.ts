import { toMinorUnits } from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';

import type { QuoteStatusEnum } from '@shared/domain-types';

import i18n from '@/config/i18n';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/constants/_core/app.constants';
import { QUOTE_COLLECTION, QUOTE_TAB_OPTIONS } from '@/constants/_domain/quote.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  addQuoteToQuotesSlice, clearQuotesSlice, loadQuotesSlice, setQuotesCountSlice, updateQuoteInQuotesSlice,
} from '@/redux/reducers/_domain/quote.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  changeQuoteStatus, createQuote, fetchQuote, fetchQuotes, prepareQuoteFromContact, reviseQuote, updateQuote,
  uploadQuoteAcceptanceProof,
} from '@/services/_domain/quote.service';
import { IQueriesInput } from '@/types/_core/app.type';
import {
  IQuote, IQuoteFormValues, IQuoteFromContact, IQuoteInput,
} from '@/types/_domain/quote.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { QuoteAcceptInput } from '@/validations/_domain/quote.validation';

const collection = QUOTE_COLLECTION;

// the language of the server's refusals and the workspace the call is made from
const getRequestContext = (state: RootState) => ({
  locale: getSettingsLocaleSelector(state),
  workspace: getSettingsWorkspaceSelector(state),
});

/*
 * what the form typed, as the server takes it: the unit amounts in the smallest unit of the chosen
 * currency, the empty boxes as `null`
 */
const toQuoteInput = (values: IQuoteFormValues): IQuoteInput => ({
  client: values.client,
  title: values.title,
  currency: values.currency,
  lines: values.lines.map((line) => ({
    label: line.label,
    quantity: Number(line.quantity),
    unitAmount: toMinorUnits(Number(line.unitAmount), values.currency),
  })),
  // the validation already read the box as a number, or as `null` when it was left empty
  taxRate: typeof values.taxRate === 'number' ? values.taxRate : null,
  validUntil: values.validUntil ?? null,
  notes: values.notes || null,
});

const rightsError = (action: 'create' | 'update') => i18n.t(
  action === 'create' ? 'common:errors.hasNoRightToCreate' : 'common:errors.hasNoRightToUpdate',
  { value: i18n.t('project:quote.thisQuote') }
);

export const loadQuotes = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const result = await fetchQuotes({
      limit, skip, orderBy, order, filters, search, ...getRequestContext(getState?.()!),
    });

    dispatch(loadQuotesSlice(result.results));
    dispatch(setQuotesCountSlice(result.count));
  });
};

/**
 * writes a draft: edits the one given, or creates a quote
 * @param amendedQuote on a new quote, the accepted quote it amends
 */
export const createOrUpdateQuote = (
  values: IQuoteFormValues, quote?: IQuote | null, amendedQuote?: IQuote | null
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const input = toQuoteInput(values);

    if (quote) {
      const updated = await updateQuote(quote.id, input, context);

      dispatch(updateQuoteInQuotesSlice(updated));
      dispatch(setMessageSlice(i18n.t('project:quote.messages.updated', { number: updated.number })));
      return;
    }

    const created = await createQuote(input, context, amendedQuote?.id);

    dispatch(addQuoteToQuotesSlice(created));
    dispatch(setMessageSlice(amendedQuote
      ? i18n.t('project:quote.messages.amendmentCreated', {
        number: created.number, parentNumber: amendedQuote.number,
      })
      : i18n.t('project:quote.messages.created', { number: created.number })));
  },
  // rights
  {
    collection,
    action: quote ? 'update' : 'create',
    hasNoRightErrorMessage: rightsError(quote ? 'update' : 'create'),
  });
};

/**
 * sends, accepts, refuses or expires a quote; the row stays where it is with its new status until the
 * list is reloaded, so the reader sees what they just did
 * @param acceptance how the client said yes, and the file that shows it if one was dropped, when the
 * quote is accepted. The file is uploaded first: the status changes only once it is stored
 */
export const setQuoteStatus = (
  quote: IQuote, status: QuoteStatusEnum, acceptance?: QuoteAcceptInput
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const proofFile = acceptance?.acceptanceProof;
    const acceptanceProof = proofFile
      ? await uploadQuoteAcceptanceProof(proofFile, context.locale)
      : undefined;

    if (proofFile && !acceptanceProof) throw new Error(i18n.t('project:quote.acceptanceProofUploadFailed'));

    const updated = await changeQuoteStatus(
      quote.id,
      { status, acceptanceMethod: acceptance?.acceptanceMethod, acceptanceProof },
      context
    );

    dispatch(updateQuoteInQuotesSlice(updated));
    dispatch(setMessageSlice(i18n.t(`project:quote.messages.${status}`, { number: quote.number })));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: rightsError('update'),
  });
};

/**
 * revises a sent quote: its next version shows at the top of the list as a draft, and the sent row
 * stays where it is, now expired
 */
export const reviseSentQuote = (quote: IQuote): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const { quote: revision, revisedQuote } = await reviseQuote(quote.id, getRequestContext(getState?.()!));

    dispatch(updateQuoteInQuotesSlice(revisedQuote));
    dispatch(addQuoteToQuotesSlice(revision));
    dispatch(setMessageSlice(i18n.t('project:quote.messages.revised', {
      number: revision.number, version: revision.version,
    })));
  },
  // rights: a revision writes a new quote and moves the one revised
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: rightsError('create'),
  });
};

/**
 * First step of "Create the client and the quote" on a quote request of the site: the client (found by
 * its e-mail or created) and what the draft starts from, handed to the form that opens prefilled.
 */
export const prepareContactQuote = (
  contactId: string, onReady: (quoteFromContact: IQuoteFromContact) => void
): any => {
  return actionWithLoader(async (_dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    onReady(await prepareQuoteFromContact(contactId, getRequestContext(getState?.()!)));
  },
  // rights
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: rightsError('create'),
  });
};

/**
 * Saves the draft written from a quote request of the site: the request then points to it, and can no
 * longer become a second quote.
 * @param onCreated told the quote, so the message shows what it became without being read again
 */
export const createQuoteFromContact = (
  values: IQuoteFormValues, contactId: string, onCreated: (quote: IQuote) => void
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const created = await createQuote(toQuoteInput(values), context, undefined, contactId);

    dispatch(addQuoteToQuotesSlice(created));
    dispatch(setMessageSlice(
      i18n.t('project:quote.messages.createdFromContact', { number: created.number })
    ));
    onCreated(created);
  },
  // rights
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: rightsError('create'),
  });
};

/**
 * Reads the quote a request of the site became, for the message to name it. Silent: an account that may
 * not read quotes still sees that the request was converted, without an error.
 */
export const loadQuoteOfContact = (quoteId: string, onLoaded: (quote: IQuote) => void): any => {
  return async (_dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      const quote = await fetchQuote(quoteId, getRequestContext(getState()));

      if (quote) onLoaded(quote);
    }
    // the message already says it became a quote: the number is a detail it can do without
    catch { /* nothing to show */ }
  };
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * loads the first page of quotes before the list is shown. The quotes exist in the Aldaron workspace
 * only: an address typed by hand from the portfolio one goes back to the dashboard, as the server
 * would refuse the call anyway.
 */
export const onQuotesEnter = (route: any): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch, getState?: () => RootState): void => {
    if (getSettingsWorkspaceSelector(getState?.()!) !== TargetEnum.AGENCY) {
      throw new Error(Errors.redirect);
    }

    const filters = convertSearchParamsToFilters({
      tabs: QUOTE_TAB_OPTIONS,
      searchParams: route.search,
      filters: {},
    });

    dispatch(clearQuotesSlice());
    dispatch(loadQuotes({
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
      filters,
    }));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};
