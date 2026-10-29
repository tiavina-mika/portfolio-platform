import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import CardFormBlock from '@/components/form/CardFormBlock';
import AutocompleteField from '@/components/form/fields/AutocompleteField';
import CheckboxField from '@/components/form/fields/CheckboxField';
import SelectField from '@/components/form/fields/SelectField';
import Form, { IFormProps } from '@/components/form/Form';
import { pageLinkLocationOptions } from '@/constants/cms.constants';
import { getCategoriesOptionsSelector } from '@/redux/reducers/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { IPage, IPageStepThreeInput } from '@/types/page.type';
import { getPageStepThreeEditionInitialValues } from '@/utils/cms.utils';
import { pageStepThreeSchema } from '@/validations/page.validations';

const initialValues = {
  active: true,
  categories: [],
  linkLocations: [],
};

type Props = {
  onSubmit: (values: IPageStepThreeInput) => void;
  page?: IPage | null;
  loading?: boolean;
} & Pick<
  IFormProps,
  'buttonDirection' | 'onSecondaryButtonClick' | 'primaryButtonText' | 'secondaryButtonText'
>;

const PageFormStepThree = ({
  onSubmit, page, loading, ...formProps
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);
  const categories = useSelector(getCategoriesOptionsSelector);

  const form = useForm<IPageStepThreeInput>({
    defaultValues: initialValues,
    resolver: zodResolver(pageStepThreeSchema) as any,
  });

  const {
    handleSubmit, reset,
  } = form;

  // initialize form values
  useEffect(() => {
    if (!page) return;
    const init = async () => {
      const editionInitialValues = await getPageStepThreeEditionInitialValues(page, locale);

      reset(editionInitialValues);
    };

    init();
  }, [page, reset, locale]);

  const onFormSubmit: SubmitHandler<IPageStepThreeInput> = (values) => {
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
      {/* active card */}
      <CardFormBlock
        description={t('cms:activePageVisible')}
        rightHeader={<CheckboxField isSwitch name="active" />}
        title={t('common:active')}
      />
      <CardFormBlock title={t('cms:category.category')}>
        {/* <CategoriesSearchByEntityField
          fullWidth
          isSearch
          entity={CategoryEntityEnum.PAGE}
          label={t('cms:category.category')}
          multiple={false}
          name="category"
        /> */}
        <AutocompleteField
          fullWidth
          multiple
          name="categories"
          options={categories}
        />
      </CardFormBlock>

      <CardFormBlock description={t('cms:linkLocationHelperText')} title={t('cms:linkLocation')}>
        <SelectField
          isClearable
          isMulti
          name="linkLocations"
          options={pageLinkLocationOptions}
          variant="outlined"
        />
      </CardFormBlock>
    </Form>
  );
};

export default PageFormStepThree;
