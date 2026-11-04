import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CodeConfirmationForm from '@/containers/_core/auth/CodeConfirmationForm';
import PublicFormPageLayout from '@/containers/_core/auth/PublicFormPageLayout';
import ResetPasswordSteps from '@/containers/_core/auth/ResetPasswordSteps';
import { goToSendEmailResetPassword, verifyCodeSentByEmail } from '@/redux/actions/_core/auth.action';

const ConfirmResetPasswordCodeSentByEmail = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCodeInputChange = (code: string) => {
    dispatch(verifyCodeSentByEmail(code, navigate));
  };

  const handleResendCode = () => {
    navigate(goToSendEmailResetPassword() as any);
  };

  return (
    <PublicFormPageLayout
      description={t('user:enterResetPasswordCode')}
      header={<ResetPasswordSteps currentIndex={1} />}
      metaTitle={t('user:enterResetPasswordCode')}
      title={t('user:resetPassword')}
    >
      <CodeConfirmationForm onCodeChange={handleCodeInputChange} onResendCode={handleResendCode} />
    </PublicFormPageLayout>
  );
};

export default ConfirmResetPasswordCodeSentByEmail;
