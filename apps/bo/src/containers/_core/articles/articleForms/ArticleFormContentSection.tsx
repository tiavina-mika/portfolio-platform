import { Stack } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextEditorFieldSkeleton from '@/components/form/fields/TextEditorFieldSkeleton';
import TextField from '@/components/form/fields/TextField';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { useSlugAutoSync } from '@/hooks/_core/useSlugAutoSync';
import { useUploadEditorImage } from '@/hooks/_core/useUploadEditorImage';
import { loadArticleEditorTempFilesSlice } from '@/redux/reducers/_core/article.reducer';
import { Locale } from '@/types/_core/setting.type';

const TextEditorField = lazy(() => import('@/components/form/fields/TextEditorField'));

type Props = {
  /** the language tab currently open — the section only ever shows one locale's fields */
  locale: Locale;
};

/**
 * What the article says: the title it is headed with (which the slug follows until it is edited
 * by hand), the sentence under it, and the body written in the rich text editor. All three are
 * required in French.
 */
const ArticleFormContentSection = ({ locale }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  // upload image to cloud (API) when uploading an image in the editor
  const {
    uploadEditorImage,
  } = useUploadEditorImage({
    folder: 'articles/editor',
    action: loadArticleEditorTempFilesSlice,
  });

  const handleTitleChange = useSlugAutoSync(locale);
  const isRequired = locale === DEFAULT_LOCALE;

  return (
    <CardFormBlock title={t('cms:content')}>
      <Stack spacing={2}>
        <TextField
          fixedLabel
          fullWidth
          helperText={t('cms:articleForm.titleHelper')}
          label={t('cms:title')}
          name={locale + ':title'}
          onFieldChange={handleTitleChange}
          placeholder={t('cms:articleForm.titlePlaceholder')}
          required={isRequired}
          type="text"
          variant="outlined"
        />
        <TextField
          fixedLabel
          fullWidth
          multiline
          helperText={t('cms:descriptionHelper')}
          label={t('common:description')}
          name={locale + ':description'}
          placeholder={t('cms:articleForm.descriptionPlaceholder')}
          required={isRequired}
          rows={3}
          variant="outlined"
        />
        <Suspense fallback={<TextEditorFieldSkeleton />}>
          <TextEditorField
            helperText={t('cms:articleForm.contentHelper')}
            id={locale + 'content'}
            label={t('cms:content')}
            name={locale + ':content'}
            placeholder={t('cms:articleForm.contentPlaceholder')}
            required={isRequired}
            uploadFileOptions={{ uploadFile: uploadEditorImage(locale) }}
          />
        </Suspense>
      </Stack>
    </CardFormBlock>
  );
};

export default ArticleFormContentSection;
