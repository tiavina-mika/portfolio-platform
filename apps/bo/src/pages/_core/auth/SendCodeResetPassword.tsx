import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import AuthLink from '@/containers/_core/auth/AuthLink';
import PublicFormPageLayout from '@/containers/_core/auth/PublicFormPageLayout';
import ResetPasswordSteps from '@/containers/_core/auth/ResetPasswordSteps';
import { goToResetPasswordConfirmCode, sendResetPasswordVerificationCode } from '@/redux/actions/_core/auth.action';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { EmailInput } from '@/types/_core/auth.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { emailSchema } from '@/validations/_core/auth.validations';


const SendCodeResetPassword = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);
  const navigate = useNavigate();

  const form = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });

  const handleSubmit = async ({
    email,
  }: EmailInput) => {
    await dispatch(sendResetPasswordVerificationCode(email));
    navigate(goToResetPasswordConfirmCode() as any);
  };

  return (
    <PublicFormPageLayout
      description={t('user:sendEmailLinkToYou')}
      header={<ResetPasswordSteps currentIndex={0} />}
      title={t('user:resetPassword')}
    >
      <Form
        error={appError}
        form={form}
        isDisabled={false}
        loading={loading}
        onSubmit={handleSubmit}
        primaryButtonText={t('user:sendCode')}
      >
        <TextField
          fullWidth
          required
          name="email"
          placeholder={t('user:email')}
          type="email"
        />
      </Form>

      <div className="flexRow spaceBetween">
        <AuthLink align="left" text={t('user:login')} url={PATH_NAMES.login} />
        <AuthLink align="right" text={t('user:codeAlreadySent')} url={goToResetPasswordConfirmCode().to} />
      </div>
    </PublicFormPageLayout>
  );
};

export default SendCodeResetPassword;
