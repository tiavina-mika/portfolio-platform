import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import DropzoneField from '@/components/form/dropzone/DropzoneField';
import Form from '@/components/form/Form';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';
import { APP_MAIN_IMAGES_FORM_ID } from '@/constants/_core/settings.constants';
import { SETTINGS_IMAGES_GAP, SETTINGS_IMAGES_MIN_COLUMN_WIDTH } from '@/constants/_core/ui/entity.constants';
import { createOrUpdateApp } from '@/redux/actions/_core/app.action';
import { getAppAppSelector } from '@/redux/reducers/_core/app.reducer';
import { IAppMainImagesInput } from '@/types/_core/app.type';
import { getAppMainImagesEditionInitialValues } from '@/utils/_core/app.utils';
import { appMainImagesSchema } from '@/validations/_core/app.validations';

import SettingsPanel from '../SettingsPanel';
import SettingsRow from '../SettingsRow';

const classes = {
  /*
   * the two images are one setting stated twice — the same picture for each mode — so they stand
   * side by side rather than stacked, and fold to one column as soon as a drop zone would be
   * narrower than the thumbnail it has to show
   */
  images: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${SETTINGS_IMAGES_MIN_COLUMN_WIDTH}px, 1fr))`,
    gap: SETTINGS_IMAGES_GAP,
  },
};

type Props = {
  // reported up so the page head can say whether the open section still has changes to save
  onDirtyChange?: (isDirty: boolean) => void;
};

/**
 * The pictures the public website leads its home page with, one per display mode. The form has no
 * button of its own — the settings page head owns the save action for whichever website section is
 * open, and reaches this form through {@link APP_MAIN_IMAGES_FORM_ID}.
 */
const AppMainImagesForm = ({
  onDirtyChange,
}: Props) => {
  const app = useSelector(getAppAppSelector);

  const dispatch = useDispatch();

  const form = useForm<IAppMainImagesInput>({ resolver: zodResolver(appMainImagesSchema) });

  const {
    reset, formState: {
      isDirty,
    },
  } = form;

  useEffect(() => {
    if (!app) return;
    const init = async () => {
      const values = await getAppMainImagesEditionInitialValues(app);

      reset(values);
    };

    init();
  }, [app, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = (values: IAppMainImagesInput) => {
    dispatch(createOrUpdateApp(values));
  };

  return (
    <Form
      form={form}
      formId={APP_MAIN_IMAGES_FORM_ID}
      isDisabled={false}
      onSubmit={handleSubmit}
    >
      <SettingsPanel>
        <SettingsRow alignTop description={t('app.imagesDescription')} label={t('images')}>
          <div css={classes.images}>
            <DropzoneField
              required
              accept={ACCEPTED_IMAGE_TYPES}
              inputLabel={t('common:addImage')}
              label={t('app.imageForLightMode')}
              maxFiles={1}
              maxSize={MAX_IMAGE_SIZE_BYTES}
              name="image"
            />
            <DropzoneField
              accept={ACCEPTED_IMAGE_TYPES}
              inputLabel={t('common:addImage')}
              label={t('app.imageForDarkMode')}
              maxFiles={1}
              maxSize={MAX_IMAGE_SIZE_BYTES}
              name="imageForDarkMode"
            />
          </div>
        </SettingsRow>
      </SettingsPanel>
    </Form>
  );
};

export default AppMainImagesForm;
