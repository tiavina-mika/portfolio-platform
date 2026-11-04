import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PasswordChecklistField from '@/components/form/fields/PasswordChecklistField';
import PasswordField from '@/components/form/fields/PasswordField';
import Form from '@/components/form/Form';
import AccountSuccessMessage from '@/containers/_core/auth/AccountSuccessMessage';
import AuthLink from '@/containers/_core/auth/AuthLink';
import PublicFormPageLayout from '@/containers/_core/auth/PublicFormPageLayout';
import ResetPasswordSteps from '@/containers/_core/auth/ResetPasswordSteps';
import { resetPassword } from '@/redux/actions/_core/auth.action';
import { getAppAlertSelector, getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { resetPasswordRoute } from '@/routes/public/account.routes';
import { ResetPasswordInput } from '@/types/_core/auth.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { resetPasswordSchema } from '@/validations/_core/auth.validations';


const ResetPassword = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);
  const alert = useSelector(getAppAlertSelector);
  const params = resetPasswordRoute.useParams();

  const form = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const handleSubmit = (values: ResetPasswordInput) => {
    dispatch(resetPassword(params.resetToken, values.newPassword));
  };

  return (
    <PublicFormPageLayout header={<ResetPasswordSteps currentIndex={2} />} title={t('user:resetPassword')}>
      {alert?.severity === 'success'
        ? <AccountSuccessMessage />
        : (
          <>
            <Form
              error={appError}
              form={form}
              isDisabled={false}
              loading={loading}
              onSubmit={handleSubmit}
              primaryButtonText={t('common:confirm')}
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
