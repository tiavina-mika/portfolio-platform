import { TargetEnum } from '@shared/types';

import QuoteDefaultCurrencyRow from '@/containers/_domain/quote/QuoteDefaultCurrencyRow';
import { SettingsSectionEnum } from '@/types/_core/setting.type';
import { registerSettingsRows } from '@/utils/_core/settings.utils';

/**
 * Side-effect only: adds the default currency of the quotes to the languages section of the settings,
 * in the agency workspace — the only one that writes quotes. Imported once for effect from
 * `config/domain-registrations.ts`.
 */
registerSettingsRows([
  {
    id: 'quoteDefaultCurrency',
    section: SettingsSectionEnum.LANGUAGES,
    workspaces: [TargetEnum.AGENCY],
    component: QuoteDefaultCurrencyRow,
  },
]);
