import Button from '@mui/material/Button';
import { ReactNode } from 'react';

import type { Theme } from '@mui/material/styles';

import {
  INBOX_SCOPE_GAP, INBOX_SCOPE_HEIGHT, INBOX_SCOPE_PADDING_X, INBOX_SCOPE_RADIUS,
} from '@/constants/_core/ui/inbox.constants';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  chip: (theme: Theme, isActive: boolean) => ({
    height: INBOX_SCOPE_HEIGHT,
    minWidth: 'auto',
    padding: `0 ${INBOX_SCOPE_PADDING_X}px`,
    gap: `${INBOX_SCOPE_GAP}px`,
    borderRadius: `${INBOX_SCOPE_RADIUS}px`,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    color: isActive ? theme.palette.primary.main : getDesignTokens(theme).textSecondary,
    fontWeight: isActive ? 600 : 500,
    backgroundColor: isActive ? getTintedBackground(theme, theme.palette.primary.main) : 'transparent',
    border: `1px solid ${isActive ? theme.palette.primary.main : 'transparent'}`,
  }),
};

type Props = {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
};

/** One scope of the strip above the list. */
const ContactInboxChip = ({ isActive, onClick, children }: Props) => (
  <Button
    aria-pressed={isActive}
    css={(theme: Theme) => classes.chip(theme, isActive)}
    onClick={onClick}
    size="small"
    variant="text"
  >
    {children}
  </Button>
);

export default ContactInboxChip;
