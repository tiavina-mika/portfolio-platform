import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PasswordField from '@/components/form/fields/PasswordField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { MFA_QR_CODE_SIZE } from '@/constants/_core/auth.constants';
import { confirmMfaEnrollment, enrollMfa } from '@/redux/actions/_core/auth.action';
import { getAppErrorSelector, getAppMfaOtpauthUrlSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { IMfaCodeInput, IMfaPasswordInput } from '@/types/_core/auth.type';
import { mfaCodeSchema, mfaPasswordSchema } from '@/validations/_core/auth.validations';

type Props = {
  /**
   * Used to identify the form when the submit button is outside the form — the enrollment is
   * confirmed from the dialog footer, beside the action that abandons it.
   */
  formId?: string;
};

/**
 * Two steps in one place: the password is asked again before an authenticator app can be attached
 * (a stolen session alone must not be enough), then the QR code and the first code.
 */
const MfaSetupForm = ({ formId }: Props) => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);
  const otpauthUrl = useSelector(getAppMfaOtpauthUrlSelector);

  const passwordForm = useForm<IMfaPasswordInput>({ resolver: zodResolver(mfaPasswordSchema) });
  const codeForm = useForm<IMfaCodeInput>({ resolver: zodResolver(mfaCodeSchema) });

  const handlePasswordSubmit = (values: IMfaPasswordInput) => {
    dispatch(enrollMfa(values.password));
  };

  const handleCodeSubmit = (values: IMfaCodeInput) => {
    dispatch(confirmMfaEnrollment(values.code));
  };

  if (!otpauthUrl) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2">{t('user:mfa.confirmPasswordDescription')}</Typography>
        <Form
          error={error}
          form={passwordForm}
          formId={formId}
          loading={loading}
          onSubmit={handlePasswordSubmit}
          primaryButtonText={t('user:mfa.continue')}
        >
          <PasswordField
            fixedLabel
            fullWidth
            label={t('user:password')}
            name="password"
            placeholder={t('user:yourPassword')}
          />
        </Form>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Box className="flexCenter">
        <QRCodeSVG size={MFA_QR_CODE_SIZE} value={otpauthUrl} />
      </Box>
      <Form
        error={error}
        form={codeForm}
        formId={formId}
        loading={loading}
        onSubmit={handleCodeSubmit}
        primaryButtonText={t('user:mfa.activate')}
      >
        <TextField
          fixedLabel
          fullWidth
          label={t('user:mfa.code')}
          name="code"
          placeholder="123456"
        />
      </Form>
    </Stack>
  );
};

export default MfaSetupForm;
