
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, DialogProps, type Theme } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { ConfirmDeletionInput } from '@/types/_core/app.type';
import { confirmDeletionSchema } from '@/validations/_core/app.validations';


const CONFIRM_DELETION_FORM_ID = 'confirm-deletion-form-id';

type Props = {
  value: string;
  onConfirmed: () => void;
  toggle: () => void;
  label: string;
  type: string;
  open?: boolean;
} & DialogProps;

const ConfirmDeletionFormModal = ({
  value, onConfirmed, label, toggle, type, open = false, ...dialogProps
}: Props) => {
  const [error, setError] = useState<string>('');
  const {
    t,
  } = useTranslation();
  // const { open: IsOpenConfirmDeleteModal, toggle: toggleOpenConfirmDeleteModal } = useToggle();

  const form = useForm<ConfirmDeletionInput>({ resolver: zodResolver(confirmDeletionSchema) });

  const handleSubmit = async (values: ConfirmDeletionInput) => {
    if (values.confirmation.trim() !== value) {
      setError(t('infoMessages.pleaserEnterValue', { value }));
      return;
    }
    await onConfirmed();
    toggle();
  };

  return (
    <Dialog
      fullWidth
      buttonColor="error"
      formId={CONFIRM_DELETION_FORM_ID}
      maxWidth="xs"
      open={open}
      primaryButtonText="delete"
      title={t('delete') + ' ' + label} // ex: Delete this order
      toggle={toggle}
      description={(
        <span css={(theme: Theme) => ({ color: theme.palette.text.primary })}>
          <span>
            {t('infoMessages.sureToDeleteThing')}
            {' '}
            <b>{label}?</b>
          </span>
          <br />
          <br />
          <span>
            {t('infoMessages.enterConfirmAndDelete', { type })} ({value})
          </span>
        </span>
      )}
      {...dialogProps}
    >
      <Box sx={{ mt: 3 }}>
        <Form
          form={form}
          formId={CONFIRM_DELETION_FORM_ID}
          onSubmit={handleSubmit}
        >
          <TextField
            required
            errorMessage={error}
            name="confirmation"
            placeholder={value}
            type="text"
            variant="outlined"
          />
        </Form>
      </Box>
    </Dialog>
  );
};

export default ConfirmDeletionFormModal;
