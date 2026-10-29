import { Divider, styled } from '@mui/material';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { getSettingsIsSideBarOpenSelector } from '@/redux/reducers/settings.reducer';
import { RESPONSIVE_BREAKPOINT, SIDEBAR_WIDTH, TOOLBAR_SMALL_SCREEN_HEIGHT } from '@/utils/constants';

import Logo from './Logo';
import NotificationIcons from './notifications/NotificationIcons';
import ProfileMenu from './ProfileMenu';

interface IAppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(MuiAppBar, { shouldForwardProp: prop => prop !== 'open' })<IAppBarProps>(({
  theme,
}) => ({
  backgroundColor: theme.palette.background.default,
  color: 'rgba(0, 0, 0, 0.87)',
  backgroundImage: 'inherit',
  marginLeft: theme.spacing(7),

  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  ...theme.applyStyles('dark', {
    backgroundImage: 'none',
  }),

  variants: [{
    props: (
      {
        open,
      }
    ) => open,

    style: {
      [theme.breakpoints.up('sm')]: { boxShadow: 'none' },
      [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: {
        marginLeft: SIDEBAR_WIDTH,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
      },
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }],
}));

const StyledToolbar = styled(Toolbar)(({
  theme,
}) => ({
  [theme.breakpoints.down('md')]: {
    height: TOOLBAR_SMALL_SCREEN_HEIGHT,
    paddingLeft: 3,
    width: '100vw',
  },
}));

type Props = {
  onOpenDrawer: () => void;
};

const AppBar = ({
  onOpenDrawer,
}: Props) => {
  const isSideBarOpen = useSelector(getSettingsIsSideBarOpenSelector);
  const {
    location,
  } = useRouterState();
  const isDesktopDown = useBreakpoint();
  const router = useRouter();

  // go back (left button) click
  const handleGoBack = () => router.history.back();

  return (
    (
      <StyledAppBar elevation={1} open={isSideBarOpen} position="fixed">
        <StyledToolbar>
          {/* ------- hamburger menu ------- */}
          <Box
            sx={[{
              order: { xs: 1, xl: 0 },
              marginRight: { xs: 0, xl: 5 },
            }, isSideBarOpen ? {
              display: 'none',
            } : {
              display: 'block',
            }]}
          >
            <IconButton
              aria-label="open drawer"
              className="flexCenter"
              color="inherit"
              edge="start"
              onClick={onOpenDrawer}
            >
              <FiMenu size={30} />
            </IconButton>
          </Box>

          {/* ----- back button ----- */}
          {location.pathname !== '/' && (
            <IconButton onClick={handleGoBack} sx={{ mr: { xs: 1, lg: 0 } }}>
              <FiArrowLeft />
            </IconButton>
          )}
          {isDesktopDown && <Logo />}

          {/* ----- right ----- */}
          <Box sx={{ flexGrow: 1 }} />
          {/* ------------ right appBar ------------ */}
          {/* ------------ notifications ----------- */}
          <NotificationIcons />

          {/* responsive */}
          <Divider orientation="vertical" sx={{ height: 28, display: { xs: 'none', lg: 'block' } }} />
          <Box sx={{ ml: { xs: 0, lg: 1 } }}>
            <ProfileMenu />
          </Box>
        </StyledToolbar>
      </StyledAppBar>
    )
  );
};

export default AppBar;
