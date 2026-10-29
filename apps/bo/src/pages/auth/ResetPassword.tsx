import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PasswordChecklistField from '@/components/form/fields/PasswordChecklistField';
import PasswordField from '@/components/form/fields/PasswordField';
import Form from '@/components/form/Form';
import AccountSuccessMessage from '@/containers/auth/AccountSuccessMessage';
import AuthLink from '@/containers/auth/AuthLink';
import { resetPassword } from '@/redux/actions/auth.action';
import { getAppAlertSelector, getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/user.reducer';
import { ResetPasswordInput } from '@/types/auth.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { resetPasswordSchema } from '@/validations/auth.validation';

import PublicFormPageLayout from '../../containers/auth/PublicFormPageLayout';


const ResetPassword = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);
  const alert = useSelector(getAppAlertSelector);

  const form = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<ResetPasswordInput> = (values) => {
    dispatch(resetPassword(values));
  };

  return (
    <PublicFormPageLayout title={t('user:resetPassword')}>
      {alert?.severity === 'success'
        ? <AccountSuccessMessage />
        : (
          <>
            <Form
              buttonClassName="textCapitalize bR10"
              error={appError}
              form={form}
              isDisabled={false}
              loading={loading}
              primaryButtonText={t('common:confirm')}
              onSubmit={handleSubmit(onSubmitHandler)}
            >
              <PasswordChecklistField
                fullWidth
                required
                name="newPassword"
                placeholder={t('user:newPassword')}
              />

              <PasswordField
                fullWidth
                required
                name="newPasswordConfirmation"
                placeholder={t('user:confirmNewPassword')}
              />
            </Form>
            <AuthLink text={t('user:backToLogin')} url={PATH_NAMES.login} />
          </>
        )}
    </PublicFormPageLayout>
  );
};

export default ResetPassword;
