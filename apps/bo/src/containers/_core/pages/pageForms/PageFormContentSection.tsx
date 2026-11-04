import { Stack } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextEditorFieldSkeleton from '@/components/form/fields/TextEditorFieldSkeleton';
import TextField from '@/components/form/fields/TextField';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { useSlugAutoSync } from '@/hooks/_core/useSlugAutoSync';
import { useUploadEditorImage } from '@/hooks/_core/useUploadEditorImage';
import { loadPageEditorTempFilesSlice } from '@/redux/reducers/_core/page.reducer';
import { Locale } from '@/types/_core/setting.type';

const TextEditorField = lazy(() => import('@/components/form/fields/TextEditorField'));

type Props = {
  /** the language tab currently open — the section only ever shows one locale's fields */
  locale: Locale;
};

/**
 * What the page says: its name, the title it is headed with, the sentence under it and the body an
 * editor writes in the rich text editor. The first section of the page form and the only one
 * holding fields the schema actually requires.
 */
const PageFormContentSection = ({ locale }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  // upload image to cloud (API) when uploading an image in the editor
  const {
    uploadEditorImage,
  } = useUploadEditorImage({
    folder: 'pages/editor',
    action: loadPageEditorTempFilesSlice,
  });

  const handlePageNameChange = useSlugAutoSync(locale);

  return (
    <CardFormBlock title={t('cms:content')}>
      <Stack spacing={2}>
        <TextField
          fixedLabel
          fullWidth
          helperText={t('cms:pageNameHelper')}
          label={t('cms:pageName')}
          name={locale + ':name'}
          onFieldChange={handlePageNameChange}
          required={locale === DEFAULT_LOCALE}
          type="text"
          variant="outlined"
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
        <Suspense fallback={<TextEditorFieldSkeleton />}>
          <TextEditorField
            id={locale + 'content'}
            label={t('cms:content')}
            name={locale + ':content'}
            required={locale === DEFAULT_LOCALE}
            uploadFileOptions={{ uploadFile: uploadEditorImage(locale) }}
          />
        </Suspense>
      </Stack>
    </CardFormBlock>
  );
};

export default PageFormContentSection;
