import { type Theme } from '@emotion/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import { REPORT_FILE_ACTIONS_GAP } from '@/constants/_core/ui/inbox.constants';
import { useToggle } from '@/hooks/_core/useToggle';

const classes = {
  /*
   * the ways out of a report share the footer evenly: none of them is the expected one — a report
   * is closed by ruling on it, not by confirming a default — so none of them is drawn smaller or
   * pushed to an edge the way a cancel button would be
   */
  row: (theme: Theme) => ({
    display: 'flex',
    // the report's own page keeps them in a 400px card, where all three side by side do not fit
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_ACTIONS_GAP}px`,
    // three touch-sized buttons do not fit one phone-width row: they stack rather than wrap
    [theme.breakpoints.down('sm')]: { flexDirection: 'column' as const },
  }),
  action: { flex: '1 1 auto' },
  /*
   * the confirmation is a block the reader has to pass through, above the row it replaces the
   * meaning of — not a second dialog. It carries no glyph: the sentence is the warning, and the
   * red button under it already says what kind of action is being confirmed.
   */
  confirmation: { '& .MuiAlert-message': { width: '100%' } },
};

type Props = {
  onResolve: () => void;
  onDismiss: () => void;
  /*
   * blocking the reported account, when it is an account at all. Omitted for a ride, a vehicle or
   * a review — there is nothing there to stop from signing in
   */
  onSuspend?: () => void;
  /*
   * taking the report in charge, before ruling on it. Omitted once somebody already has — it is
   * offered only on a pending report
   */
  onStartReview?: () => void;
};

/**
 * The three ways a report can be closed, in the band the dialog ends on — and, on a report nobody
 * has looked at yet, the way to take it in charge first.
 *
 * Suspending is the one decision that cannot be undone from this screen, so it asks a second time
 * — inline, above the row, rather than in a dialog over the dialog: the operator has the complaint
 * and the target's whole history on screen behind it, which is exactly what the answer depends on.
 */
const ReportDecisionActions = ({
  onResolve, onDismiss, onSuspend, onStartReview,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const { open: isConfirmingSuspension, toggle: toggleSuspensionConfirm } = useToggle();

  const handleConfirmSuspension = () => {
    toggleSuspensionConfirm();
    onSuspend?.();
  };

  return (
    <>
      {isConfirmingSuspension && (
        <Alert css={classes.confirmation} icon={false} severity="error">
          <Stack spacing={1.25}>
            <span>{t('user:reports.suspendConfirmation')}</span>
            <Box css={classes.row}>
              <Button
                color="error"
                css={classes.action}
                onClick={handleConfirmSuspension}
                variant="contained"
              >
                {t('user:reports.suspendConfirm')}
              </Button>
              <Button color="inherit" onClick={toggleSuspensionConfirm} variant="outlined">
                {t('common:cancel')}
              </Button>
            </Box>
          </Stack>
        </Alert>
      )}

      <Box css={classes.row}>
        {onStartReview && (
          <Button
            color="inherit"
            css={classes.action}
            onClick={onStartReview}
            variant="outlined"
          >
            {t('user:reports.startReview')}
          </Button>
        )}
        {onSuspend && (
          <Button
            color="error"
            css={classes.action}
            onClick={toggleSuspensionConfirm}
            variant="outlined"
          >
            {t('user:reports.suspendAccount')}
          </Button>
        )}
        <Button
          color="inherit"
          css={classes.action}
          onClick={onDismiss}
          variant="outlined"
        >
          {t('user:reports.dismiss')}
        </Button>
        <Button css={classes.action} onClick={onResolve} variant="contained">
          {t('user:reports.resolve')}
        </Button>
      </Box>
    </>
  );
};

export default ReportDecisionActions;
