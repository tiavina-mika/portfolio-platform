import Button from '@mui/material/Button';
import { ReactNode } from 'react';

import type { Theme } from '@mui/material/styles';

import {
  INBOX_SCOPE_GAP, INBOX_SCOPE_HEIGHT, INBOX_SCOPE_PADDING_X, INBOX_SCOPE_RADIUS,
} from '@/constants/_core/ui/inbox.constants';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  chip: (theme: Theme, isActive: boolean, isOutlined: boolean) => {
    const tokens = getDesignTokens(theme);

    const idleBorderColor = isOutlined ? tokens.border : 'transparent';

    return {
      height: INBOX_SCOPE_HEIGHT,
      minWidth: 'auto',
      padding: `0 ${INBOX_SCOPE_PADDING_X}px`,
      gap: `${INBOX_SCOPE_GAP}px`,
      borderRadius: `${INBOX_SCOPE_RADIUS}px`,
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      color: isActive ? theme.palette.primary.main : tokens.textSecondary,
      fontWeight: isActive ? 600 : 500,
      backgroundColor: isActive
        ? getTintedBackground(theme, theme.palette.primary.main)
        : (isOutlined ? tokens.surface : 'transparent'),
      border: `1px solid ${isActive ? theme.palette.primary.main : idleBorderColor}`,
    };
  },
};

type Props = {
  isActive: boolean;
  /*
   * whether the chip keeps an edge while it is not picked. A scope of the strip does not — it sits
   * on a rail of its siblings; a choice inside the filter panel does, so it reads as something to
   * pick on a surface that holds nothing else
   */
  isOutlined?: boolean;
  onClick: () => void;
  children: ReactNode;
};

/** One choice of the inbox: a scope of the strip above the queue, or a value of a filter. */
const ContactInboxChip = ({
  isActive, isOutlined = false, onClick, children,
}: Props) => (
  <Button
    aria-pressed={isActive}
    css={(theme: Theme) => classes.chip(theme, isActive, isOutlined)}
    onClick={onClick}
    size="small"
    variant="text"
  >
    {children}
  </Button>
);

export default ContactInboxChip;
