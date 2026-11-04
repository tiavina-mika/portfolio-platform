import { Box, ButtonBase, Typography } from '@mui/material';

import type { Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { ProfileRowChevronIcon } from '@/components/icons/ProfileIcons';
import {
  PROFILE_ACCOUNT_ROW_DESCRIPTION_MAX_WIDTH, PROFILE_ACCOUNT_ROW_GAP, PROFILE_ACCOUNT_ROW_LABEL_GAP,
  PROFILE_ACCOUNT_ROW_MIN_HEIGHT, SETTINGS_ROW_LABEL_GAP, SETTINGS_ROW_PADDING_X,
  SETTINGS_ROW_PADDING_Y,
} from '@/constants/_core/ui/entity.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // what protects the account on the left, the one action that changes it closing the row on the right
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: `${PROFILE_ACCOUNT_ROW_GAP}px`,
    alignItems: 'center',
    width: '100%',
    minHeight: PROFILE_ACCOUNT_ROW_MIN_HEIGHT,
    padding: `${SETTINGS_ROW_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
    textAlign: 'start' as const,
  },
  label: { minWidth: 0 },
  // the state of the setting is read as part of its name, so the chip stands on the same line
  labelLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PROFILE_ACCOUNT_ROW_LABEL_GAP}px`,
  },
  // the sentence under the name is a line of prose, not a column of the row: it wraps early
  description: {
    marginTop: `${SETTINGS_ROW_LABEL_GAP}px`,
    maxWidth: PROFILE_ACCOUNT_ROW_DESCRIPTION_MAX_WIDTH,
    textWrap: 'pretty' as const,
  },
  chevron: (theme: Theme) => ({
    display: 'flex',
    flexShrink: 0,
    color: getDesignTokens(theme).textDisabled,
  }),
};

type Props = {
  label: string;
  description?: string;
  // the current state of the setting, read as part of its name (two-factor authentication on/off)
  chip?: ReactNode;
  // what changes the setting on a pointer device — replaced by the row itself on a touch screen
  action?: ReactNode;
  onClick?: () => void;
  isTouchScreen?: boolean;
};

/**
 * One row of the profile's account card: something that protects the account, the sentence saying
 * what it does, and the single action that changes it. Under `md` a row that has an action becomes
 * that action — there is no width left for a button beside the sentence — and ends on a chevron.
 */
const ProfileAccountRow = ({
  label, description, chip, action, onClick, isTouchScreen = false,
}: Props) => {
  const isTouchTarget = isTouchScreen && !!onClick;

  const content = (
    <>
      <div css={classes.label}>
        <div css={classes.labelLine}>
          <Typography variant="subtitle1">{label}</Typography>
          {chip}
        </div>
        {description && (
          <Typography css={classes.description} variant="caption">
            {description}
          </Typography>
        )}
      </div>
      {isTouchTarget
        ? (
          <Box component="span" css={classes.chevron}>
            <ProfileRowChevronIcon />
          </Box>
        )
        : action}
    </>
  );

  if (isTouchTarget) {
    return <ButtonBase css={classes.row} onClick={onClick}>{content}</ButtonBase>;
  }

  return <Box css={classes.row}>{content}</Box>;
};

export default ProfileAccountRow;
