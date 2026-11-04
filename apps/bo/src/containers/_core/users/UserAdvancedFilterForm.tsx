import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import {
  accountEmailVerificationOptions, accountPhoneVerificationOptions,
  sexOptions, userPlatformOptions,
} from '@/constants/_core/user.constants';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { UserFiltersInput } from '@/types/_core/user.type';
import { userFilterSchema } from '@/validations/_core/user.validations';

type Props = {
  onSubmit: (values: UserFiltersInput) => void;
};
const UserAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const countryOptions = useAllowedCountryOptions();

  return (
    <AdvancedSearchForm<UserFiltersInput>
      onSubmit={onSubmit}
      schema={userFilterSchema}
      fields={[
        {
          label: t('user:lastName'),
          name: 'lastName',
          component: (
            <TextField
              fixedLabel
              fullWidth
              name="lastName"
              placeholder={t('user:lastName')}
            />
          ),
        },
        {
          label: t('user:firstName'),
          name: 'firstName',
          component: (
            <TextField
              fixedLabel
              fullWidth
              name="firstName"
              placeholder={t('user:firstName')}
            />
          ),
        },
        {
          label: t('user:emailVerified'),
          name: 'emailVerified',
          component: <ToggleButtonsField name="emailVerified" options={accountEmailVerificationOptions} />,
        },
        {
          label: t('user:phoneVerified'),
          name: 'phoneVerified',
          component: <ToggleButtonsField name="phoneVerified" options={accountPhoneVerificationOptions} />,
        },
        {
          label: t('common:createdAt'),
          name: 'createdAt',
          component: <DateRangeField endDefaultsToToday name="createdAt" />,
        },
        {
          label: t('common:updatedAt'),
          name: 'updatedAt',
          component: <DateRangeField name="updatedAt" />,
        },
        {
          label: t('user:birthday'),
          name: 'birthday',
          component: <DateRangeField name="birthday" />,
        },
        {
          label: t('user:sex'),
          name: 'sex',
          component: <ToggleButtonsField isMulti name="sex" options={sexOptions} />,
        },
        {
          label: t('common:country'),
          name: 'countries',
          component: (
            <SelectField
              isClearable
              isMulti
              label={t('common:country')}
              name="countries"
              options={countryOptions}
            />
          ),
        },
        {
          label: t('common:platform'),
          name: 'platforms',
          component: (
            <SelectField
              isClearable
              isMulti
              label={t('common:platform')}
              name="platforms"
              options={userPlatformOptions}
            />
          ),
        },
      ]}
    />

  );
};

export default UserAdvancedFilterForm;
