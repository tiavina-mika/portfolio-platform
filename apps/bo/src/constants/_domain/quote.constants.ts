import { DOMAIN_COLLECTIONS, QUOTE_CURRENCIES } from '@shared/domain-constants';
import { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';

import type { StatusTone } from '@/utils/_core/theme/styles.utils';

import i18n from '@/config/i18n';
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

export const QUOTE_FORM_ID = 'quote-form';
export const QUOTE_ACCEPT_FORM_ID = 'quote-accept-form';
