import { Alert, Stack } from '@mui/material';
import { useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Head from '@/components/Head';
import { APP_NAME } from '@/constants/_core/app.constants';
import AuthPageLayout from '@/containers/_core/auth/AuthPageLayout';
import LoginForm from '@/containers/_core/auth/LoginForm';


const Login = () => {
  const {
    t,
  } = useTranslation();

  const { invitation } = useSearch({ strict: false });

  return (
    <AuthPageLayout
      description={t('user:accessToBO', { app: APP_NAME })}
      formTitle={t('user:loginToApp', { app: APP_NAME })}
      title={t('user:welcomeToTheApp', { app: APP_NAME })}
    >
      <Head title={t('user:login')} />
      <Stack spacing={2}>
        {invitation === 'invalid' && (
          <Alert severity="warning">{t('user:invitation.invalidLink')}</Alert>
        )}
        <LoginForm />
      </Stack>
    </AuthPageLayout>
  );
};

export default Login;
