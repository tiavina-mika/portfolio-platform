import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';

type Props = {
  open: boolean;
  toggle: () => void;
  userFullName: string;
  // the account was locked by wrong codes: the dialog says so, the reset lifts it too
  isLocked: boolean;
  onConfirm: () => void;
};

/**
 * Confirms clearing the second factor of an admin who lost their authenticator app and their
 * backup codes. Meant for an OWNER only — the server refuses anyone else.
 */
const ResetUserMfaDialog = ({
  open, toggle, userFullName, isLocked, onConfirm,
}: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Dialog
      fullWidth
      buttonColor="error"
      maxWidth="sm"
      onPrimaryButtonAction={onConfirm}
      open={open}
      primaryButtonText={t('user:mfa.adminReset.confirm')}
      title={t('user:mfa.adminReset.title')}
      toggle={toggle}
      description={isLocked
        ? t('user:mfa.adminReset.descriptionLocked', { name: userFullName })
        : t('user:mfa.adminReset.description', { name: userFullName })}
    />
  );
};

export default ResetUserMfaDialog;
