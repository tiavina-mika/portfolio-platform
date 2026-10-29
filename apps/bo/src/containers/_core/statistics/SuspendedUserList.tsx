import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import { STATISTICS_EMPTY_CELL } from '@/constants/_core/statistics.constants';
import {
  STATISTICS_ROW_ACTIONS_GAP, STATISTICS_ROW_BUTTON_BORDER_OPACITY, STATISTICS_ROW_BUTTON_HEIGHT,
  STATISTICS_ROW_BUTTON_PADDING_X,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_META, RADIUS } from '@/constants/_core/ui/ui.constants';
import ClearSuspensionDialog from '@/containers/_core/statistics/ClearSuspensionDialog';
import StatisticsTableContainer from '@/containers/_core/statistics/StatisticsTableContainer';
import { ISuspendedUserPoint } from '@/types/_core/statistics.type';
import { displayDate } from '@/utils/_core/date.utils';
import { formatStatisticsAmount } from '@/utils/_core/statistics.utils';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  name: (theme: Theme) => ({ fontWeight: theme.typography.fontWeightBold }),
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: STATISTICS_ROW_ACTIONS_GAP,
  },
  // tinted rather than outlined: the row's one way out of the state it reports, not a secondary action
  action: (theme: Theme) => ({
    height: STATISTICS_ROW_BUTTON_HEIGHT,
    padding: `0 ${STATISTICS_ROW_BUTTON_PADDING_X}px`,
    borderRadius: RADIUS,
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightMedium,
    whiteSpace: 'nowrap' as const,
    color: getAccentTextColor(theme),
    backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    border: `1px solid ${alpha(theme.palette.primary.main, STATISTICS_ROW_BUTTON_BORDER_OPACITY)}`,
    '&:hover': { borderColor: theme.palette.primary.main },
    '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
  }),
};

/** The row and the decision the confirmation dialog is open for. */
type PendingAction = {
  user: ISuspendedUserPoint;
  withPenalty: boolean;
};

type Props = {
  users: ISuspendedUserPoint[];
  /**
   * Lifts one row's suspension, with the reason the operator typed in the confirmation dialog.
   * `withPenalty` also writes off the fine — two separate actions rather than a checkbox, because
   * they are two different decisions an operator makes, not a setting.
   */
  onClearSuspension?: (userId: string, withPenalty: boolean, reason: string) => void;
};

const SuspendedUserList = ({ users, onClearSuspension }: Props) => {
  const { t } = useTranslation(['statistics', 'user']);
  /*
   * what the dialog is about to do, held until it is confirmed: both actions used to fire on the
   * click itself, so a mis-tap wrote off a driver's fine with nothing recorded about why
   */
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleConfirm = (reason: string) => {
    if (!pendingAction) return;

    onClearSuspension?.(pendingAction.user.userId, pendingAction.withPenalty, reason);
    setPendingAction(null);
  };

  if (users.length === 0) return <EmptyData />;

  return (
    <StatisticsTableContainer>
      <TableHead>
        <TableRow>
          <TableCell>{t('user:user')}</TableCell>
          <TableCell>{t('statistics:suspendedUntil')}</TableCell>
          <TableCell align="right">{t('statistics:cancellationsInWindow')}</TableCell>
          <TableCell align="right">{t('statistics:pendingPenalty')}</TableCell>
          {!!onClearSuspension && <TableCell align="right" />}
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.userId}>
            <TableCell css={classes.name}>{user.fullName}</TableCell>
            <TableCell>{displayDate(user.suspendedUntil, false)}</TableCell>
            <TableCell align="right">{user.cancellationsInWindow}</TableCell>
            <TableCell align="right">
              {user.pendingPenalty > 0
                ? formatStatisticsAmount(user.pendingPenalty, user.currency)
                : STATISTICS_EMPTY_CELL}
            </TableCell>
            {!!onClearSuspension && (
              <TableCell align="right">
                <div css={classes.actions}>
                  <ButtonBase
                    css={classes.action}
                    onClick={() => setPendingAction({ user, withPenalty: false })}
                  >
                    {t('statistics:liftSuspension')}
                  </ButtonBase>
                  {user.pendingPenalty > 0 && (
                    <ButtonBase
                      css={classes.action}
                      onClick={() => setPendingAction({ user, withPenalty: true })}
                    >
                      {t('statistics:liftSuspensionAndPenalty')}
                    </ButtonBase>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
      <ClearSuspensionDialog
        onConfirm={handleConfirm}
        open={!!pendingAction}
        toggle={() => setPendingAction(null)}
        user={pendingAction?.user ?? null}
        withPenalty={!!pendingAction?.withPenalty}
      />
    </StatisticsTableContainer>
  );
};

export default SuspendedUserList;
