import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';


import DropzoneField from '@/components/form/dropzone/DropzoneField';
import CheckboxField from '@/components/form/fields/CheckboxField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { categoryEntityOptions, TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { ICategory, ICategoryInput } from '@/types/category.type';
import { getCategoryFormInitialValues } from '@/utils/cms.utils';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { categorySchema } from '@/validations/category.validation';

import TranslatedSlugField from '../cms/TranslatedSlugField';

type Props = {
  formId: string;
  category?: ICategory | null;
  onSubmit: (values: ICategoryInput) => void;
};

const CategoryForm = ({
  formId, category, onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();
  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const form = useForm<ICategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { active: true },
  });

  const {
    handleSubmit, setValue, reset,
  } = form;

  useEffect(() => {
    if (!category) return;
    const init = async () => {
      const editionInitialValues = await getCategoryFormInitialValues(category);

      reset(editionInitialValues);
    };

    init();
  }, [category, reset]);

  const handleFormSubmit: SubmitHandler<ICategoryInput> = (values) => {
    onSubmit(values);
  };

  // change translated slug field value when name is changed
  const handleNameChange = (value: string | number) => {
    setValue(tab + ':slug', value, { shouldValidate: true });
  };

  return (
    <Form form={form} formId={formId} onSubmit={handleSubmit(handleFormSubmit)}>
      {/* translated tabs */}
      <TranslationTabs
        errors={getTranslatedFormTabErrors(form?.formState.errors, TRANSLATED_CMS_FIELDS)}
        onTabChange={onTabChange}
        tab={tab}
      />
      <div>
        {locales.map((locale: string, index: number) => (
          <Stack
            key={index}
            spacing={2}
            css={{
              display: locale === tab
                ? 'flex'
                : 'none',
            }}
          >
            <TextField
              fixedLabel
              fullWidth
              label={t('common:name')}
              name={locale + ':name'}
              onFieldChange={handleNameChange}
              required={locale === DEFAULT_LOCALE}
              type="text"
              variant="outlined"
            />
            {/* slug field */}
            <TranslatedSlugField locale={locale} tab={tab} />

            <TextField
              fixedLabel
              fullWidth
              label="Tags"
              name={locale + ':tags'}
              placeholder={t('common:infoMessages.separateTagsWithComma')}
              tooltip={t('common:infoMessages.tagsHelper')}
              type="text"
              variant="outlined"
            />
          </Stack>
        ))}
      </div>

      <DropzoneField
        required
        helperText={t('cms:category.imageHelper')}
        inputLabel={t('common:addImage')}
        label={t('common:image')}
        name="image"
        shouldReset={!!category} // can reset input in edition
      />

      <SelectField
        isClearable
        helperText={t('cms:category.categoryForHelper')}
        label={t('cms:category.categoryFor')}
        name="entity"
        options={categoryEntityOptions}
      />

      <CheckboxField
        label={t('common:active')}
        name="active"
        tooltip={t('cms:category.activeCategoryVisible')}
      />
    </Form>
  );
};

export default CategoryForm;
