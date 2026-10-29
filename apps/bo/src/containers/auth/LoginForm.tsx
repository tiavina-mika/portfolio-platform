import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PasswordField from '@/components/form/fields/PasswordField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { login } from '@/redux/actions/auth.action';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/user.reducer';
import { ILoginInput } from '@/types/auth.type';
import { loginSchema } from '@/validations/auth.validation';

const LoginForm = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);

  const form = useForm<ILoginInput>({ resolver: zodResolver(loginSchema) });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<ILoginInput> = (values) => {
    dispatch(login(values, navigate));
  };

  return (
    <Form
      buttonClassName="textCapitalize bR10"
      error={error}
      form={form}
      isDisabled={false}
      loading={loading}
      onSubmit={handleSubmit(onSubmitHandler)}
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
      />
    </Form>
  );
};

export default LoginForm;
