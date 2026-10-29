import {
  useTheme, Box, Typography, useMediaQuery,
  type Theme,
} from '@mui/material';

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
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: '50%',
    zIndex: theme.zIndex.tooltip, // Ensure it stays on top
    backgroundColor: '#000',
    color: '#fff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#fff',
      color: '#000',
    }) as Record<string, string>,
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
      <Typography css={{ fontSize: 14 }} variant="caption">
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
