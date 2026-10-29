import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { goToResetPasswordConfirmCode, sendResetPasswordVerificationCode } from '@/redux/actions/auth.action';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/user.reducer';
import { EmailInput } from '@/types/auth.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { emailSchema } from '@/validations/auth.validation';

import AuthLink from '../../containers/auth/AuthLink';
import PublicFormPageLayout from '../../containers/auth/PublicFormPageLayout';

const SendEmailResetPassword = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);
  const navigate = useNavigate();

  const form = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<EmailInput> = async ({
    email,
  }) => {
    await dispatch(sendResetPasswordVerificationCode(email));
    navigate(goToResetPasswordConfirmCode());
  };

  return (
    <PublicFormPageLayout
      description={t('user:sendEmailLinkToYou')}
      title={t('user:resetPassword')}
    >
      <Form
        buttonClassName="textCapitalize bR10"
        error={appError}
        form={form}
        isDisabled={false}
        loading={loading}
        primaryButtonText={t('user:sendCode')}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <TextField
          fullWidth
          required
          name="email"
          placeholder={t('user:email')}
          type="email"
        />
      </Form>

      <div className="flexRow spaceBetween">
        <AuthLink align="left" text={t('user:login')} url={PATH_NAMES.login} />
        <AuthLink align="right" text={t('user:codeAlreadySent')} url={goToResetPasswordConfirmCode().to} />
      </div>
    </PublicFormPageLayout>
  );
};

export default SendEmailResetPassword;
