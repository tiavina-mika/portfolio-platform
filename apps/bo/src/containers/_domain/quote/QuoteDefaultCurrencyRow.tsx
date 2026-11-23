import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SelectInput from '@/components/form/inputs/SelectInput';
import { SETTINGS_CONTROL_WIDTH } from '@/constants/_core/ui/entity.constants';
import { QUOTE_CURRENCY_OPTIONS } from '@/constants/_domain/quote.constants';
import SettingsRow from '@/containers/_core/settings/SettingsRow';
import { changeDefaultCurrencySlice, getSettingsDefaultCurrencySelector } from '@/redux/reducers/_core/settings.reducer';
import { getNewQuoteCurrency } from '@/utils/_domain/quote.utils';

/**
 * The currency a new quote is proposed in, a preference of the person signed in. It only prefills the
 * quote form: every quote stores its own currency, so changing it touches no existing quote.
 */
const QuoteDefaultCurrencyRow = () => {
  const { t } = useTranslation(['project']);
  const dispatch = useDispatch();
  const currency = getNewQuoteCurrency(useSelector(getSettingsDefaultCurrencySelector));

  return (
    <SettingsRow
      fitControl
      description={t('project:quote.defaultCurrencyDescription')}
      label={t('project:quote.defaultCurrency')}
    >
      <SelectInput
        fullWidth={false}
        onChange={(value: string) => dispatch(changeDefaultCurrencySlice(value))}
        options={QUOTE_CURRENCY_OPTIONS}
        value={currency}
        width={SETTINGS_CONTROL_WIDTH}
      />
    </SettingsRow>
  );
};

export default QuoteDefaultCurrencyRow;
