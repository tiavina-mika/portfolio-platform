import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import TextFieldInput from '@/components/form/inputs/TextFieldInput';
import { TABLE_ROW_DETAIL_GAP } from '@/constants/_core/ui/list.constants';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { ISuspendedUserPoint } from '@/types/_core/statistics.type';
import { formatStatisticsAmount } from '@/utils/_core/statistics.utils';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
};

type Props = {
  /** The suspended account the operator is acting on, or null while the dialog is closed. */
  user: Pick<ISuspendedUserPoint, 'userId' | 'fullName' | 'pendingPenalty' | 'currency'> | null;
  /** Whether the fine goes with the lifting — the branch that gives up revenue. */
  withPenalty: boolean;
  open: boolean;
  toggle: () => void;
  onConfirm: (reason: string) => void;
};

/**
 * Confirms ending a cancellation suspension early, and writing off the fine that came with it.
 *
 * Both used to happen on a single click from the row, with no confirmation and no reason. Lifting
 * a suspension is reversible by the policy itself — the next cancellation suspends the account
 * again — but writing off the fine is revenue the platform gives up and nothing could undo it, so
 * the amount being erased is stated here and a reason is required before the button works. The
 * server refuses a write-off sent without one, and records the reason both in the moderation log
 * and as an entry of the driver's own penalty history.
 */
const ClearSuspensionDialog = ({
  user, withPenalty, open, toggle, onConfirm,
}: Props) => {
  const { t } = useTranslation(['common', 'statistics']);
  const loading = useSelector(getAppLoadingSelector);

  const [reason, setReason] = useState('');

  // a reason belongs to one decision: carrying the last one over would file it under the wrong account
  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  /*
   * only required when the fine goes too. Lifting a suspension on its own is undone by the policy
   * the next time the driver cancels; the money is not.
   */
  const isReasonValid = !withPenalty || reason.trim().length > 0;

  const handleConfirm = () => {
    if (!isReasonValid) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog
      buttonColor={withPenalty ? 'error' : 'primary'}
      loading={loading}
      maxWidth="xs"
      onPrimaryButtonAction={handleConfirm}
      open={open}
      primaryButtonDisabled={!isReasonValid}
      toggle={toggle}
      description={withPenalty
        ? t('statistics:clearSuspensionAndPenaltyDescription', {
          amount: formatStatisticsAmount(user?.pendingPenalty ?? 0, user?.currency),
        })
        : t('statistics:clearSuspensionDescription')}
      primaryButtonText={withPenalty
        ? t('statistics:liftSuspensionAndPenalty')
        : t('statistics:liftSuspension')}
      title={withPenalty
        ? t('statistics:clearSuspensionAndPenaltyTitle', { name: user?.fullName })
        : t('statistics:clearSuspensionTitle', { name: user?.fullName })}
    >
      <Box css={classes.content}>
        {/* what the platform is giving up, before the reason is typed rather than after */}
        {withPenalty && (
          <Typography variant="caption">
            {t('statistics:clearPenaltyWarning', {
              amount: formatStatisticsAmount(user?.pendingPenalty ?? 0, user?.currency),
            })}
          </Typography>
        )}
        <TextFieldInput
          fixedLabel
          fullWidth
          multiline
          error={!isReasonValid}
          label={t('statistics:clearSuspensionReason')}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          value={reason}
          helperText={withPenalty
            ? t('statistics:clearSuspensionReasonRequiredHelper')
            : t('statistics:clearSuspensionReasonHelper')}
        />
      </Box>
    </Dialog>
  );
};

export default ClearSuspensionDialog;
