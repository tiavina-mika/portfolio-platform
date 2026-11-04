import { Stack } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextEditorFieldSkeleton from '@/components/form/fields/TextEditorFieldSkeleton';
import TextField from '@/components/form/fields/TextField';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { useSlugAutoSync } from '@/hooks/_core/useSlugAutoSync';
import { useUploadEditorImage } from '@/hooks/_core/useUploadEditorImage';
import { loadProjectEditorTempFilesSlice } from '@/redux/reducers/_domain/project.reducer';
import { Locale } from '@/types/_core/setting.type';

const TextEditorField = lazy(() => import('@/components/form/fields/TextEditorField'));

type Props = {
  /** the language tab currently open, the section only ever shows one locale's fields */
  locale: Locale;
};

/**
 * What the project says: its name (which the slug follows until it is edited by hand), the title
 * and the sentence under it, the body written in the rich text editor and the presentation of the
 * society it was made for. Name, title, description and content are required in French.
 */
const ProjectFormContentSection = ({ locale }: Props) => {
  const { t } = useTranslation(['common', 'cms', 'project']);

  // upload image to cloud (API) when uploading an image in the editor
  const { uploadEditorImage } = useUploadEditorImage({
    folder: 'projects/editor',
    action: loadProjectEditorTempFilesSlice,
  });

  const handleNameChange = useSlugAutoSync(locale);
  const isRequired = locale === DEFAULT_LOCALE;

  return (
    <CardFormBlock title={t('cms:content')}>
      <Stack spacing={2}>
        <TextField
          fixedLabel
          fullWidth
          label={t('common:name')}
          name={locale + ':name'}
          onFieldChange={handleNameChange}
          required={isRequired}
          type="text"
          variant="outlined"
        />
        <TextField
          fixedLabel
          fullWidth
          label={t('cms:title')}
          name={locale + ':title'}
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
          required={isRequired}
          rows={3}
          variant="outlined"
        />
        <Suspense fallback={<TextEditorFieldSkeleton />}>
          <TextEditorField
            id={locale + 'content'}
            label={t('cms:content')}
            name={locale + ':content'}
            required={isRequired}
            uploadFileOptions={{ uploadFile: uploadEditorImage(locale) }}
          />
          <TextEditorField
            fullWidth
            id={locale + 'societyDescription'}
            label={t('project:project.societyDescription')}
            name={locale + ':societyDescription'}
            toolbar={['bold', 'italic', 'underline']}
          />
        </Suspense>
      </Stack>
    </CardFormBlock>
  );
};

export default ProjectFormContentSection;
