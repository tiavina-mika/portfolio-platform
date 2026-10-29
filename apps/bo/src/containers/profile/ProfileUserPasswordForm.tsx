import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PasswordField from '@/components/form/fields/PasswordField';
import Form from '@/components/form/Form';
import { IChangePasswordInput } from '@/types/auth.type';
import { changePasswordSchema } from '@/validations/auth.validation';

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

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<IChangePasswordInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      formId={formId}
      onSubmit={handleSubmit(onSubmitHandler)}
      primaryButtonText={t('user:login')}
    >
      <PasswordField
        fullWidth
        required
        label={t('user:currentPassword')}
        name="currentPassword"
        variant="standard"
      />
      <PasswordField
        fullWidth
        required
        label={t('user:newPassword')}
        name="newPassword"
        variant="standard"
      />
      <PasswordField
        fullWidth
        required
        label={t('user:confirmNewPassword')}
        name="newPasswordConfirmation"
        variant="standard"
      />
    </Form>
  );
};

export default ProfileUserPasswordForm;
