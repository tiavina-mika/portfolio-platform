import { Alert, Stack } from '@mui/material';
import { useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Head from '@/components/Head';
import AuthPageLayout from '@/containers/_core/auth/AuthPageLayout';
import LoginForm from '@/containers/_core/auth/LoginForm';
import { useWorkspaceName } from '@/hooks/_core/useWorkspaceName';

const Login = () => {
  const {
    t,
  } = useTranslation();

  const { invitation } = useSearch({ strict: false });
  const appName = useWorkspaceName();

  return (
    <AuthPageLayout
      description={t('user:accessToBO', { app: appName })}
      formTitle={t('user:loginToApp', { app: appName })}
      title={t('user:welcomeToTheApp', { app: appName })}
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
