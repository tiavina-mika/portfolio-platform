import { capitalize } from 'string-ts';

import i18n from '@/config/i18n';
import { IListTabValue, ISelectOption, TranslatedFieldOption } from '@/types/app.type';

export const unseenTabOption: IListTabValue = {
  label: capitalize(i18n.t('route:tabs.news')),
  tab: i18n.t('route:tabs.news'),
  key: 'seen',
  value: false,
};

/**
 * tab to always show
 */
export const recycleBinTabOptions: IListTabValue[] = [
  {
    label: i18n.t('common:recycleBin'),
    tab: i18n.t('route:tabs.recycleBin'),
    key: 'deleted',
    value: true,
  },
];

export const defaultTabOptions: IListTabValue[] = [
  unseenTabOption,
  ...recycleBinTabOptions,
];

// options for select input
export const booleanOptions: ISelectOption<boolean>[] = [
  {
    label: i18n.t('common:yes'),
    value: true,
  },
  {
    label: i18n.t('common:no'),
    value: false,
  },
];

export const orderSelectOptions: ISelectOption[] = [
  {
    value: 'asc',
    label: i18n.t('common:ascending'),
  },
  {
    value: 'desc',
    label: i18n.t('common:descending'),
  },
];

export const appTranslatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'quote', required: true, max: 200 },
  { name: 'description', required: true, max: 2000 },
];
