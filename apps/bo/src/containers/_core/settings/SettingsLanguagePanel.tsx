import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SelectInput from '@/components/form/inputs/SelectInput';
import { SETTINGS_CONTROL_WIDTH } from '@/constants/_core/ui/entity.constants';
import { changeSettings } from '@/redux/actions/_core/app.action';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import { Locale, SettingsSectionEnum } from '@/types/_core/setting.type';
import { getSettingsExtraRows, localeOptions } from '@/utils/_core/settings.utils';

import SettingsPanel from './SettingsPanel';
import SettingsRow from './SettingsRow';

/**
 * The language the back-office is read in, followed by the regional settings a domain adds for the
 * workspace worked in (the default currency of the quotes, for one). Each is a preference of the
 * person signed in, applied the moment it is picked — there is nothing to save.
 */
const SettingsLanguagePanel = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const locale = useSelector(getSettingsLocaleSelector);
  const workspace = useSelector(getSettingsWorkspaceSelector);
  const extraRows = getSettingsExtraRows(SettingsSectionEnum.LANGUAGES, workspace);

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
      {extraRows.map((row) => <row.component key={row.id} />)}
    </SettingsPanel>
  );
};

export default SettingsLanguagePanel;
