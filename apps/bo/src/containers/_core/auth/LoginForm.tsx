import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PasswordField from '@/components/form/fields/PasswordField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { goToSendEmailResetPassword, login } from '@/redux/actions/_core/auth.action';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ILoginInput } from '@/types/_core/auth.type';
import { loginSchema } from '@/validations/_core/auth.validations';

const LoginForm = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);

  const form = useForm<ILoginInput>({ resolver: zodResolver(loginSchema) });

  const handleSubmit = (values: ILoginInput) => {
    dispatch(login(values, navigate));
  };

  const handleForgottenPassword = () => {
    navigate(goToSendEmailResetPassword());
  };

  return (
    <Form
      error={error}
      form={form}
      isDisabled={false}
      loading={loading}
      onSubmit={handleSubmit}
      primaryButtonText={t('user:login')}
    >
      <TextField
        fixedLabel
        fullWidth
        label={t('user:email')}
        name="email"
        placeholder={t('user:enterYourEmail')}
        type="email"
      />
      <PasswordField
        fixedLabel
        fullWidth
        label={t('user:password')}
        name="password"
        placeholder={t('user:yourPassword')}
        labelEnd={(
          <Link
            component="button"
            onClick={handleForgottenPassword}
            type="button"
            variant="body2"
          >
            {t('user:forgottenPassword')}
          </Link>
        )}
      />
    </Form>
  );
};

export default LoginForm;
