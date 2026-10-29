import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, type Theme, type CSSObject } from '@mui/material/styles';
import { Outlet } from '@tanstack/react-router';
import { SnackbarProvider } from 'notistack';
import { useCallback, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';

import Loading from '@/components/Loading';
import Logo from '@/components/Logo';
import ScreenSizeIndicator from '@/components/ScreenSizeIndicator';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { getAppLoadingSelector } from '@/redux/reducers/app.reducer';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/role.reducer';
import { changeIsSideBarOpenSlice,
  getSettingsIsSideBarOpenSelector } from '@/redux/reducers/settings.reducer';
import { DOWNLOAD_ALERTS_LIMIT, RESPONSIVE_BREAKPOINT, SIDEBAR_WIDTH } from '@/utils/constants';

import SnackBars from './SnackBars';
import AppBar from '../components/layouts/AppBar';
import SideBar from '../components/layouts/sidebar/SideBar';


const openedMixin = (theme: Theme): CSSObject => ({
  [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: { width: SIDEBAR_WIDTH },
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100vw' },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: { width: `calc(${theme.spacing(8)} + 1px)` },
});

const DrawerHeader = styled('div')(({
  theme,
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(({
  theme, open,
}) => ({
  // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
  [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: { width: SIDEBAR_WIDTH },
  // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100%' },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme),
      [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: {
        borderRightWidth: theme.palette.mode === 'dark'
          ? 0
          : 1,
        width: SIDEBAR_WIDTH, // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
      },
      // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
      [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100%' },
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
      [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: {
        borderRightWidth: theme.palette.mode === 'dark'
          ? 0
          : 1,
      },
    },
  }),
}));

type StyledMainProps = {
  theme?: Theme;
  open: boolean;
};
const StyledMain = styled('main', { shouldForwardProp: prop => prop !== 'open' })<StyledMainProps>(({
  theme, open,
}) => ({
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
    display: open
      ? 'none'
      : 'block',
    paddingTop: 6,
  },
}));

const classes = {
  main: (theme: Theme) => ({
    flexGrow: 1,
    paddingBottom: theme.spacing(3),
    minHeight: '100vh',
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(3),
    },
  }),
  iconContainer: (theme: Theme) => ({
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(2),
    },
  }),
  drawer: (open: boolean) => (theme: Theme) => {
    return {
      [theme.breakpoints.between('xs', 'xl')]: {
        display: open
          ? 'block'
          : 'none',
      },
      [theme.breakpoints.up('xl')]: { display: 'block' },
      boxShadow: 'none',
      border: 'none',
      '& .MuiPaper-root': {
        borderColor: 'none',
        '&::-webkit-scrollbar': { width: 6 },

        /* Track */
        '&::-webkit-scrollbar-track': {
          boxShadow: 'inset 0 0 5px grey',
          borderRadius: 6,
          display: 'none',
          transition: 'background .2s linear,display .2s ease-in-out',
          WebkitTransition: 'background .2s linear,display .2s ease-in-out',
        },

        /* Handle */
        '&::-webkit-scrollbar-thumb': {
          background: '#aaa',
          borderRadius: 6,
          display: 'none',
          transition: 'background .2s linear,display .2s ease-in-out',
          WebkitTransition: 'background .2s linear,display .2s ease-in-out',
        },

        /* Handle on hover */
        '&:hover::-webkit-scrollbar-thumb, &:hover::-webkit-scrollbar-track ': { display: 'block' },
      },
    };
  },
};

const DashboardLayout = () => {
  const loading = useSelector(getAppLoadingSelector);

  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const isSideBarOpen = useSelector(getSettingsIsSideBarOpenSelector);
  const dispatch = useDispatch();
  const isDesktopDown = useBreakpoint();

  const handleDrawerOpen = useCallback(() => {
    dispatch(changeIsSideBarOpenSlice(true));
  }, [dispatch]);

  const handleDrawerClose = () => {
    dispatch(changeIsSideBarOpenSlice(false));
  };

  useEffect(() => {
    if (isDesktopDown) return;
    handleDrawerOpen();
  }, [isDesktopDown, handleDrawerOpen]);

  return (
    <SnackbarProvider maxSnack={DOWNLOAD_ALERTS_LIMIT}>
      <Box sx={{ display: 'flex' }}>
        <Loading loading={loading} />
        <CssBaseline />
        {/* ---------- left (sidebar ) ---------- */}
        <Drawer
          css={classes.drawer(isSideBarOpen)}
          ModalProps={{ keepMounted: true }}
          open={isSideBarOpen}
          variant="permanent"
        >
          <DrawerHeader>
            {/* menu icon */}
            {!isSideBarOpen
              ? (
                <Box className="flexCenter" sx={{ alignSelf: 'stretch', flex: 1 }}>
                  <IconButton onClick={handleDrawerOpen}>
                    <FiMenu />
                  </IconButton>
                </Box>
              )
              : (
                <div
                  className="flexRow stretchSelf spaceBetween center flex1"
                  css={classes.iconContainer}
                >
                  <Logo />
                  <IconButton onClick={handleDrawerClose}>
                    <FiMenu />
                  </IconButton>
                </div>
              )}
          </DrawerHeader>
          {/* left sidebar */}
          <SideBar onClose={handleDrawerClose} open={isSideBarOpen} roles={roles} />
        </Drawer>

        {/* ------- right (main content ) ------- */}
        <StyledMain
          className="flexColumn positionRelative"
          css={classes.main}
          open={isSideBarOpen}
        >
          {/* top app bar */}
          <AppBar onOpenDrawer={handleDrawerOpen} />
          <DrawerHeader />
          <Box
            className="flexColumn stretchSelf flex1"
            sx={{
              p: { xs: 1.2, lg: 2 },
              mb: { xs: 2, lg: 4 },
              pt: 0,
              borderRadius: 1,
            }}
          >
            <Outlet />
          </Box>
        </StyledMain>
        {/* <SnackBar open={!!error} message={error} severity="error" toggle={toggleSnackBar} />
        <SnackBar open={!!infoMessage} message={infoMessage} severity="info" toggle={toggleSnackBar} />
        <SnackBar open={!!message} message={message} severity="success" toggle={toggleSnackBar} /> */}
        <SnackBars />
        {window.IS_LOCAL && <ScreenSizeIndicator />}
      </Box>
    </SnackbarProvider>
  );
};

export default DashboardLayout;
