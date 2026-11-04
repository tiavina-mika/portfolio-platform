import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ImpersonateUserInput } from '@/types/_core/impersonation.type';
import { impersonateUserFormSchema } from '@/validations/_core/impersonation.validations';

type Props = {
  formId: string;
  onSubmit: (input: ImpersonateUserInput) => void;
};

/**
 * Asks why a support session is being opened on someone else's account. The reason is mandatory
 * server-side and is what the audit trail records — this is the only place it can be given.
 */
const ImpersonateUserForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<ImpersonateUserInput>({
    resolver: zodResolver(impersonateUserFormSchema),
    defaultValues: { reason: '' },
  });

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <TextField
        multiline
        required
        helperText={t('user:impersonation.reasonHelper')}
        label={t('user:impersonation.reason')}
        name="reason"
        rows={3}
        type="text"
      />
    </Form>
  );
};

export default ImpersonateUserForm;
