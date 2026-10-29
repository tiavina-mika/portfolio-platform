import { useTranslation } from 'react-i18next';

import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/cms.constants';
import { ArticleFiltersInput } from '@/types/article.type';
import { CategoryEntityEnum } from '@/types/category.type';
import { articleFilterSchema } from '@/validations/article.validations';

import CategoriesSearchByEntityField from '../categories/CategoriesSearchByEntityField';

type Props = {
  onSubmit: (values: ArticleFiltersInput) => void;
};

const ArticleAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<ArticleFiltersInput>
      onSubmit={onSubmit}
      schema={articleFilterSchema}
      fields={[
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
              entity={CategoryEntityEnum.ARTICLE}
              multiple={false}
              name="category"
              placeholder={t('cms:category.category')}
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
    />
  );
};

export default ArticleAdvancedFilterForm;
