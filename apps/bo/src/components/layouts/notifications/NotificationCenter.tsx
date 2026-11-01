import {
  Badge, Box, Chip, Divider, IconButton, Menu, MenuItem, Theme, Tooltip, Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiBell, FiMessageCircle, FiUserPlus,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { COLLECTIONS, NOTIFICATION_COLLECTIONS } from '@/constants/_core/app.constants';
import { NOTIFICATION_MENU_WIDTH } from '@/constants/_core/ui/inbox.constants';
import { APPBAR_ICON_BUTTON_SIZE, BADGE_FONT_SIZE, FONT_SIZE_BODY } from '@/constants/_core/ui/ui.constants';
import { goToList } from '@/redux/actions/_core/util.action';
import { getAppNotificationsSelector } from '@/redux/reducers/_core/app.reducer';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { canAccessTo } from '@/utils/_core/role.utils';

const sx = {
  bellButton: {
    width: APPBAR_ICON_BUTTON_SIZE,
    height: APPBAR_ICON_BUTTON_SIZE,
    color: 'text.secondary',
    '&:hover': { color: 'text.primary' },

    /*
     * a compact counter pinned to the bell's top-right corner — the ring in the app bar's own
     * surface color keeps it readable where it overlaps the icon
     */
    '& .MuiBadge-badge': {
      minWidth: 15,
      height: 15,
      padding: '0 3px',
      borderRadius: '8px',
      fontSize: BADGE_FONT_SIZE,
      fontWeight: 600,
      border: (theme: Theme) => `1.5px solid ${theme.palette.background.paper}`,
    },
  },
  menuPaper: { width: NOTIFICATION_MENU_WIDTH, mt: 1 },
  menuTitle: {
    px: 1.75,
    py: 1.25,
    fontSize: FONT_SIZE_BODY,
  },
  option: {
    gap: 1.25,
    // icons stay a tone below their label so the row reads label-first
    '& svg': { color: 'text.secondary' },
  },
};

interface IOption {
  icon: ReactNode;
  color: 'info' | 'error' | 'secondary' | 'primary' | 'success' | 'warning';
  key: typeof NOTIFICATION_COLLECTIONS[number];
  label: string;
  onClick: () => void;
}

/**
 * Single bell icon + dropdown panel unifying the "new items to review" badges (previously one
 * separate icon per collection in the AppBar) into one flow filterable by type, per the audit's
 * BlaBlaCar/Grab-style notification center recommendation. Counts stay real-time — they come from
 * the same store slice kept in sync by useNotificationCountsLiveQuery (mounted in DashboardLayout).
 */
const NotificationCenter = () => {
  const { t } = useTranslation(['common', 'route']);
  const navigate = useNavigate();
  const notifications = useSelector(getAppNotificationsSelector);
  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const goToInbox = () => navigate(goToList('contacts'));

  const allNotificationOptions: IOption[] = [
    {
      icon: <FiMessageCircle />,
      color: 'primary',
      key: COLLECTIONS.contact, // collection name
      label: t('user:contacts.contacts'),
      /*
       * the contacts page has no "new messages" scope to open: unread messages already stand in
       * bold at the top of its list
       */
      onClick: goToInbox,
    },
    {
      icon: <FiUserPlus />,
      color: 'secondary',
      key: COLLECTIONS.user, // collection name
      label: t('user:users'),
      onClick: () => navigate(goToList('users', { tab: t('route:tabs.news') })),
    },
  ];

  // only show/count collections the admin's role(s) grant read access to — same rule as SideBar
  const notificationOptions = allNotificationOptions.filter(
    (option) => canAccessTo(roles, option.key)
  );

  const totalCount = notificationOptions.reduce((sum, option) => sum + (notifications[option.key] ?? 0), 0);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (option: IOption) => {
    option.onClick();
    handleClose();
  };

  return (
    <Box className="flexRow alignCenter">
      <Tooltip title={t('common:notifications')}>
        <IconButton color="inherit" onClick={handleOpen} sx={sx.bellButton}>
          <Badge badgeContent={totalCount} color="error" max={99}>
            <FiBell size={18} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={handleClose}
        open={open}
        slotProps={{ paper: { sx: sx.menuPaper } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Typography sx={sx.menuTitle} variant="subtitle1">
          {t('common:notifications')}
        </Typography>
        <Divider />
        {notificationOptions.map((option) => {
          const count = notifications[option.key] ?? 0;

          return (
            <MenuItem
              className="flexRow spaceBetween alignCenter"
              key={option.key}
              onClick={() => handleSelect(option)}
            >
              <Box className="flexRow alignCenter" sx={sx.option}>
                {option.icon}
                <Typography variant="body2">{option.label}</Typography>
              </Box>
              {count > 0 && (
                <Chip color={option.color} label={t('common:newCount', { count })} size="small" />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default NotificationCenter;
