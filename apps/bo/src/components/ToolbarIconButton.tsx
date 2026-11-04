import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent, ReactNode } from 'react';

import type { Theme } from '@mui/material/styles';

import { LIST_TOOLBAR_CONTROL_HEIGHT } from '@/constants/_core/ui/list.constants';
import {
  TOOLBAR_ICON_BADGE_FONT_SIZE, TOOLBAR_ICON_BADGE_OFFSET, TOOLBAR_ICON_BADGE_PADDING_X,
  TOOLBAR_ICON_BADGE_SIZE, TOOLBAR_ICON_BUTTON_ACTIVE_BORDER_OPACITY,
} from '@/constants/_core/ui/ui.constants';
import { getOutlinedIconButtonStyles } from '@/utils/_core/theme/styles.utils';
import { getTintedBackground } from '@/utils/_core/theme/tokens.utils';

/*
 * A toolbar action carrying only a glyph — sort, export, anything opening a menu from the band
 * above a list. It takes the same bordered slot a table row's actions stand in, one step larger:
 * a lone icon standing next to a search field has to read as something clickable. `active` is for
 * a trigger that holds a value rather than firing an action (a list is always sorted by something)
 * — it stays tinted while that value applies, and the counter says how many criteria are behind it.
 */
const classes = {
  button: (isActive: boolean) => (theme: Theme) => {
    return {
      position: 'relative' as const,
      // the bordered slot itself is shared with the strip of actions each table row carries
      ...getOutlinedIconButtonStyles(theme, LIST_TOOLBAR_CONTROL_HEIGHT),
      ...(isActive
        ? {
          color: theme.palette.primary.dark,
          backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
          borderColor: alpha(theme.palette.primary.main, TOOLBAR_ICON_BUTTON_ACTIVE_BORDER_OPACITY),
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
            color: theme.palette.primary.dark,
          },
        }
        : {}),
    };
  },
  /*
   * pinned half outside the square rather than inline in it: the glyph fills the slot, and a
   * counter drawn inside it would either shrink the glyph or overlap it
   */
  badge: (theme: Theme) => ({
    position: 'absolute' as const,
    top: TOOLBAR_ICON_BADGE_OFFSET,
    right: TOOLBAR_ICON_BADGE_OFFSET,
    minWidth: TOOLBAR_ICON_BADGE_SIZE,
    height: TOOLBAR_ICON_BADGE_SIZE,
    padding: `0 ${TOOLBAR_ICON_BADGE_PADDING_X}px`,
    borderRadius: TOOLBAR_ICON_BADGE_SIZE / 2,
    fontSize: TOOLBAR_ICON_BADGE_FONT_SIZE,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: `${TOOLBAR_ICON_BADGE_SIZE}px`,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  }),
};

type Props = {
  // names the control for both the pointer (tooltip) and the screen reader (aria-label)
  label: string;
  icon: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  // the trigger holds a value that is currently applied, rather than merely firing an action
  active?: boolean;
  // how many criteria that value covers — omit it when the control carries no count
  badge?: ReactNode;
  disabled?: boolean;
  isMenuOpen?: boolean;
};

const ToolbarIconButton = ({
  label, icon, onClick, active = false, badge, disabled, isMenuOpen,
}: Props) => (
  <Tooltip title={label}>
    {/* the span holds the tooltip's ref while the button is disabled, which cannot hold it itself */}
    <span css={{ display: 'inline-flex' }}>
      <IconButton
        aria-label={label}
        css={classes.button(active || !!isMenuOpen)}
        disabled={disabled}
        onClick={onClick}
        aria-expanded={isMenuOpen === undefined
          ? undefined
          : isMenuOpen}
      >
        {icon}
        {badge !== undefined && badge !== null && (
          <Box component="span" css={classes.badge}>{badge}</Box>
        )}
      </IconButton>
    </span>
  </Tooltip>
);

export default ToolbarIconButton;
