import { zodResolver } from '@hookform/resolvers/zod';
import { IconButton, Tooltip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdOutlineSavedSearch } from 'react-icons/md';
import { ZodType } from 'zod';

import type { FieldValues, SubmitHandler } from 'react-hook-form';

import Dialog from '@/components/Dialog';
import Form from '@/components/form/Form';
import AdvancedSearchFields, { AdvancedSearchFieldsProps } from '@/components/search/AdvancedSearchFields';
import { useToggle } from '@/hooks/useToggle';


const FILTER_FORM_ID = 'form-filter';

type Props<T> = {
  onSubmit: (values: T) => void;
  schema: ZodType<any, any, any>;
} & AdvancedSearchFieldsProps;

const AdvancedSearchForm = <T extends FieldValues,>({
  onSubmit, schema, fields = [],
}: Props<T>) => {
  const {
    t,
  } = useTranslation();
  const {
    open: isOpenFilterDialog, toggle: toggleOpenFilterDialog,
  } = useToggle();

  const form = useForm<T>({ resolver: zodResolver(schema) });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<T> = async (values) => {
    await onSubmit(values);
    toggleOpenFilterDialog();
    form.reset();
  };

  return (
    <>
      <Tooltip title={t('advancedSearch')}>
        <IconButton onClick={toggleOpenFilterDialog}>
          <MdOutlineSavedSearch />
        </IconButton>
      </Tooltip>
      <Dialog
        fullWidth
        formId={FILTER_FORM_ID}
        maxWidth="sm"
        open={isOpenFilterDialog}
        primaryButtonText={t('search')}
        title={t('advancedSearch')}
        toggle={toggleOpenFilterDialog}
      >
        <Form form={form} formId={FILTER_FORM_ID} onSubmit={handleSubmit(onSubmitHandler)}>
          <AdvancedSearchFields fields={fields} />
        </Form>
      </Dialog>
    </>
  );
};

export default AdvancedSearchForm;
