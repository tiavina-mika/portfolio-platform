import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import Dialog from '@/components/Dialog';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // the option reads as a decision of its own, framed apart from the sentence above it
  option: (theme: Theme) => ({
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    paddingInline: theme.spacing(1.5),
  }),
};

type Props = {
  open: boolean;
  toggle: () => void;
  userFullName: string;
  // the suspension is only offered while the account is not already banned
  canSuspend: boolean;
  onConfirm: (shouldSuspend: boolean) => void;
};

/**
 * Confirms signing a user out of every device — the stolen-phone case. The agent can suspend the
 * account at the same time for as long as the carrier needs to block the SIM, since until then a
 * sign-in code sent to that SIM would let the thief straight back in.
 */
const RevokeAllSessionsDialog = ({
  open, toggle, userFullName, canSuspend, onConfirm,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [shouldSuspend, setShouldSuspend] = useState(false);

  // the option is a decision for this one confirmation, never carried over to the next opening
  const handleToggle = () => {
    setShouldSuspend(false);
    toggle();
  };

  return (
    <Dialog
      fullWidth
      buttonColor="error"
      description={t('user:sessions.signOutAllDescription', { name: userFullName })}
      maxWidth="sm"
      onPrimaryButtonAction={() => onConfirm(shouldSuspend)}
      open={open}
      title={t('user:sessions.signOutAll')}
      toggle={handleToggle}
      primaryButtonText={shouldSuspend
        ? t('user:sessions.signOutAndSuspend')
        : t('user:sessions.signOutAllConfirm')}
    >
      {canSuspend && (
        <Box css={classes.option} sx={{ mt: 2 }}>
          <FormControlLabel
            label={t('user:sessions.suspension.alsoSuspend')}
            control={(
              <Checkbox
                checked={shouldSuspend}
                onChange={(event) => setShouldSuspend(event.target.checked)}
              />
            )}
          />
        </Box>
      )}
    </Dialog>
  );
};

export default RevokeAllSessionsDialog;
