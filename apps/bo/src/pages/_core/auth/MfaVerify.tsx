import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import AuthCardLayout from '@/containers/_core/auth/AuthCardLayout';
import MfaVerifyForm from '@/containers/_core/auth/MfaVerifyForm';
import PublicFormPageLayout from '@/containers/_core/auth/PublicFormPageLayout';
import { verifyMfaLogin } from '@/redux/actions/_core/auth.action';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { IMfaCodeInput } from '@/types/_core/auth.type';

const MfaVerify = () => {
  const {
    t,
  } = useTranslation(['common', 'user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);

  const handleSubmit = (values: IMfaCodeInput) => {
    dispatch(verifyMfaLogin(values.code, navigate));
  };

  return (
    <AuthCardLayout>
      <PublicFormPageLayout
        description={t('user:mfa.verifyDescription')}
        metaDescription={t('user:mfa.verifyDescription')}
        metaTitle={t('user:mfa.verifyTitle')}
        title={t('user:mfa.verifyTitle')}
      >
        <MfaVerifyForm
          autoSubmit
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </PublicFormPageLayout>
    </AuthCardLayout>
  );
};

export default MfaVerify;
