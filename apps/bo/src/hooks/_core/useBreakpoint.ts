import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';

import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';

export const useBreakpoint = (breakpoint: number | Breakpoint = RESPONSIVE_BREAKPOINT): boolean => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(breakpoint));

  return isSmallScreen;
};
