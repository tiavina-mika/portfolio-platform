import { Stack } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import { CMS_GALLERY_MAX_IMAGES } from '@/constants/_core/cms.constants';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';

type Props = {
  /** an existing article is being edited — its pictures can then be removed from the fields */
  isEdition: boolean;
};

/**
 * The pictures the article carries: the main one the site heads it with and shows in the lists,
 * the smaller one used on cards and when its link is shared, and the gallery under its content.
 * None of them is translated — the same files are used whichever language the article is read in.
 */
const ArticleFormImagesSection = ({ isEdition }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext();
  const images = useWatch({ control, name: 'images' }) as unknown[] | undefined;

  // how full the gallery already is, next to its label — it is the one field with a ceiling
  const galleryLabel = images?.length
    ? `${t('common:images')} · ${t('cms:articleForm.filesCount', { count: images.length })}`
    : t('common:images');

  return (
    <CardFormBlock title={t('common:images')}>
      <Stack spacing={2}>
        <DropzoneField
          required
          accept={ACCEPTED_IMAGE_TYPES}
          helperText={t('cms:articleForm.imageHelper')}
          inputLabel={t('common:addImage')}
          label={t('common:image')}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          multiple={false}
          name="image"
          shouldReset={isEdition}
        />
        <DropzoneField
          accept={ACCEPTED_IMAGE_TYPES}
          helperText={t('common:infoMessages.articlePreviewImage')}
          inputLabel={`${t('common:add')} ${t('common:previewImage')}`}
          label={t('common:previewImage')}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          multiple={false}
          name="previewImage"
          shouldReset={isEdition}
        />
        <DropzoneField
          multiple
          accept={ACCEPTED_IMAGE_TYPES}
          helperText={t('cms:articleForm.galleryHelper', { count: CMS_GALLERY_MAX_IMAGES })}
          inputLabel={t('common:images')}
          label={galleryLabel}
          maxFiles={CMS_GALLERY_MAX_IMAGES}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          name="images"
          shouldReset={isEdition}
        />
      </Stack>
    </CardFormBlock>
  );
};

export default ArticleFormImagesSection;
