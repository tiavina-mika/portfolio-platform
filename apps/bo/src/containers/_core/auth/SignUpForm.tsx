import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import PasswordChecklistField from '@/components/form/fields/PasswordChecklistField';
import PasswordField from '@/components/form/fields/PasswordField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ISignUpFormInput, ISignUpInput } from '@/types/_core/auth.type';
import { signUpSchema } from '@/validations/_core/auth.validations';

type Props = {
  onSubmit: (values: ISignUpInput) => void;
  from?: 'signUp' | 'invitation'; // invitation from someone
  email?: string;
  formId?: string;
};
const SignUpForm = ({
  onSubmit, formId, from = 'signUp', email,
}: Props) => {
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);
  const {
    t,
  } = useTranslation(['user']);

  const button = from === 'signUp'
    ? t('user:createAnAccount')
    : t('user:invitation.createAccount');

  const form = useForm<ISignUpFormInput, any, ISignUpInput>({
    mode: 'onBlur',
    resolver: zodResolver(signUpSchema),
    defaultValues: { email },
  });

  const handleSubmit = (values: ISignUpInput) => {
    onSubmit(values);
  };

  return (
    <Form
      error={error}
      form={form}
      formId={formId}
      isDisabled={false}
      loading={loading}
      onSubmit={handleSubmit}
      primaryButtonText={button}
    >
      <TextField
        fullWidth
        disabled={from === 'invitation'}
        name="email"
        placeholder={t('user:email')}
        type="email"
      />
      <TextField fullWidth name="firstName" placeholder={t('user:firstName')} />
      <TextField fullWidth name="lastName" placeholder={t('user:lastName')} />
      <PasswordChecklistField fullWidth name="password" placeholder={t('user:password')} />
      <PasswordField
        fullWidth
        name="passwordConfirmation"
        placeholder={t('user:passwordConfirmation')}
      />
    </Form>
  );
};

export default SignUpForm;
