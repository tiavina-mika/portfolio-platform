import { zodResolver } from '@hookform/resolvers/zod';
import { AdminAccountDeletionReasonEnum } from '@shared/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { DeleteUserInput } from '@/types/_core/user.type';
import { deleteUserFormSchema } from '@/validations/_core/user.validations';

type Props = {
  formId: string;
  onSubmit: (input: DeleteUserInput) => void;
};

/**
 * Why the team deletes one account, or a whole selection: the reason the recycle bin and the
 * account's history show next to the deletion date. "Other" is only accepted once it is written out.
 */
const DeleteUserForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<DeleteUserInput>({
    resolver: zodResolver(deleteUserFormSchema),
  });

  const isOtherReason = form.watch('reason') === AdminAccountDeletionReasonEnum.OTHER;

  const reasonOptions: ISelectOption[] = Object.values(AdminAccountDeletionReasonEnum).map((reason) => ({
    label: t(`user:deletion.reasons.${reason}`),
    value: reason,
  }));

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <SelectField
        required
        label={t('user:deletionReason')}
        name="reason"
        options={reasonOptions}
      />
      <TextField
        multiline
        label={t('user:deletion.details')}
        name="reasonDetails"
        required={isOtherReason}
        rows={3}
        type="text"
      />
    </Form>
  );
};

export default DeleteUserForm;
