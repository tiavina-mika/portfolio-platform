import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';


import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import Form, { IFormProps } from '@/components/form/Form';
import { IPage, IPageStepTwoInput } from '@/types/page.type';
import { getPageStepTwoEditionInitialValues } from '@/utils/cms.utils';
import { pageStepTwoSchema } from '@/validations/page.validations';

type Props = {
  onSubmit: (values: IPageStepTwoInput) => void;
  page?: IPage | null;
  loading?: boolean;
} & Pick<IFormProps,
'buttonDirection' |
'onSecondaryButtonClick' |
'primaryButtonText' |
'secondaryButtonText'
>;

const PageFormStepTwo = ({
  onSubmit, page, loading, ...formProps
}: Props) => {
  const form = useForm<IPageStepTwoInput>({ resolver: zodResolver(pageStepTwoSchema) });

  const {
    handleSubmit, reset,
  } = form;

  // initialize form values
  useEffect(() => {
    if (!page) return;
    const init = async () => {
      const editionInitialValues = await getPageStepTwoEditionInitialValues(page);

      reset(editionInitialValues);
    };

    init();
  }, [page, reset]);

  const onFormSubmit: SubmitHandler<IPageStepTwoInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      isDisabled={false}
      loading={loading}
      onSubmit={handleSubmit(onFormSubmit)}
      {...formProps}
    >
      <CardFormBlock title={t('images')}>
        <Stack spacing={2}>
          {/* non translated fields */}
          <DropzoneField
            helperText={t('common:infoMessages.bannerImageHelper')}
            inputLabel={t('cms:addBannerImage')}
            label={t('cms:bannerImage')}
            name="bannerImage"
            shouldReset={!!page} // can reset input in edition
          />
          <DropzoneField
            helperText={t('common:infoMessages.previewImageHelper')}
            inputLabel={`${t('common:add')} ${t('common:previewImage')}`}
            label={t('common:previewImage')}
            name="previewImage"
            shouldReset={!!page} // can reset input in edition
          />
          {/* multiple image upload */}
          <DropzoneField
            multiple
            inputLabel={t('images')}
            label={t('common:images')}
            name="images"
            shouldReset={!!page} // can reset input in edition
          />
        </Stack>
      </CardFormBlock>
    </Form>
  );
};

export default PageFormStepTwo;
