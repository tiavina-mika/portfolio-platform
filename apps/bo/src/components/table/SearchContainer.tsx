import {
  Box, IconButton, Stack, type SxProps, type Theme,
} from '@mui/material';
import {
  ReactNode, useCallback, useEffect, useState,
} from 'react';
import { FiSearch } from 'react-icons/fi';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { TOOLBAR_SMALL_SCREEN_HEIGHT } from '@/utils/constants';

type Props = {
  children?: ReactNode; // if in recycleBin page
  sx?: SxProps<Theme>;
  className?: string;
};

const SearchContainer = ({
  children, sx, className,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggle = useCallback(() => setOpen(!open), [open]);

  const isSmDown = useBreakpoint();

  useEffect(() => {
    if (isSmDown) return;
    // open by default in desktop
    setOpen(true);
  }, [isSmDown, toggle]);

  return (
    <>
      {isSmDown && (
        <IconButton
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: 40,
            top: { xs: TOOLBAR_SMALL_SCREEN_HEIGHT, sm: TOOLBAR_SMALL_SCREEN_HEIGHT + 6 },
          }}
        >
          <FiSearch />
        </IconButton>
      )}
      {open && (
        <Box className={className} sx={{ my: { xs: 1, lg: 4 }, ...sx }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={{ xs: 1, lg: 0 }}

            sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}
          >
            {children}
          </Stack>
        </Box>
      )}
    </>
  );
};

export default SearchContainer;
