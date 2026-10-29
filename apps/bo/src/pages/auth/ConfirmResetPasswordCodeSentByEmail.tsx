import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';


import Head from '@/components/Head';
import CodeConfirmationForm from '@/containers/auth/CodeConfirmationForm';
import { goToSendEmailResetPassword, verifyCodeSentByEmail } from '@/redux/actions/auth.action';


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
    navigate(goToSendEmailResetPassword());
  };

  return (
    <>
      <Head title={t('user:enterResetPasswordCode')} />
      <CodeConfirmationForm onCodeChange={handleCodeInputChange} onResendCode={handleResendCode} />
    </>
  );
};

export default ConfirmResetPasswordCodeSentByEmail;
