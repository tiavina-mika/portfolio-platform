import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SelectInput from '@/components/form/inputs/SelectInput';
import { SETTINGS_CONTROL_WIDTH } from '@/constants/_core/ui/entity.constants';
import { changeSettings } from '@/redux/actions/_core/app.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { Locale } from '@/types/_core/setting.type';
import { localeOptions } from '@/utils/_core/settings.utils';

import SettingsPanel from './SettingsPanel';
import SettingsRow from './SettingsRow';

/**
 * The language the back-office is read in. It is a preference of the person signed in, applied the
 * moment it is picked — there is nothing to save.
 */
const SettingsLanguagePanel = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const locale = useSelector(getSettingsLocaleSelector);

  const handleLocaleChange = async (newLocale: Locale) => {
    await dispatch(changeSettings({ locale: newLocale }));
  };

  return (
    <SettingsPanel>
      <SettingsRow fitControl description={t('languageDescription')} label={t('languages')}>
        <SelectInput
          fullWidth={false}
          onChange={handleLocaleChange}
          options={localeOptions}
          value={locale}
          width={SETTINGS_CONTROL_WIDTH}
        />
      </SettingsRow>
    </SettingsPanel>
  );
};

export default SettingsLanguagePanel;
