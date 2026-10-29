import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import AccountSuccessMessage from '@/containers/auth/AccountSuccessMessage';
import CodeConfirmationForm from '@/containers/auth/CodeConfirmationForm';
import { verifyAccountEmail } from '@/redux/actions/auth.action';
import { getAppAlertSelector } from '@/redux/reducers/app.reducer';

import PublicFormPageLayout from '../../containers/auth/PublicFormPageLayout';

const ConfirmAccount = () => {
  const {
    t,
  } = useTranslation(['common', 'user']);

  const alert = useSelector(getAppAlertSelector);
  const dispatch = useDispatch();

  const handleCodeInputChange = (code: string) => {
    dispatch(verifyAccountEmail(code));
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
        : <CodeConfirmationForm onCodeChange={handleCodeInputChange} />}
    </PublicFormPageLayout>
  );
};

export default ConfirmAccount;
