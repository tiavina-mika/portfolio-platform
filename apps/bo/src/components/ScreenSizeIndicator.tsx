import {
  useTheme, Box, Typography, useMediaQuery,
  Theme,
} from '@mui/material';

import {
  SCREEN_SIZE_INDICATOR_BOTTOM, SCREEN_SIZE_INDICATOR_Z_INDEX,
} from '@/constants/_core/ui/page.constants';
import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';

type IsSize = {
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl?: boolean;
  is2xl: boolean;
};

const getLabel = ({
  isXs, isSm, isMd, isLg, is2xl,
}: IsSize): string => {
  let activeBreakpoint = 'xl';

  if (isXs) activeBreakpoint = 'xs';
  else if (isSm) activeBreakpoint = 'sm';
  else if (isMd) activeBreakpoint = 'md';
  else if (isLg) activeBreakpoint = 'lg';
  else if (is2xl) activeBreakpoint = '2xl';

  return activeBreakpoint;
};

const classes = {
  screenSizeIndicator: (theme: Theme) => ({
    position: 'fixed' as const,
    bottom: SCREEN_SIZE_INDICATOR_BOTTOM,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: '50%',
    zIndex: SCREEN_SIZE_INDICATOR_Z_INDEX, // above the TanStack Router devtools toggle
    backgroundColor: theme.palette.common.black,
  }),
  /*
   * the label color is set here rather than inherited from the badge: the caption typography
   * variant carries a fixed muted tint, which would otherwise render dark grey text on the dark
   * badge background
   */
  label: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    color: theme.palette.common.white,
  }),
};

const ScreenSizeIndicator = () => {
  const theme = useTheme();

  // Define breakpoint queries
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const is2xl = useMediaQuery(theme.breakpoints.only('2xl'));

  return (
    <Box
      className="flexCenter"
      css={classes.screenSizeIndicator}
    >
      <Typography css={classes.label} variant="caption">
        {getLabel({
          isXs,
          isLg,
          isMd,
          isSm,
          is2xl,
        })}
      </Typography>
    </Box>
  );
};

export default ScreenSizeIndicator;
