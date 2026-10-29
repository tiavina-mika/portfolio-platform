
import {
  alpha, Box, type Theme, Tooltip, Typography,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ReactNode } from 'react';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import { ISubMenu } from './SideBar';

const sx = {
  notification: (open: boolean) => ({
    px: 0.8,
    pt: 0.5,
    pb: 0.3,
    borderRadius: 2,
    position: 'absolute',
    right: open
      ? 0
      : -8,
    top: open
      ? -10
      : -16,
  }),
};

const classes = {
  listItem: {
    display: 'block',
    position: 'relative' as const,
  },
  itemButton: (open: boolean, isLevel2: boolean) => (theme: Theme) => ({
    justifyContent: open
      ? 'initial'
      : 'center',
    paddingLeft: isLevel2
      ? 28
      : 24,
    paddingRight: 24,
    height: 56,
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        opacity: 0.9,
      },
    },
  }),
  icon: (open: boolean) => ({
    minWidth: 0,
    marginRight: open
      ? 12
      : 'auto',
    justifyContent: 'center',
  }),
  selectedIcon: (theme: Theme) => ({ color: theme.palette.primary.main }),
  unselectedIcon: (theme: Theme) => ({
    color: theme.palette.mode === 'dark'
      ? '#fff'
      : '#000',
  }),
  itemText: {
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 1.5,
    color: '#000',
    '& > span': { fontWeight: 500 },
  },
  isSelectedItemText: {},
};

type Props = {
  open: boolean;
  subMenu: ISubMenu;
  rightIcon?: ReactNode;
  isLevel2?: boolean;
  isSelected?: boolean;
  onClose: () => void;
};

const SideBarItem = ({
  open, subMenu, rightIcon, isSelected, onClose, isLevel2 = false,
}: Props) => {
  const isDesktopDown = useBreakpoint();

  const handleCloseItem = (subMenu: ISubMenu) => {
    if (!isDesktopDown) {
      // redirect to the page
      subMenu.onClick();
      return;
    }

    // close the sidebar when clicking on it
    onClose();
    // then redirect to the page
    subMenu.onClick();
  };

  return (
    <ListItem
      disablePadding
      css={classes.listItem}
      secondaryAction={
        subMenu.notification && subMenu.notification > 0
          ? (
            <Box bgcolor="#F61011" className="flexCenter" sx={sx.notification(open)}>
              <Typography css={{ color: '#fff', fontSize: 13, p: 0, lineHeight: 1 }}>
                {subMenu.notification}
              </Typography>
            </Box>
          )
          : null
      }
    >
      <ListItemButton
        css={classes.itemButton(open, isLevel2)}
        selected={isSelected}
        onClick={() => handleCloseItem(subMenu)}
      >
        <Tooltip
          placement="right"
          title={open
            ? ''
            : subMenu.label}
        >
          <ListItemIcon
            css={[classes.icon(open), isSelected
              ? classes.selectedIcon
              : classes.unselectedIcon]}
          >
            {subMenu.icon}
          </ListItemIcon>
        </Tooltip>
        <ListItemText
          primary={subMenu.label}
          css={[classes.itemText, {
            opacity: open
              ? 1
              : 0,
          }, isSelected
            ? classes.isSelectedItemText
            : null]}
        />
        {rightIcon}
      </ListItemButton>
    </ListItem>
  );
};

export default SideBarItem;
