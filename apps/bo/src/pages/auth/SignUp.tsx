import { Stack } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';


import Head from '@/components/Head';
import SignUpForm from '@/containers/auth/SignUpForm';
import { signUp } from '@/redux/actions/auth.action';
import { ISignUpInput } from '@/types/auth.type';
import { APP_NAME } from '@/utils/constants';
import { PATH_NAMES } from '@/utils/pathnames';

import AuthLink from '../../containers/auth/AuthLink';
import AuthPageLayout from '../../containers/auth/AuthPageLayout';


const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    t,
  } = useTranslation(['user']);
  const title = t('user:signUp');

  const handleSubmitAccount = (values: ISignUpInput) => {
    dispatch(signUp(values, navigate));
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
        <SignUpForm onSubmit={handleSubmitAccount} />
        <AuthLink label={t('user:alreadyHaveAccount')} text={t('user:login')} url={PATH_NAMES.login} />
      </Stack>
    </AuthPageLayout>
  );
};

export default SignUp;
