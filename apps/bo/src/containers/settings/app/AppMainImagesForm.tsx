import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import Form from '@/components/form/Form';
import { createOrUpdateApp } from '@/redux/actions/app.action';
import { getAppAppSelector } from '@/redux/reducers/app.reducer';
import { IAppMainImagesInput } from '@/types/app.type';
import { getAppMainImagesEditionInitialValues } from '@/utils/app.utils';
import { appMainImagesSchema } from '@/validations/app.validations';

const AppMainImagesForm = () => {
  const app = useSelector(getAppAppSelector);

  const dispatch = useDispatch();

  const form = useForm<IAppMainImagesInput>({ resolver: zodResolver(appMainImagesSchema) });

  const {
    handleSubmit, reset,
  } = form;

  useEffect(() => {
    if (!app) return;
    const init = async () => {
      const values = await getAppMainImagesEditionInitialValues(app);

      reset(values);
    };

    init();
  }, [app, reset]);

  const onFormSubmit: SubmitHandler<IAppMainImagesInput> = (values) => {
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
      <CardFormBlock description={t('app.imagesDescription')} title={t('images')}>
        <DropzoneField
          required
          inputLabel={t('common:addImage')}
          label={t('app.imageForLightMode')}
          name="image"
        />
        <DropzoneField
          inputLabel={t('common:addImage')}
          label={t('app.imageForDarkMode')}
          name="imageForDarkMode"
        />
      </CardFormBlock>
    </Form>
  );
};

export default AppMainImagesForm;
