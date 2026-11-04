import { css } from '@emotion/css';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, type Theme } from '@mui/material';
import { t } from 'i18next';
import {
  lazy, Suspense, useEffect,
} from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import TextEditorFieldSkeleton from '@/components/form/fields/TextEditorFieldSkeleton';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { appTranslatedFieldsObj } from '@/constants/_core/app.constants';
import { APP_CONTENTS_FORM_ID } from '@/constants/_core/settings.constants';
import {
  SETTINGS_PANEL_BAND_PADDING_Y, SETTINGS_ROW_GAP, SETTINGS_ROW_PADDING_X,
} from '@/constants/_core/ui/entity.constants';
import { useTranslatedFormMissingLocales } from '@/hooks/_core/useTranslatedFormMissingLocales';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { createOrUpdateApp } from '@/redux/actions/_core/app.action';
import { getAppAppSelector } from '@/redux/reducers/_core/app.reducer';
import { IAppInput } from '@/types/_core/app.type';
import { parseSavedTranslatedValuesToForm } from '@/utils/_core/app.utils';
import { getTranslatedFormTabErrors } from '@/utils/_core/utils';
import { appSchema } from '@/validations/_core/app.validations';

import SettingsPanel from '../SettingsPanel';
import SettingsRow from '../SettingsRow';

const TextEditorField = lazy(() => import('@/components/form/fields/TextEditorField'));

/*
 * which locale tabs to mark as invalid — the App's own translated fields, not the CMS ones: a
 * missing quote has to flag the language it is missing in just like a missing title does
 */
const TRANSLATED_APP_FIELDS = appTranslatedFieldsObj.map(field => field.name);

const classes = {
  /*
   * every row of this panel holds the same field in whichever language the strip is on, so the
   * strip belongs to the panel as a whole rather than to any one row: it stands on a band of its
   * own above them, saying what the rows under it are scoped to
   */
  band: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: SETTINGS_ROW_GAP,
    padding: `${SETTINGS_PANEL_BAND_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
    [theme.breakpoints.down('md')]: { gap: theme.spacing(1.5) },
  }),
  /*
   * the languages the field is not currently being written in stay mounted and hidden rather than
   * unmounted: they are fields of the same form, and remounting them would drop what was typed
   */
  localeField: (isVisible: boolean) => ({
    display: isVisible
      ? 'block'
      : 'none',
  }),
  editorInput: css({ '& .mui-tiptap-input': { minHeight: 'initial' } }),
};

type Props = {
  // reported up so the page head can say whether the open section still has changes to save
  onDirtyChange?: (isDirty: boolean) => void;
};

/**
 * The texts of the public website's home header, written once per configured language. The form has
 * no button of its own — the settings page head owns the save action for whichever website section
 * is open, and reaches this form through {@link APP_CONTENTS_FORM_ID}.
 */
const AppContentsForm = ({
  onDirtyChange,
}: Props) => {
  // which language the translated fields are currently being written in
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();
  const app = useSelector(getAppAppSelector);

  const dispatch = useDispatch();

  const form = useForm<IAppInput>({ resolver: zodResolver(appSchema) });

  const {
    reset, formState,
  } = form;
  const {
    isDirty,
  } = formState;
  const missingLocales = useTranslatedFormMissingLocales(form.control, TRANSLATED_APP_FIELDS);

  useEffect(() => {
    if (!app) return;
    const values = parseSavedTranslatedValuesToForm(app, ['translated']);

    reset(values);
  }, [app, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = (values: IAppInput) => {
    dispatch(createOrUpdateApp(values));
  };

  return (
    <Form
      form={form}
      formId={APP_CONTENTS_FORM_ID}
      isDisabled={false}
      onSubmit={handleSubmit}
    >
      <SettingsPanel>
        <Box css={classes.band}>
          <Typography variant="caption">{t('cms:translatedFields')}</Typography>
          <TranslationTabs
            errors={getTranslatedFormTabErrors(formState.errors, TRANSLATED_APP_FIELDS)}
            missingLocales={missingLocales}
            onTabChange={onTabChange}
            tab={tab}
          />
        </Box>

        <SettingsRow required label={t('title')}>
          {locales.map((locale: string, index: number) => (
            <div css={classes.localeField(locale === tab)} key={locale}>
              <Suspense fallback={<TextEditorFieldSkeleton />}>
                <TextEditorField
                  disableTabs
                  bubbleMenuToolbar={['color']}
                  id={locale + index + 'title'}
                  inputClassName={classes.editorInput}
                  name={locale + ':title'}
                  toolbar={['color']}
                />
              </Suspense>
            </div>
          ))}
        </SettingsRow>

        <SettingsRow alignTop required label={t('description')}>
          {locales.map((locale: string, index: number) => (
            <div css={classes.localeField(locale === tab)} key={locale}>
              <Suspense fallback={<TextEditorFieldSkeleton />}>
                <TextEditorField
                  disableTabs
                  bubbleMenuToolbar={['bold', 'italic', 'underline', 'link', 'bulletList', 'orderedList', 'blockquote']}
                  id={locale + index + 'description'}
                  name={locale + ':description'}
                  toolbar={['bold', 'italic', 'underline', 'link', 'bulletList', 'orderedList', 'blockquote']}
                />
              </Suspense>
            </div>
          ))}
        </SettingsRow>

        <SettingsRow
          alignTop
          required
          description={t('app.quoteDescription')}
          label={t('app.quote')}
        >
          {locales.map((locale: string) => (
            <div css={classes.localeField(locale === tab)} key={locale}>
              <TextField
                fullWidth
                multiline
                name={locale + ':quote'}
                rows={3}
                type="text"
                variant="outlined"
              />
            </div>
          ))}
        </SettingsRow>
      </SettingsPanel>
    </Form>
  );
};

export default AppContentsForm;
