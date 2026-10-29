import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import CardFormBlock from '@/components/form/CardFormBlock';
import MetaTextField from '@/components/form/fields/MetaTextField';
import TextEditorField from '@/components/form/fields/TextEditorField';
import TextField from '@/components/form/fields/TextField';
import Form, { IFormProps } from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { useUploadEditorImage } from '@/hooks/useUploadEditorImage';
import { loadPageEditorTempFilesSlice } from '@/redux/reducers/page.reducer';
import { IPage, IPageStepOneInput } from '@/types/page.type';
import { Locale } from '@/types/setting.type';
import { getPageStepOneEditionInitialValues } from '@/utils/cms.utils';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { pageStepOneSchema } from '@/validations/page.validations';

import TranslatedSlugField from '../../cms/TranslatedSlugField';

type Props = {
  onSubmit: (values: IPageStepOneInput) => void;
  page?: IPage | null;
  loading?: boolean;
} & Pick<IFormProps, 'buttonDirection' | 'onSecondaryButtonClick' | 'primaryButtonText'>;

const PageFormStepOne = ({
  onSubmit, page, loading, ...formProps
}: Props) => {
  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const form = useForm<IPageStepOneInput>({
    resolver: zodResolver(pageStepOneSchema),
  });

  // upload image to cloud (API) when uploading an image in the editor
  const {
    uploadEditorImage,
  } = useUploadEditorImage({
    folder: 'pages/editor',
    action: loadPageEditorTempFilesSlice,
  });

  const {
    handleSubmit, reset, setValue,
  } = form;

  // initialize form values
  useEffect(() => {
    if (!page) return;
    const init = async () => {
      const editionInitialValues = await getPageStepOneEditionInitialValues(page);

      reset(editionInitialValues);
    };

    init();
  }, [page, reset]);

  // change translated slug field value when the page name is changed
  const handlePageNameChange = (value: string | number) => {
    setValue(tab + ':slug', value, { shouldValidate: true });
  };

  const onFormSubmit: SubmitHandler<IPageStepOneInput> = (values) => {
    onSubmit(values);
  };

  return (
    (
      <Form
        form={form}
        isDisabled={false}
        loading={loading}
        onSubmit={handleSubmit(onFormSubmit)}
        {...formProps}
      >
        <CardFormBlock description={t('cms:translatedFields')} title={t('details')}>
          {/* translated tabs */}
          <TranslationTabs
            errors={getTranslatedFormTabErrors(form?.formState.errors, TRANSLATED_CMS_FIELDS)}
            tab={tab}
            onTabChange={onTabChange}
          />
          {/* all translated fields */}
          {locales.map((locale: string, index: number) => (
          // hide other locale fields, display only the selected (current) locale
            (
              <div
                key={index}
                css={{
                  display: locale === tab
                    ? 'block'
                    : 'none', marginTop: 12,
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    fixedLabel
                    fullWidth
                    helperText={t('cms:pageNameHelper')}
                    label={t('cms:pageName')}
                    name={locale + ':name'}
                    required={locale === DEFAULT_LOCALE}
                    type="text"
                    variant="outlined"
                    onFieldChange={handlePageNameChange}
                  />
                  <TextField
                    fixedLabel
                    fullWidth
                    helperText={t('cms:pageTitleHelper')}
                    label={t('cms:title')}
                    name={locale + ':title'}
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
                  <TextEditorField
                    id={locale + index + 'content'}
                    label={t('cms:content')}
                    name={locale + ':content'}
                    required={locale === DEFAULT_LOCALE}
                    uploadFileOptions={{ uploadFile: uploadEditorImage(locale as Locale) }}
                  />

                  {/* slug field */}
                  <TranslatedSlugField locale={locale} tab={tab} />

                  <TextField
                    fixedLabel
                    fullWidth
                    helperText={t('common:infoMessages.tagsHelper')}
                    label="Tags"
                    name={locale + ':tags'}
                    placeholder={t('common:infoMessages.separateTagsWithComma')}
                    type="text"
                    variant="outlined"
                  />
                  <MetaTextField
                    fixedLabel
                    fullWidth
                    name={locale + ':metaTitle'}
                    type="metaTitle"
                  />
                  <MetaTextField
                    fixedLabel
                    fullWidth
                    name={locale + ':metaDescription'}
                    type="metaDescription"
                  />
                </Stack>
              </div>
            )
          ))}
        </CardFormBlock>
      </Form>
    )
  );
};

export default PageFormStepOne;
