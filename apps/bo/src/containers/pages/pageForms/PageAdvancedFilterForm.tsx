import { useTranslation } from 'react-i18next';

import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/cms.constants';
import { CategoryEntityEnum } from '@/types/category.type';
import { PageFiltersInput } from '@/types/page.type';
import { pageFilterSchema } from '@/validations/page.validations';

import CategoriesSearchByEntityField from '../../categories/CategoriesSearchByEntityField';

type Props = {
  onSubmit: (values: any) => void;
};

const PageAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<PageFiltersInput>
      schema={pageFilterSchema}
      fields={[
        {
          label: t('cms:pageName'),
          name: 'name',
          checked: false,
          component: <TextField fullWidth name="name" placeholder={t('cms:pageName')} />,
        },
        {
          label: t('cms:title'),
          name: 'title',
          checked: false,
          component: <TextField fullWidth name="title" placeholder={t('cms:title')} />,
        },
        {
          label: t('cms:category.category'),
          name: 'category',
          checked: false,
          component: (
            <CategoriesSearchByEntityField
              entity={CategoryEntityEnum.PAGE}
              multiple={false}
              name="category"
              placeholder={t('cms:category.category')}
            />
          ),
        },
        {
          label: t('common:metaTitle'),
          name: 'metaTitle',
          checked: false,
          component: <TextField fullWidth name="metaTitle" placeholder={t('common:metaTitle')} />,
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
          component: <DateRangePickerField fullWidth name="createdAt" />,
        },
        {
          label: t('common:updatedAt'),
          name: 'updatedAt',
          checked: false,
          component: <DateRangePickerField fullWidth name="updatedAt" />,
        },
        {
          label: t('user:user'),
          name: 'user',
          checked: false,
          component: <TextField fullWidth name="user" placeholder={t('user:nameOrEmail')} />,
        },
      ]}
      onSubmit={onSubmit}
    />
  );
};

export default PageAdvancedFilterForm;
