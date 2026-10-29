import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CheckboxField from '@/components/form/fields/CheckboxField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { IPageSection, PageSectionInput } from '@/types/page.type';
import { getPageSectionEditionInitialValues } from '@/utils/cms.utils';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { pageSectionSchema } from '@/validations/page.validations';

import TranslatedSectionBlocksField from './TranslatedSectionBlocksField';

type Props = {
  formId?: string;
  onSubmit: (values: PageSectionInput) => void;
  section?: IPageSection;
};

const PageSectionForm = ({
  formId, onSubmit, section,
}: Props) => {
  const {
    t,
  } = useTranslation();
  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const form = useForm<PageSectionInput>({
    resolver: zodResolver(pageSectionSchema),
    // defaultValues: { active: true, blocks: [{ title: '' }] },
  });

  const {
    handleSubmit, reset,
  } = form;

  useEffect(() => {
    if (!section) {
      reset({ active: true, blocks: [{ title: '' }] });
      return;
    }

    const init = async () => {
      const values = await getPageSectionEditionInitialValues(section);

      reset(values);
    };

    init();
  }, [section, reset]);

  const handleFormSubmit: SubmitHandler<PageSectionInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      formId={formId}
      isDisabled={false}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* translated tabs */}
      <TranslationTabs
        errors={getTranslatedFormTabErrors(form?.formState.errors, ['title', 'description'])}
        onTabChange={onTabChange}
        tab={tab}
      />
      <Stack spacing={3}>
        <Stack>
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
                label={t('common:title')}
                name={locale + ':title'}
                required={locale === DEFAULT_LOCALE}
                type="text"
                variant="outlined"
              />
              <TextField
                fixedLabel
                fullWidth
                multiline
                label={t('common:description')}
                name={locale + ':description'}
                rows={3}
                type="text"
                variant="outlined"
              />
            </Stack>
          ))}
        </Stack>
        <TranslatedSectionBlocksField
          currentLocale={tab}
          name="blocks"
        />
      </Stack>

      <CheckboxField
        label={t('common:active')}
        name="active"
        tooltip={t('cms:activePageVisible')}
      />
    </Form>
  );
};

export default PageSectionForm;
