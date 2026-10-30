import { useTranslation } from 'react-i18next';

import SelectField from '@/components/form/fields/SelectField';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';

/**
 * The country a page or an article is written for: a country's website only shows its own content.
 * An editor whose roles cover only some countries is offered those.
 */
const CmsCountryField = () => {
  const { t } = useTranslation(['common', 'cms']);
  const countryOptions = useAllowedCountryOptions();

  return (
    <SelectField
      helperText={t('cms:countryHelper')}
      label={t('common:country')}
      name="country"
      options={countryOptions}
      variant="outlined"
    />
  );
};

export default CmsCountryField;
