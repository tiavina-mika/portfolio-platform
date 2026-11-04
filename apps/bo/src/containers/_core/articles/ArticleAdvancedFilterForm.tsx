import { CategoryEntityEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/_core/cms.constants';
import CategoriesSearchByEntityField from '@/containers/_core/categories/CategoriesSearchByEntityField';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { ArticleFiltersInput } from '@/types/_core/article.type';
import { articleFilterSchema } from '@/validations/_core/article.validations';


type Props = {
  onSubmit: (values: ArticleFiltersInput) => void;
};

const ArticleAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation(['cms', 'common', 'user']);
  const countryOptions = useAllowedCountryOptions();

  return (
    <AdvancedSearchForm<ArticleFiltersInput>
      onSubmit={onSubmit}
      schema={articleFilterSchema}
      fields={[
        {
          label: t('cms:title'),
          name: 'title',
          component: <TextField fullWidth name="title" placeholder={t('cms:title')} />,
        },
        {
          label: t('cms:category.category'),
          name: 'category',
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
          label: 'Tags',
          name: 'tags',
          component: <TextField fullWidth name="tags" placeholder={t('common:infoMessages.separateTagsWithComma')} />,
        },
        {
          label: t('common:status'),
          name: 'active',
          component: (
            <ToggleButtonsField isMulti name="active" options={activeOptions} />
          ),
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
          label: t('user:user'),
          name: 'user',
          component: <TextField fullWidth name="user" placeholder={t('user:nameEmailOrPhone')} />,
        },
        {
          label: t('cms:minShares'),
          name: 'minShares',
          component: (
            <TextField
              fullWidth
              name="minShares"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
        {
          label: t('cms:maxShares'),
          name: 'maxShares',
          component: (
            <TextField
              fullWidth
              name="maxShares"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
      ]}
    />
  );
};

export default ArticleAdvancedFilterForm;
