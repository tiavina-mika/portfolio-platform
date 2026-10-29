import {
  Box, Card, CardHeader, Typography, type Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
  PROFILE_INFO_EMPTY_VALUE, PROFILE_INFO_GAP, PROFILE_INFO_LABEL_WIDTH,
  PROFILE_INFO_LABEL_WIDTH_COMPACT, PROFILE_INFO_PADDING_X, PROFILE_INFO_PADDING_X_COMPACT,
  PROFILE_INFO_PADDING_X_TABLET, PROFILE_INFO_PADDING_Y,
} from '@/constants/_core/ui/entity.constants';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

const classes = {
  /*
   * the rules between the rows are drawn by the card rather than by each row: a row does not know
   * whether it is the last one, and a border carried by every one of them would close the card with
   * a second line on top of its own edge
   */
  rows: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
  // what the fact is called on a fixed column, what it says beside it — tighter under `md` and `sm`
  row: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${PROFILE_INFO_LABEL_WIDTH}px minmax(0, 1fr)`,
    columnGap: `${PROFILE_INFO_GAP}px`,
    alignItems: 'center',
    padding: `${PROFILE_INFO_PADDING_Y}px ${PROFILE_INFO_PADDING_X}px`,
    [theme.breakpoints.down('md')]: { padding: `${PROFILE_INFO_PADDING_Y}px ${PROFILE_INFO_PADDING_X_TABLET}px` },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: `${PROFILE_INFO_LABEL_WIDTH_COMPACT}px minmax(0, 1fr)`,
      padding: `${PROFILE_INFO_PADDING_Y}px ${PROFILE_INFO_PADDING_X_COMPACT}px`,
    },
  }),
  // a number broken over two lines reads as two numbers
  noWrap: { whiteSpace: 'nowrap' as const },
};

type RowProps = {
  label: string;
  value: string;
  isNoWrap?: boolean;
};

const ProfileActivityRow = ({ label, value, isNoWrap = false }: RowProps) => (
  <Box css={classes.row}>
    <Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography css={isNoWrap && classes.noWrap} variant="body2">{value}</Typography>
  </Box>
);

/**
 * What the account has been through, read and never edited: when it was last signed into, when it
 * was created, and the number it is reached at. A fact the account has no record of — no phone on
 * an account opened by email, no sign-in tracked on one that predates it — reads as a dash.
 */
const ProfileActivityCard = () => {
  const {
    t,
  } = useTranslation();
  const user = useSelector(getAppCurrentUserSelector);

  const phone = getFullPhoneNumber(user.phone);

  return (
    <Card>
      <CardHeader title={t('user:accountActivity')} />
      <Box css={classes.rows}>
        <ProfileActivityRow
          label={t('user:lastSignIn')}
          value={user.lastLoginAt
            ? displayDate(user.lastLoginAt)
            : PROFILE_INFO_EMPTY_VALUE}
        />
        <ProfileActivityRow
          label={t('user:accountCreatedOn')}
          value={displayDate(user.createdAt, false, false, true)}
        />
        <ProfileActivityRow
          isNoWrap
          label={t('user:accountPhone')}
          value={phone || PROFILE_INFO_EMPTY_VALUE}
        />
      </Box>
    </Card>
  );
};

export default ProfileActivityCard;
