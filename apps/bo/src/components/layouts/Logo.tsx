import { styled, useTheme } from '@mui/material';
import { Link } from '@tanstack/react-router';

import { IMAGES } from '@/utils/constants';

export const StyledLogo = styled('img')(({
  theme,
}) => ({
  [theme.breakpoints.down('sm')]: { width: 75 },
  [theme.breakpoints.between('sm', 'md')]: { width: 90 },
  [theme.breakpoints.between('md', 'lg')]: { width: 100 },
  width: '40%',
}));

const Logo = () => {
  const theme = useTheme();

  return (
    <Link to="/">
      <StyledLogo
        alt="logo"
        src={theme.palette.mode === 'light'
          ? IMAGES.defaultLogo
          : IMAGES.whiteLogo}
      />
    </Link>
  );
};

export default Logo;
