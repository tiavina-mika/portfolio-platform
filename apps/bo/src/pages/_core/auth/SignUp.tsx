import { Stack } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';


import Head from '@/components/Head';
import { APP_NAME } from '@/constants/_core/app.constants';
import AuthLink from '@/containers/_core/auth/AuthLink';
import AuthPageLayout from '@/containers/_core/auth/AuthPageLayout';
import SignUpForm from '@/containers/_core/auth/SignUpForm';
import { signUp } from '@/redux/actions/_core/auth.action';
import { inviteRoute } from '@/routes/public/auth.routes';
import { ISignUpInput } from '@/types/_core/auth.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';


const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = inviteRoute.useSearch();
  const { invitationEmail } = inviteRoute.useRouteContext();
  const {
    t,
  } = useTranslation(['user']);
  const title = t('user:invitation.createAccount');

  const handleSubmitAccount = (values: ISignUpInput) => {
    dispatch(signUp({ ...values, invitationToken: token }, navigate));
  };

  return (
    <AuthPageLayout
      description={t('user:accessToBO', { app: APP_NAME })}
      formDescription={t('user:anAdminAcceptsYourAccount')}
      formTitle={t('user:createAnAdminAccount')}
      title={t('user:welcomeToTheApp', { app: APP_NAME })}
    >
      <Head title={title} />
      <Stack spacing={2}>
        <SignUpForm email={invitationEmail} from="invitation" onSubmit={handleSubmitAccount} />
        <AuthLink label={t('user:alreadyHaveAccount')} text={t('user:login')} url={PATH_NAMES.login} />
      </Stack>
    </AuthPageLayout>
  );
};

export default SignUp;
