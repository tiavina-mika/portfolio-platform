
import {
  alpha, Box, Theme, Tooltip,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useRouter } from '@tanstack/react-router';

import { SidebarChevronIcon } from '@/components/icons/SidebarIcons';
import { NOTIFICATION_BADGE_MAX } from '@/constants/_core/app.constants';
import { BADGE_FONT_SIZE, FONT_SIZE_BODY, RADIUS_SM } from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { ISidebarSubMenu } from '@/types/_core/navigation.type';
import { SidebarTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  listItem: {
    display: 'block',
    position: 'relative' as const,
  },
  itemButton: (
    open: boolean, isLevel2: boolean, isActiveGroup: boolean, tokens: SidebarTokens
  ) => (theme: Theme) => {
    // rail (collapsed) items are a fixed 44px square centered in the 64px rail, per the design reference
    const horizontalPadding = open ? (isLevel2 ? 24 : 14) : 0;

    return {
      justifyContent: open ? 'initial' : 'center',
      // mirrors `.sb-item{min-height:36px;padding:6px 14px;margin-bottom:1px;border-radius:4px}`
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      minHeight: 36,
      borderRadius: RADIUS_SM,
      marginBottom: 1,
      ...(!open && { width: 44, marginLeft: 'auto', marginRight: 'auto' }),
      color: isActiveGroup ? tokens.textHover : tokens.text,
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        backgroundColor: tokens.hoverBg,
        color: tokens.textHover,
      },
      '&.Mui-selected': {
        /*
         * mirrors the design reference's fixed teal tint (`#1abb9c2e`) — the sidebar accent stays
         * teal regardless of the app's selected theme color
         */
        backgroundColor: alpha(theme.palette.primary.main, 0.18),
        color: tokens.textActive,
        fontWeight: theme.typography.fontWeightMedium,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.18),
        },
      },
    };
  },
  chevron: (isSubMenuOpen: boolean) => ({
    marginLeft: 'auto',
    display: 'flex',
    color: 'inherit',
    transform: isSubMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s',
  }),
  icon: (open: boolean, isLevel2: boolean) => (theme: Theme) => ({
    minWidth: 0,
    marginRight: open ? 10 : 'auto',
    justifyContent: 'center',
    color: 'inherit',
    // mirrors `.sb-icon{opacity:.95}` / `.sb-item.active .sb-icon{opacity:1;color:#1abb9c}`
    opacity: 0.95,
    '.Mui-selected &': { opacity: 1, color: theme.palette.primary.main },
    // mirrors the smaller (16px vs 18px) icon size used for nested sub-items
    ...(isLevel2 && { '& svg': { width: 16, height: 16 } }),
  }),
  // mirrors `.sb-badge` in the design reference
  badge: (tokens: SidebarTokens) => (theme: Theme) => ({
    marginLeft: 'auto',
    flexShrink: 0,
    padding: '1px 6px',
    borderRadius: 3,
    fontSize: BADGE_FONT_SIZE,
    fontWeight: 600,
    lineHeight: 1.6,
    backgroundColor: alpha(theme.palette.error.main, 0.15),
    // the plain error red is too dark to read on the sidebar's own dark chrome
    color: tokens.isLight ? theme.palette.error.main : theme.palette.error.light,
  }),
  itemText: {
    color: 'inherit',
    /*
     * the primary text renders through MUI's own Typography (`.MuiListItemText-primary`), which
     * carries its own explicit fontSize from the theme — setting fontSize on the wrapping
     * ListItemText alone doesn't cascade into it, so it must be targeted directly here.
     * A sub-item reads as nested through its indent and its smaller glyph, not through a smaller
     * label: one size covers both levels, the way the rest of the scale works.
     */
    '& .MuiListItemText-primary': {
      fontSize: FONT_SIZE_BODY,
      lineHeight: 1.4,
      fontWeight: 'inherit',
      color: 'inherit',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
};

type Props = {
  open: boolean;
  subMenu: ISidebarSubMenu;
  tokens: SidebarTokens;
  isLevel2?: boolean;
  isSelected?: boolean;
  // true when a nested subMenu route is active while this parent item is collapsed
  isActiveGroup?: boolean;
  isSubMenuOpen?: boolean;
  // unseen count for this item's collection — hidden when zero/undefined or in the collapsed rail
  badgeCount?: number;
  onClose: () => void;
};

const SideBarItem = ({
  open, subMenu, tokens, isSelected, isActiveGroup = false, isSubMenuOpen = false, badgeCount,
  onClose, isLevel2 = false,
}: Props) => {
  const isDesktopDown = useBreakpoint();
  const router = useRouter();

  const handleCloseItem = (subMenu: ISidebarSubMenu) => {
    /*
     * a parent item only toggles its nested subMenus — it never navigates itself, so it no longer
     * duplicates its first child (e.g. "Statistiques" vs "Overview" pointing at the same route)
     */
    if (subMenu.subMenus) {
      onClose();
      return;
    }

    if (!isDesktopDown) {
      subMenu.onClick();
      return;
    }

    onClose();
    subMenu.onClick();
  };

  /*
   * preload the target route's chunk/data ahead of the click (hover/focus/touch)
   * so navigation feels instant instead of showing a loading flash while the chunk fetches
   */
  const handlePreload = () => {
    router.preloadRoute({ to: subMenu.id } as any).catch(() => undefined);
  };

  return (
    <ListItem
      disablePadding
      css={classes.listItem}
    >
      <ListItemButton
        aria-current={isSelected ? 'page' : undefined}
        css={classes.itemButton(open, isLevel2, isActiveGroup, tokens)}
        onClick={() => handleCloseItem(subMenu)}
        onFocus={handlePreload}
        onMouseEnter={handlePreload}
        onTouchStart={handlePreload}
        selected={isSelected}
      >
        <Tooltip
          placement="right"
          title={open ? '' : subMenu.label}
        >
          <ListItemIcon css={classes.icon(open, isLevel2)}>
            {subMenu.icon}
          </ListItemIcon>
        </Tooltip>
        <ListItemText
          css={[classes.itemText, { opacity: open ? 1 : 0 }]}
          primary={subMenu.label}
        />
        {!!badgeCount && open && (
          <Box component="span" css={classes.badge(tokens)}>
            {/* a wide figure pushes the label it sits next to out of line, and reads no better */}
            {badgeCount > NOTIFICATION_BADGE_MAX ? `${NOTIFICATION_BADGE_MAX}+` : badgeCount}
          </Box>
        )}
        {!!subMenu.subMenus && open && (
          <Box css={classes.chevron(isSubMenuOpen)}>
            <SidebarChevronIcon />
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default SideBarItem;
