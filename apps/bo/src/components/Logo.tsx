import { useTheme } from '@mui/material';
import { Link } from '@tanstack/react-router';

import { IMAGES } from '@/utils/constants';

type Props = {
  width?: number;
};

const Logo = ({ width = 60 }: Props) => {
  const theme = useTheme();

  return (
    <Link css={{ lineHeight: 1 }} to="/">
      <img
        alt="logo"
        css={{ width }}
        src={theme.palette.mode === 'light'
          ? IMAGES.defaultLogo
          : IMAGES.whiteLogo}
      />
    </Link>
  );
};

export default Logo;
