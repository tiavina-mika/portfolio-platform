import { useTranslation } from 'react-i18next';

import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { accountVerificationOptions, sexOptions, userPlatformOptions } from '@/constants/user.constants';
import { UserFiltersInput } from '@/types/user.type';
import { userFilterSchema } from '@/validations/user.validation';

type Props = {
  onSubmit: (values: UserFiltersInput) => void;
};
const UserAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<UserFiltersInput>
      onSubmit={onSubmit}
      schema={userFilterSchema}
      fields={[
        {
          label: t('user:lastName'),
          name: 'lastName',
          checked: false,
          component: (
            <TextField
              fixedLabel
              fullWidth
              name="lastName"
              placeholder={t('user:lastName')}
              variant="standard"
            />
          ),
        },
        {
          label: t('user:firstName'),
          name: 'firstName',
          checked: false,
          component: (
            <TextField
              fixedLabel
              fullWidth
              name="firstName"
              placeholder={t('user:firstName')}
              variant="standard"
            />
          ),
        },
        {
          label: t('user:accountVerified'),
          name: 'verified',
          checked: false,
          component: <ToggleButtonsField name="verified" options={accountVerificationOptions} />,
        },
        {
          label: t('common:createdAt'),
          name: 'createdAt',
          checked: false,
          component: <DateRangePickerField fullWidth name="createdAt" variant="standard" />,
        },
        {
          label: t('common:updatedAt'),
          name: 'updatedAt',
          checked: false,
          component: <DateRangePickerField fullWidth name="updatedAt" variant="standard" />,
        },
        {
          label: t('user:birthday'),
          name: 'birthday',
          checked: false,
          component: <DateRangePickerField fullWidth name="birthday" variant="standard" />,
        },
        {
          label: t('user:sex'),
          name: 'sex',
          checked: false,
          component: <ToggleButtonsField isMulti name="sex" options={sexOptions} />,
        },
        {
          label: t('common:platform'),
          name: 'platforms',
          checked: false,
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
