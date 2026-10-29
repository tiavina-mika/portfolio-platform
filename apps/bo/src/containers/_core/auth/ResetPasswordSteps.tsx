import { useTranslation } from 'react-i18next';

import AuthSteps from '@/containers/_core/auth/AuthSteps';

type Props = {
  // 0 = email, 1 = code, 2 = new password
  currentIndex: 0 | 1 | 2;
};

const ResetPasswordSteps = ({ currentIndex }: Props) => {
  const {
    t,
  } = useTranslation(['user']);

  return (
    <AuthSteps
      currentIndex={currentIndex}
      labels={[t('user:email'), t('user:resetPasswordCodeStep'), t('user:password')]}
    />
  );
};

export default ResetPasswordSteps;
