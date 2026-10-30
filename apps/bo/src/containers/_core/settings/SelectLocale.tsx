import { useDispatch, useSelector } from 'react-redux';

import SelectInput from '@/components/form/inputs/SelectInput';
import { locales } from '@/config/i18n';
import { changeLocale } from '@/redux/actions/_core/app.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { Locale } from '@/types/_core/setting.type';
import { renderLocaleLabel } from '@/utils/_core/settings.utils';

const classes = {
  selectLocale: {
    paddingTop: 0,
    paddingBottom: 3,
  },
};
const SelectLocale = () => {
  const dispatch = useDispatch();
  const locale = useSelector(getSettingsLocaleSelector);

  const handleChange = (locale: any) => {
    dispatch(changeLocale(locale as Locale));
  };

  const options = locales.map((locale: any) => ({ value: locale, label: renderLocaleLabel(locale) }));

  return (
    <SelectInput
      onChange={handleChange}
      options={options}
      styles={{ control: classes.selectLocale }}
      value={locale}
    />
  );
};

export default SelectLocale;
