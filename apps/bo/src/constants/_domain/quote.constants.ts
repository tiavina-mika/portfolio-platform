import { DOMAIN_COLLECTIONS, QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB, QUOTE_CURRENCIES } from '@shared/domain-constants';
import { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';

import type { StatusTone } from '@/utils/_core/theme/styles.utils';
import type { Accept } from 'react-dropzone';

import i18n from '@/config/i18n';
import { ACCEPTED_PDF_TYPES } from '@/constants/_core/file.constants';
import { IListTabValue, ISelectOption } from '@/types/_core/app.type';

export const QUOTE_COLLECTION = DOMAIN_COLLECTIONS.quote;

// the list scoped on one status; the generic "All" tab before them lists every quote
export const QUOTE_TAB_OPTIONS: IListTabValue[] = Object.values(QuoteStatusEnum).map((status) => ({
  label: i18n.t(`project:quote.statuses.${status}`),
  tab: i18n.t(`route:quoteTabs.${status}`),
  key: 'status',
  value: status,
}));

export const QUOTE_CURRENCY_OPTIONS: ISelectOption[] = Object.keys(QUOTE_CURRENCIES).map((currency) => ({
  label: i18n.t(`project:quote.currencies.${currency}`),
  value: currency,
}));

export const QUOTE_ACCEPTANCE_METHOD_OPTIONS: ISelectOption<QuoteAcceptanceMethodEnum>[] = Object
  .values(QuoteAcceptanceMethodEnum)
  .map((method) => ({ label: i18n.t(`project:quote.acceptanceMethods.${method}`), value: method }));

// the action of the row menu that moves a quote to each status it can reach
export const QUOTE_STATUS_ACTION_LABEL_KEYS: Partial<Record<QuoteStatusEnum, string>> = {
  [QuoteStatusEnum.SENT]: 'project:quote.actions.send',
  [QuoteStatusEnum.ACCEPTED]: 'project:quote.actions.accept',
  [QuoteStatusEnum.REFUSED]: 'project:quote.actions.refuse',
  [QuoteStatusEnum.EXPIRED]: 'project:quote.actions.expire',
};

// the tint of each status in the list, in the dot language every other list uses for a state
export const QUOTE_STATUS_TONES: Record<QuoteStatusEnum, StatusTone> = {
  [QuoteStatusEnum.DRAFT]: 'default',
  [QuoteStatusEnum.SENT]: 'info',
  [QuoteStatusEnum.ACCEPTED]: 'success',
  [QuoteStatusEnum.REFUSED]: 'error',
  [QuoteStatusEnum.EXPIRED]: 'warning',
};

// what the form sends: the server refuses any other field (number, amounts, status) in the same call
export const QUOTE_INPUT_FIELDS = ['client', 'title', 'lines', 'currency', 'taxRate', 'validUntil', 'notes'];

// a new line starts with one unit and nothing typed
export const QUOTE_EMPTY_LINE = { label: '', quantity: 1, unitAmount: 0 };

// the row actions that write a new quote from this one: its next version, or an amendment
export const QUOTE_REVISE_ACTION_LABEL_KEY = 'project:quote.actions.revise';
export const QUOTE_AMEND_ACTION_LABEL_KEY = 'project:quote.actions.amend';

export const QUOTE_FORM_ID = 'quote-form';
export const QUOTE_ACCEPT_FORM_ID = 'quote-accept-form';

// the files the acceptance dialog takes as a proof: the extensions the server checks, by type
export const QUOTE_ACCEPTANCE_PROOF_ACCEPT: Accept = {
  ...ACCEPTED_PDF_TYPES,
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_BYTES = QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB * 1024 * 1024;

// the paperclip before the "Acceptance proof" link of the list, at the size of its text
export const QUOTE_ACCEPTANCE_PROOF_ICON_SIZE = 14;
