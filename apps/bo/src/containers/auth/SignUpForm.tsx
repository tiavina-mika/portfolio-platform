import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import PasswordChecklistField from '@/components/form/fields/PasswordChecklistField';
import PasswordField from '@/components/form/fields/PasswordField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/user.reducer';
import { ISignUpInput } from '@/types/auth.type';
import { signUpSchema } from '@/validations/auth.validation';

type Props = {
  onSubmit: (values: ISignUpInput) => void;
  from?: 'signUp' | 'invitation'; // invitation from someone
  formId?: string;
};
const SignUpForm = ({
  onSubmit, formId, from = 'signUp',
}: Props) => {
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);
  const {
    t,
  } = useTranslation(['user']);

  const button = from === 'signUp'
    ? t('user:createAnAccount')
    : '';

  const form = useForm<ISignUpInput>({ resolver: zodResolver(signUpSchema) as any });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<ISignUpInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      buttonClassName="textCapitalize bR10"
      error={error}
      form={form}
      formId={formId}
      isDisabled={false}
      loading={loading}
      primaryButtonText={button}
      onSubmit={handleSubmit(onSubmitHandler as any)}
    >
      <TextField
        fullWidth
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
        placeholder="Confirm password"
      />
    </Form>
  );
};

export default SignUpForm;
