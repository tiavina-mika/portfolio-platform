import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';
import { IPage } from '@/types/_core/page.type';

type Props = {
  page?: IPage | null;
};

/**
 * The pictures the page carries: the banner the site heads it with, and the gallery under its
 * content. Neither is translated — the same files are used whichever language the page is read in.
 */
const PageFormImagesSection = ({ page }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  return (
    <CardFormBlock title={t('common:images')}>
      <Stack spacing={2}>
        <DropzoneField
          accept={ACCEPTED_IMAGE_TYPES}
          helperText={t('common:infoMessages.bannerImageHelper')}
          inputLabel={t('cms:addBannerImage')}
          label={t('cms:bannerImage')}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          name="bannerImage"
          shouldReset={!!page} // can reset input in edition
        />
        <DropzoneField
          multiple
          accept={ACCEPTED_IMAGE_TYPES}
          inputLabel={t('common:images')}
          label={t('common:images')}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          name="images"
          shouldReset={!!page} // can reset input in edition
        />
      </Stack>
    </CardFormBlock>
  );
};

export default PageFormImagesSection;
