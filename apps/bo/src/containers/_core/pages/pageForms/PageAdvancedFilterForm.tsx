import { CategoryEntityEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions, pageLinkLocationOptions } from '@/constants/_core/cms.constants';
import CategoriesSearchByEntityField from '@/containers/_core/categories/CategoriesSearchByEntityField';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { PageFiltersInput } from '@/types/_core/page.type';
import { pageFilterSchema } from '@/validations/_core/page.validations';


type Props = {
  onSubmit: (values: any) => void;
};

const PageAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation(['cms', 'common', 'user']);
  const countryOptions = useAllowedCountryOptions();

  return (
    <AdvancedSearchForm<PageFiltersInput>
      onSubmit={onSubmit}
      schema={pageFilterSchema}
      fields={[
        {
          label: t('cms:pageName'),
          name: 'name',
          component: <TextField fullWidth name="name" placeholder={t('cms:pageName')} />,
        },
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
          component: <TextField fullWidth name="metaTitle" placeholder={t('common:metaTitle')} />,
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
          label: t('cms:linkLocation'),
          name: 'linkLocation',
          component: (
            <ToggleButtonsField name="linkLocation" options={pageLinkLocationOptions} />
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
          label: t('cms:minBlocks'),
          name: 'minBlocks',
          component: (
            <TextField
              fullWidth
              name="minBlocks"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
        {
          label: t('cms:maxBlocks'),
          name: 'maxBlocks',
          component: (
            <TextField
              fullWidth
              name="maxBlocks"
              slotProps={{ inputLabel: { shrink: true } }}
              type="number"
            />
          ),
        },
      ]}
    />
  );
};

export default PageAdvancedFilterForm;
