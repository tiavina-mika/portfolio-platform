import { Box, Skeleton, Stack } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import { MFA_QR_CODE_SIZE } from '@/constants/_core/auth.constants';
import { HIGHEST_LEVEL_ROLES } from '@/constants/_core/user.constants';
import { clearMfaEnrollment } from '@/redux/actions/_core/auth.action';
import { getAppCurrentUserSelector, getAppMfaBackupCodesSelector } from '@/redux/reducers/_core/app.reducer';
import { IRole } from '@/types/_core/role.type';

import MfaBackupCodesDisplay from './MfaBackupCodesDisplay';

/*
 * loaded on demand: this banner is mounted by the dashboard layout on every page, but the setup
 * form (QR code renderer, form + schema resolver) is only ever shown to a top-level admin who has
 * not enrolled yet — everyone else would pay for it in the first paint for nothing
 */
const MfaSetupForm = lazy(() => import('./MfaSetupForm'));

// mirrors the setup form's layout (centered QR code, then the code field) so the dialog keeps its size
const MfaSetupFormFallback = () => (
  <Stack spacing={2}>
    <Box className="flexCenter">
      <Skeleton height={MFA_QR_CODE_SIZE} variant="rectangular" width={MFA_QR_CODE_SIZE} />
    </Box>
    <Skeleton height={56} variant="rounded" />
  </Stack>
);

type Props = {
  roles: IRole[];
};

/**
 * Soft MFA enforcement for OWNER/SUPER_ADMIN accounts: a persistent, non-dismissible dialog
 * forcing enrollment before the rest of the BO is usable — deliberately not a hard login refusal,
 * so a high-privilege admin can still get in (and enroll) rather than being locked out of the
 * only place where enrollment happens. Rendered once from DashboardLayout so it covers every
 * protected route.
 */
const MfaRequiredBanner = ({ roles }: Props) => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const currentUser = useSelector(getAppCurrentUserSelector);
  const backupCodes = useSelector(getAppMfaBackupCodesSelector);

  const hasHighestRole = roles.some((role) => HIGHEST_LEVEL_ROLES.includes(role.name));
  /*
   * `!!currentUser` guard: while the user is still being hydrated (null), "not enrolled" is
   * unknown, not false — enforcing on null would flash the setup dialog to an already-enrolled
   * admin on every page load until onDashboardEnter finishes loading them.
   */
  const shouldEnforce = hasHighestRole && !!currentUser && !currentUser.mfa?.enabled;

  /*
   * Keep the dialog open while backup codes are pending display even once `shouldEnforce` has
   * already flipped to false — confirmMfaEnrollment sets mfaBackupCodes before the refreshed
   * currentUser (mfa.enabled: true) finishes propagating. Gating solely on `shouldEnforce` let the
   * two updates race: clearing backupCodes on "done" while currentUser hadn't caught up yet briefly
   * fell back through to MfaSetupForm before the dialog closed.
   */
  if (!shouldEnforce && !backupCodes) return null;

  // dropping the codes is what closes the dialog: `shouldEnforce` is already false by this point
  const handleBackupCodesAcknowledged = () => dispatch(clearMfaEnrollment());

  return (
    <Dialog
      fullWidth
      open
      maxWidth="sm"
      primaryButtonText={t('user:mfa.backupCodesSaved')}
      title={t('user:mfa.enforcedTitle')}
      withCancelButton={false}
      /*
       * the codes step is the only one this dialog can be left from — the enrollment form below
       * carries its own submit, and there is nothing to cancel out of while enforcement is on
       */
      onPrimaryButtonAction={backupCodes
        ? handleBackupCodesAcknowledged
        : undefined}
    >
      {backupCodes
        ? <MfaBackupCodesDisplay />
        : (
          <Suspense fallback={<MfaSetupFormFallback />}>
            <MfaSetupForm />
          </Suspense>
        )}
    </Dialog>
  );
};

export default MfaRequiredBanner;
