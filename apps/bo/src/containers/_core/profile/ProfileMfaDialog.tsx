import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import MfaBackupCodesDisplay from '@/containers/_core/auth/MfaBackupCodesDisplay';
import MfaSetupForm from '@/containers/_core/auth/MfaSetupForm';
import MfaVerifyForm from '@/containers/_core/auth/MfaVerifyForm';
import { clearMfaEnrollment, disableMfa } from '@/redux/actions/_core/auth.action';
import {
  getAppErrorSelector, getAppMfaBackupCodesSelector,
} from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { IMfaCodeInput } from '@/types/_core/auth.type';

const MFA_FORM_ID = 'mfa-form-id';

type Props = {
  enabled: boolean;
  open: boolean;
  onClose: () => void;
};

/**
 * The dialog the profile's two-factor row opens — enrolling into it, turning it off again, and the
 * backup codes shown once at the end of an enrollment. Which of the three it shows is decided by
 * the store rather than by the row that opened it.
 */
const ProfileMfaDialog = ({
  enabled, open, onClose,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);
  const error = useSelector(getAppErrorSelector);
  const backupCodes = useSelector(getAppMfaBackupCodesSelector);

  /*
   * backupCodes takes priority over `enabled` — confirming enrollment flips currentUser.mfa.enabled
   * to true (see refreshCurrentUser in confirmMfaEnrollment) while this dialog is still open on
   * its "here are your backup codes, shown once" step, so `enabled` alone can't drive the branch.
   */
  const step = backupCodes
    ? 'backupCodes'
    : enabled
      ? 'disable'
      : 'setup';

  const isBackupCodesStep = step === 'backupCodes';
  const isDisableStep = step === 'disable';

  /*
   * the enrollment left in the store is what decides the step above, so it has to be dropped on the
   * way out — otherwise reopening the row lands back on the codes of the enrollment just finished
   */
  const handleClose = () => {
    dispatch(clearMfaEnrollment());
    onClose();
  };

  const handleDisableSubmit = (values: IMfaCodeInput) => {
    dispatch(disableMfa(values.code));
  };

  const primaryButtonText = isBackupCodesStep
    ? t('user:mfa.backupCodesSaved')
    : isDisableStep
      ? t('user:mfa.disable')
      : t('user:mfa.activate');

  return (
    <Dialog
      fullWidth
      loading={loading}
      maxWidth="sm"
      open={open}
      primaryButtonText={primaryButtonText}
      toggle={handleClose}
      withCancelButton={!isBackupCodesStep}
      // turning the second factor off weakens the account: the action states it in its own color
      buttonColor={isDisableStep
        ? 'error'
        : 'primary'}
      formId={isBackupCodesStep
        ? undefined
        : MFA_FORM_ID}
      /*
       * acknowledging the codes is exactly closing the dialog: Dialog runs `toggle` right after
       * this handler, so the step needs nothing of its own beyond a button to render
       */
      onPrimaryButtonAction={isBackupCodesStep
        ? onClose
        : undefined}
      title={isDisableStep
        ? t('user:mfa.disableTitle')
        : t('user:mfa.setupTitle')}
    >
      <Stack spacing={2}>
        {/* what the step is asking for, stated before the field that answers it */}
        {!isBackupCodesStep && (
          <Typography variant="body2">
            {isDisableStep
              ? t('user:mfa.verifyDescription')
              : t('user:mfa.setupDescription')}
          </Typography>
        )}
        {isDisableStep && (
          <MfaVerifyForm
            error={error}
            formId={MFA_FORM_ID}
            loading={loading}
            onSubmit={handleDisableSubmit}
          />
        )}
        {isBackupCodesStep && <MfaBackupCodesDisplay />}
        {step === 'setup' && <MfaSetupForm formId={MFA_FORM_ID} />}
      </Stack>
    </Dialog>
  );
};

export default ProfileMfaDialog;
