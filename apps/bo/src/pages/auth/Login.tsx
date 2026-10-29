import { Stack } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Head from '@/components/Head';
import LoginForm from '@/containers/auth/LoginForm';
import { goToSendEmailResetPassword } from '@/redux/actions/auth.action';
import { APP_NAME } from '@/utils/constants';
import { PATH_NAMES } from '@/utils/pathnames';

import AuthLink from '../../containers/auth/AuthLink';
import AuthPageLayout from '../../containers/auth/AuthPageLayout';

const Login = () => {
  const {
    t,
  } = useTranslation();

  const navigate = useNavigate();

  const handleForgottenPassword = () => {
    navigate(goToSendEmailResetPassword());
  };

  return (
    <AuthPageLayout
      description={t('user:accessToBO', { app: APP_NAME })}
      formTitle={t('user:loginToApp', { app: APP_NAME })}
      title={t('user:welcomeToTheApp', { app: APP_NAME })}
    >
      <Head title={t('user:login')} />
      <Stack spacing={2}>
        <LoginForm />
        <Stack spacing={2}>
          <AuthLink label={t('user:haveNoAccountYet')} text={t('user:signUp')} url={PATH_NAMES.signUp} />
          <AuthLink
            label={t('user:forgottenPassword')}
            text={t('user:resetPassword')}
            onClick={handleForgottenPassword}
          />
        </Stack>
      </Stack>
    </AuthPageLayout>
  );
};

export default Login;
