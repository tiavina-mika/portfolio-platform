import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import ProgressBar from '@/components/ProgressBar';
import {
  PROFILE_COMPLETENESS_BAR_HEIGHT, PROFILE_COMPLETENESS_BAR_RADIUS, PROFILE_COMPLETENESS_BAR_WIDTH,
  PROFILE_COMPLETENESS_GAP,
} from '@/constants/_core/ui/entity.constants';
import { IUser } from '@/types/_core/user.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserProfileCompleteness } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PROFILE_COMPLETENESS_GAP}px`,
    /*
     * fixed rather than sized by the cell: bars of different lengths in the same column cannot be
     * compared to one another, which is the only thing the bar is there for
     */
    width: PROFILE_COMPLETENESS_BAR_WIDTH,
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  user: IUser;
};

/**
 * How much of the user's profile is filled in: the percentage, the band it falls in, and the same
 * percentage drawn under them. The bar is what lets a screen of rows be scanned for the accounts
 * that still have to be chased without reading a single figure.
 */
const UserProfileCompletenessCell = ({ user }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['user']);

  const { percentage, level, tone } = getUserProfileCompleteness(user);

  /*
   * warning's `main` is a bright amber that disappears at this thickness, so it falls back to the
   * darker step the same way the ride occupancy bar does — a row keeps one language
   */
  const toneColor = tone === 'default'
    ? getDesignTokens(theme).textMuted
    : theme.palette[tone][tone === 'warning'
      ? 'dark'
      : 'main'];

  return (
    <Box css={classes.root}>
      <Box css={classes.labels}>
        <Typography variant="subtitle1">{percentage}%</Typography>
        <Typography noWrap sx={{ color: 'text.secondary' }} variant="body2">
          {t(`user:profileCompleteness.${level}`)}
        </Typography>
      </Box>
      <ProgressBar
        color={toneColor}
        height={PROFILE_COMPLETENESS_BAR_HEIGHT}
        radius={PROFILE_COMPLETENESS_BAR_RADIUS}
        ratio={percentage / 100}
        width="100%"
      />
    </Box>
  );
};

export default UserProfileCompletenessCell;
