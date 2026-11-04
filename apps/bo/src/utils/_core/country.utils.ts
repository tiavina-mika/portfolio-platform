import { COUNTRIES } from '@shared/constants';

import type { ISelectOption } from '@/types/_core/app.type';

import i18n from '@/config/i18n';

/** The name of a country in the language of the back-office, its code if the browser does not know it */
export const getCountryName = (code: string): string => (
  new Intl.DisplayNames([i18n.language], { type: 'region' }).of(code) ?? code
);

/** The countries the platform runs in, as the options of a select */
export const getCountryOptions = (): ISelectOption[] => (
  Object.keys(COUNTRIES).map((code) => ({ label: getCountryName(code), value: code }))
);
