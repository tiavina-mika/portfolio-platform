import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import { SECTION_FOOTER_GAP, SECTION_FOOTER_PADDING_TOP } from '@/constants/_core/ui/list.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  // what the reader should know about the rows above before acting on them (a data limit, an audit)
  note?: ReactNode;
  // the way to the full list the block only shows the start of
  actionLabel?: string;
  onAction?: () => void;
  // an action of its own the block closes on, in place of or next to the way to the full list
  actions?: ReactNode;
};

const classes = {
  footer: (theme: Theme) => ({
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SECTION_FOOTER_GAP,
    paddingTop: SECTION_FOOTER_PADDING_TOP,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: SECTION_FOOTER_GAP,
    marginLeft: 'auto',
  },
};

/**
 * The band closing a block of a detail page: a note on what the rows above can and cannot say, and
 * the way to the full list the block only shows the start of. Nothing is drawn when there is
 * neither — a rule closing nothing would read as a missing row.
 */
const SectionFooter = ({
  note, actionLabel, onAction, actions,
}: Props) => {
  const hasAction = !!actionLabel && !!onAction;

  if (!note && !hasAction && !actions) return null;

  return (
    <Box css={classes.footer}>
      {note && (
        <Typography color="textSecondary" variant="caption">
          {note}
        </Typography>
      )}
      {(hasAction || actions) && (
        <Box css={classes.actions}>
          {actions}
          {hasAction && (
            <Button
              endIcon={<FiArrowRight />}
              onClick={onAction}
              size="small"
              variant="text"
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SectionFooter;
