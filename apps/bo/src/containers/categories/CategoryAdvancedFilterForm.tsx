import { useTranslation } from 'react-i18next';

import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions, categoryEntityOptions } from '@/constants/cms.constants';
import { CategoryFiltersInput } from '@/types/category.type';
import { categoryFilterSchema } from '@/validations/category.validation';

type Props = {
  onSubmit: (values: CategoryFiltersInput) => void;
};

const CategoryAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<CategoryFiltersInput>
      schema={categoryFilterSchema}
      fields={[
        {
          label: t('cms:category.categoryFor'),
          name: 'entity',
          checked: false,
          component: (
            <SelectField
              isClearable
              name="entity"
              options={categoryEntityOptions}
              variant="standard"
            />
          ),
        },
        {
          label: t('common:active'),
          name: 'active',
          checked: false,
          component: (
            <ToggleButtonsField isMulti name="active" options={activeOptions} />
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
          label: t('user:user'),
          name: 'user',
          checked: false,
          component: (
            <TextField
              fullWidth
              name="user"
              placeholder={t('user:nameOrEmail')}
              variant="standard"
            />
          ),
        },
      ]}
      onSubmit={onSubmit}
    />
  );
};

export default CategoryAdvancedFilterForm;
