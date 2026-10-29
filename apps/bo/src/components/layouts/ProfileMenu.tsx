import {
  Box, MenuItem, Menu, Divider, ListItemIcon, Typography, useTheme, Button, type Theme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiChevronDown, FiChevronUp, FiPower, FiUser,
} from 'react-icons/fi';
import { IoPersonCircle } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { goToLogout } from '@/redux/actions/auth.action';
import { getAppCurrentUserSelector } from '@/redux/reducers/app.reducer';
import { PATH_NAMES } from '@/utils/pathnames';
import { getCuttedFirstName, getUserFullName } from '@/utils/user.utils';

const AVATAR_SIZE = 60;

const getIconColor = (theme: Theme): string => (theme.palette.mode === 'light'
  ? '#000'
  : '#fff');

const sx = {
  profileLabel: {
    px: 1,
    color: (theme: Theme): string => (theme.palette.mode === 'light'
      ? grey[600]
      : '#fff'),
    fontWeight: 500,
  },
};

const ProfileMenu = () => {
  const currentUser = useSelector(getAppCurrentUserSelector);
  const theme = useTheme();
  const isDesktopDown = useBreakpoint();
  const {
    t,
  } = useTranslation(['user']);
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
    navigate({ to: PATH_NAMES.profile } as any);
  };

  if (!currentUser) return null;

  return (
    <Box>
      <Button
        className="flexRow alignCenter"
        color="inherit"
        sx={{ textTransform: 'capitalize' }}
        onClick={handleOpen}
      >
        <Avatar
          user={currentUser}
          size={isDesktopDown
            ? 24
            : 32}
        />
        {!isDesktopDown && (
          <>
            {currentUser && <Typography sx={sx.profileLabel}>{getCuttedFirstName(currentUser)}</Typography>}
            {open
              ? (
                <FiChevronUp color={getIconColor(theme)} size={18} />
              )
              : (
                <FiChevronDown color={getIconColor(theme)} size={18} />
              )}
          </>
        )}
      </Button>

      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="account-menu"
        open={open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 300,
              px: { xs: 0, xl: 2 },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem disableRipple className="flexCenter">
          <div
            css={{ marginTop: 6 }}
            className={isDesktopDown
              ? 'flexRow'
              : 'flexCenter'}
          >
            {currentUser.get('image')
              ? (
                <div
                  className="flexCenter"
                  css={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }}
                >
                  <IoPersonCircle color={theme.palette.primary.main} size={AVATAR_SIZE} />
                </div>
              )
              : (
                <Avatar size={60} user={currentUser} />
              )}
            <Box
              sx={{ mt: 1.5, mb: 1, ml: { xs: 1, xl: 0 } }}
              className={isDesktopDown
                ? 'flexColumn'
                : 'flexCenter'}
            >
              <Typography sx={{ mb: 0.5 }} variant="h6">
                {getUserFullName(currentUser)}
              </Typography>
              <Typography variant="body2">{currentUser.get('username')}</Typography>
            </Box>
          </div>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleGoToProfile}>
          <ListItemIcon>
            <FiUser />
          </ListItemIcon>
          <Typography variant="subtitle1">{t('user:myProfile')}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <FiPower />
          </ListItemIcon>
          <Typography variant="subtitle1">{t('user:logout')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
