import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { AccountHelpReasonInput } from '@/types/_core/user.type';
import { accountHelpReasonFormSchema } from '@/validations/_core/user.validations';

type Props = {
  formId: string;
  onSubmit: (input: AccountHelpReasonInput) => void;
};

/**
 * Asks why support is acting on someone else's account — sending a code to the member, starting
 * their password reset. The reason is mandatory server-side and is what the member's history
 * records, so this is the only place it can be given.
 */
const AccountHelpReasonForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<AccountHelpReasonInput>({
    resolver: zodResolver(accountHelpReasonFormSchema),
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
        helperText={t('user:detail.accountHelp.reasonHelper')}
        label={t('user:detail.accountHelp.reason')}
        name="reason"
        placeholder={t('user:detail.accountHelp.reasonPlaceholder')}
        rows={3}
        type="text"
      />
    </Form>
  );
};

export default AccountHelpReasonForm;
