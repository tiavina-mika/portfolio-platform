import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextEditorField from '@/components/form/fields/TextEditorField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { createOrUpdateApp } from '@/redux/actions/app.action';
import { getAppAppSelector } from '@/redux/reducers/app.reducer';
import { IAppInput } from '@/types/app.type';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { appCodec, appSchema } from '@/validations/app.validations';

const AppContentsForm = () => {
  /*
   * const locale = useSelector(getSettingsLocaleSelector);
   * get translated fields depending on the selected language (tabs)
   */
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();
  const app = useSelector(getAppAppSelector);

  const dispatch = useDispatch();

  const form = useForm<IAppInput>({ resolver: zodResolver(appSchema) });

  const {
    handleSubmit, reset,
  } = form;

  useEffect(() => {
    if (!app) return;
    const values = appCodec.encode(app.get('translated') as Record<string, any>);

    reset(values);
  }, [app, reset]);

  const onFormSubmit: SubmitHandler<IAppInput> = (values) => {
    dispatch(createOrUpdateApp(values));
  };

  return (
    <Form
      buttonDirection="row"
      buttonFullWidth={false}
      form={form}
      isDisabled={false}
      onSubmit={handleSubmit(onFormSubmit)}
    >
      {/* translated fields */}
      <CardFormBlock description={t('cms:translatedFields')} title={t('details')}>
        {/* translated tabs */}
        <TranslationTabs
          errors={getTranslatedFormTabErrors(form?.formState.errors, TRANSLATED_CMS_FIELDS)}
          onTabChange={onTabChange}
          tab={tab}
        />
        {/* all translated fields */}
        {locales.map((locale: string, index: number) => (
          <div
            key={index}
            css={{
              display: locale === tab
                ? 'block'
                : 'none', marginTop: 12,
            }}
          >
            <Stack spacing={2}>
              <TextEditorField
                id={locale + index + 'description'}
                label={t('description')}
                name={locale + ':description'}
                required={locale === DEFAULT_LOCALE}
                toolbar={['bold', 'italic', 'underline', 'link', 'bulletList', 'orderedList', 'blockquote']}
              />
              <TextField
                fixedLabel
                fullWidth
                multiline
                helperText={t('app.quoteDescription')}
                label={t('app.quote')}
                name={locale + ':quote'}
                required={locale === DEFAULT_LOCALE}
                rows={3}
                type="text"
                variant="outlined"
              />
            </Stack>
          </div>
        ))}
      </CardFormBlock>
    </Form>
  );
};

export default AppContentsForm;
