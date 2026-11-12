import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import DropzoneField from '@/components/form/dropzone/DropzoneField';
import Form from '@/components/form/Form';
import { ACCEPTED_PDF_TYPES, MAX_CV_SIZE_BYTES } from '@/constants/_core/file.constants';
import { APP_CV_FORM_ID } from '@/constants/_core/settings.constants';
import { createOrUpdateApp } from '@/redux/actions/_core/app.action';
import { getAppAppSelector } from '@/redux/reducers/_core/app.reducer';
import { IAppCvInput } from '@/types/_core/app.type';
import { getAppCvEditionInitialValues } from '@/utils/_core/app.utils';
import { appCvSchema } from '@/validations/_core/app.validations';

import SettingsPanel from '../SettingsPanel';
import SettingsRow from '../SettingsRow';

type Props = {
  // reported up so the page head can say whether the open section still has changes to save
  onDirtyChange?: (isDirty: boolean) => void;
};

/**
 * The CV (a PDF) the public website offers for download. The form has no button of its own — the
 * settings page head owns the save action, and reaches this form through {@link APP_CV_FORM_ID}.
 */
const AppCvForm = ({
  onDirtyChange,
}: Props) => {
  const app = useSelector(getAppAppSelector);

  const dispatch = useDispatch();

  const form = useForm<IAppCvInput>({ resolver: zodResolver(appCvSchema) });

  const {
    reset, formState: {
      isDirty,
    },
  } = form;

  useEffect(() => {
    if (!app) return;
    const init = async () => {
      const values = await getAppCvEditionInitialValues(app);

      reset(values);
    };

    init();
  }, [app, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = (values: IAppCvInput) => {
    dispatch(createOrUpdateApp(values));
  };

  return (
    <Form
      form={form}
      formId={APP_CV_FORM_ID}
      isDisabled={false}
      onSubmit={handleSubmit}
    >
      <SettingsPanel>
        <SettingsRow alignTop description={t('app.cvDescription')} label={t('app.cv')}>
          <DropzoneField
            required
            accept={ACCEPTED_PDF_TYPES}
            inputLabel={t('app.uploadCV')}
            maxFiles={1}
            maxSize={MAX_CV_SIZE_BYTES}
            name="cv"
          />
        </SettingsRow>
      </SettingsPanel>
    </Form>
  );
};

export default AppCvForm;
