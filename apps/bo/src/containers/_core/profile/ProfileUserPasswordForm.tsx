import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PasswordField from '@/components/form/fields/PasswordField';
import Form from '@/components/form/Form';
import { IChangePasswordInput } from '@/types/_core/auth.type';
import { changePasswordSchema } from '@/validations/_core/auth.validations';

type Props = {
  formId: string;
  onSubmit: (values: IChangePasswordInput) => void;
};

const ProfileUserPasswordForm = ({
  formId, onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const form = useForm<IChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  return (
    <Form form={form} formId={formId} onSubmit={onSubmit}>
      <PasswordField
        fullWidth
        required
        label={t('user:currentPassword')}
        name="currentPassword"
      />
      <PasswordField
        fullWidth
        required
        label={t('user:newPassword')}
        name="newPassword"
      />
      <PasswordField
        fullWidth
        required
        label={t('user:confirmNewPassword')}
        name="newPasswordConfirmation"
      />
    </Form>
  );
};

export default ProfileUserPasswordForm;
