import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import AccountSuccessMessage from '@/containers/_core/auth/AccountSuccessMessage';
import CodeConfirmationForm from '@/containers/_core/auth/CodeConfirmationForm';
import PublicFormPageLayout from '@/containers/_core/auth/PublicFormPageLayout';
import { sendEmailVerificationCode, verifyAccountEmail } from '@/redux/actions/_core/auth.action';
import { getAppAccountEmailSelector, getAppAlertSelector } from '@/redux/reducers/_core/app.reducer';


const ConfirmAccount = () => {
  const {
    t,
  } = useTranslation(['common', 'user']);

  const alert = useSelector(getAppAlertSelector);
  const accountEmail = useSelector(getAppAccountEmailSelector);
  const dispatch = useDispatch();

  const handleCodeInputChange = (code: string) => {
    dispatch(verifyAccountEmail(code));
  };

  const handleResendCode = () => {
    dispatch(sendEmailVerificationCode(accountEmail));
  };

  return (
    <PublicFormPageLayout
      description={t('user:emailWithCodeSentConfirmCodeBelow')}
      metaDescription={t('user:emailWithCodeSentConfirmCodeBelow')}
      metaTitle={t('user:accountConfirmation')}
      title={t('user:accountConfirmation')}
    >
      {alert?.type === 'accountVerification' && alert.severity === 'success'
        ? <AccountSuccessMessage />
        : <CodeConfirmationForm onCodeChange={handleCodeInputChange} onResendCode={handleResendCode} />}
    </PublicFormPageLayout>
  );
};

export default ConfirmAccount;
