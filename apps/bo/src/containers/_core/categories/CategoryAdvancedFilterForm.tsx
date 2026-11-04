import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions, categoryEntityOptions, categoryLevelOptions } from '@/constants/_core/cms.constants';
import { CategoryFiltersInput } from '@/types/_core/category.type';
import { categoryFilterSchema } from '@/validations/_core/category.validations';

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
      onSubmit={onSubmit}
      schema={categoryFilterSchema}
      fields={[
        {
          label: t('cms:category.categoryFor'),
          name: 'entity',
          component: (
            <SelectField
              isClearable
              name="entity"
              options={categoryEntityOptions}
            />
          ),
        },
        {
          label: t('common:active'),
          name: 'active',
          component: (
            <ToggleButtonsField isMulti name="active" options={activeOptions} />
          ),
        },
        {
          label: t('cms:category.level'),
          name: 'level',
          component: (
            <ToggleButtonsField name="level" options={categoryLevelOptions} />
          ),
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
          label: t('common:user'),
          name: 'user',
          component: (
            <TextField
              fullWidth
              name="user"
              placeholder={t('user:nameEmailOrPhone')}
            />
          ),
        },
        {
          label: t('cms:category.minItems'),
          name: 'minItems',
          component: (
            <TextField
              fullWidth
              name="minItems"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
        {
          label: t('cms:category.maxItems'),
          name: 'maxItems',
          component: (
            <TextField
              fullWidth
              name="maxItems"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
      ]}
    />
  );
};

export default CategoryAdvancedFilterForm;
