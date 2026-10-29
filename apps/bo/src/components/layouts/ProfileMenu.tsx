import {
  Box, MenuItem, Menu, Divider, ListItemIcon, Typography, Button,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiChevronDown, FiChevronUp, FiInfo, FiPower, FiUser,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import { PROFILE_MENU_WIDTH } from '@/constants/_core/ui/entity.constants';
import {
  APPBAR_COMPACT_BREAKPOINT, FONT_SIZE_BODY, FONT_SIZE_META, FONT_SIZE_OVERLINE, RADIUS,
} from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { goToLogout } from '@/redux/actions/_core/auth.action';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getCuttedFirstName, getUserFullName } from '@/utils/_core/user.utils';

// the toolbar avatar sits inside a 34px-tall action row, the menu header one is the panel's anchor
const TOOLBAR_AVATAR_SIZE = 30;
const MENU_AVATAR_SIZE = 48;

const sx = {
  trigger: {
    gap: 0.75,
    minWidth: 0,
    padding: '4px 6px',
    borderRadius: `${RADIUS}px`,
    color: 'text.secondary',
    textTransform: 'capitalize',
  },
  triggerAvatar: {
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: 600,
  },
  profileLabel: {
    fontSize: FONT_SIZE_BODY,
    fontWeight: 500,
    color: 'text.secondary',
  },
  menuPaper: {
    width: PROFILE_MENU_WIDTH,
    mt: 1,
  },
  menuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    p: 2,
    minWidth: 0,
  },
  // both lines truncate rather than wrap — a long name must not stretch the panel out of shape
  menuHeaderText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    '& > *': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  menuHeaderName: {
    fontSize: FONT_SIZE_BODY,
    fontWeight: 600,
    color: 'text.primary',
  },
  menuHeaderUsername: {
    fontSize: FONT_SIZE_META,
    color: 'text.secondary',
  },
  menuItemIcon: {
    minWidth: 0,
    mr: 1,
    color: 'text.secondary',
  },
};

const ProfileMenu = () => {
  const currentUser = useSelector(getAppCurrentUserSelector);
  // the first name + chevron only fit next to the full-width search field, which needs the same room
  const isCompactHeader = useBreakpoint(APPBAR_COMPACT_BREAKPOINT);
  const {
    t,
  } = useTranslation(['user', 'common']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate(goToLogout());
  };

  const handleGoToProfile = () => {
    navigate({ to: PATH_NAMES.profile });
  };

  const handleGoToAbout = () => {
    navigate({ to: PATH_NAMES.about });
  };

  if (!currentUser) return null;

  return (
    <Box>
      <Button
        className="flexRow alignCenter"
        color="inherit"
        onClick={handleOpen}
        sx={sx.trigger}
      >
        <Avatar size={TOOLBAR_AVATAR_SIZE} sx={sx.triggerAvatar} user={currentUser} />
        {!isCompactHeader && (
          <>
            <Typography sx={sx.profileLabel}>{getCuttedFirstName(currentUser)}</Typography>
            {open
              ? <FiChevronUp size={16} />
              : <FiChevronDown size={16} />}
          </>
        )}
      </Button>

      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="account-menu"
        onClick={handleClose}
        onClose={handleClose}
        open={open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: sx.menuPaper,
          },
        }}
      >
        {/* identity header — not a menu item, it is not actionable */}
        <Box sx={sx.menuHeader}>
          <Avatar size={MENU_AVATAR_SIZE} user={currentUser} />
          <Box sx={sx.menuHeaderText}>
            <Typography sx={sx.menuHeaderName}>{getUserFullName(currentUser)}</Typography>
            <Typography sx={sx.menuHeaderUsername}>{currentUser.username}</Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={handleGoToProfile}>
          <ListItemIcon sx={sx.menuItemIcon}>
            <FiUser size={16} />
          </ListItemIcon>
          {t('user:myProfile')}
        </MenuItem>
        <MenuItem onClick={handleGoToAbout}>
          <ListItemIcon sx={sx.menuItemIcon}>
            <FiInfo size={16} />
          </ListItemIcon>
          {t('common:about.title')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={sx.menuItemIcon}>
            <FiPower size={16} />
          </ListItemIcon>
          {t('user:logout')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
