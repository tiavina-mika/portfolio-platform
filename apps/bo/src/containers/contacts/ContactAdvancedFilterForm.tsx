import { useTranslation } from 'react-i18next';

import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/cms.constants';
import { ContactFiltersInput } from '@/types/contact.type';
import { contactFilterSchema } from '@/validations/email.validation';

type Props = {
  onSubmit: (values: ContactFiltersInput) => void;
};

const ContactAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <AdvancedSearchForm<ContactFiltersInput>
      schema={contactFilterSchema}
      fields={[
        {
          label: t('user.contacts:replied'),
          name: 'replied',
          checked: false,
          component: (
            <ToggleButtonsField isMulti name="replied" options={activeOptions} />
          ),
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
          label: t('user:name'),
          name: 'name',
          checked: false,
          component: (
            <TextField
              fullWidth
              name="name"
              placeholder={t('user:name')}
              variant="standard"
            />
          ),
        },
        {
          label: t('user:email'),
          name: 'email',
          checked: false,
          component: (
            <TextField
              fullWidth
              name="email"
              placeholder={t('user:email')}
              variant="standard"
            />
          ),
        },
      ]}
      onSubmit={onSubmit}
    />
  );
};

export default ContactAdvancedFilterForm;
