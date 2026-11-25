import { useTheme } from '@mui/material';
import { Link } from '@tanstack/react-router';

import { WORKSPACES } from '@/constants/_core/workspace.constants';
import { getHostWorkspace } from '@/utils/_core/workspace.utils';

type Props = {
  width?: number;
  // when set, the logo scales by height instead of width — used by the app bar's fixed toolbar row
  height?: number;
  // 'white' forces the light-on-dark logo, for surfaces that stay dark regardless of app theme (the sidebar)
  variant?: 'auto' | 'white';
  // false renders the bare image — for pages mounted above the router, where a Link cannot resolve
  isLinked?: boolean;
  /*
   * the files to draw — the logo of the workspace the address was opened on when left out (the only one
   * known before sign-in): one for a light surface, one for a dark one
   */
  images?: { default: string; white: string };
};

const Logo = ({
  width = 80, height, variant = 'auto', isLinked = true, images = WORKSPACES[getHostWorkspace()].logo,
}: Props) => {
  const theme = useTheme();

  const isLight = variant === 'auto' && theme.palette.mode === 'light';

  const image = (
    <img
      alt="logo"
      css={{
        width: height
          ? 'auto'
          : width,
        height,
      }}
      src={isLight
        ? images.default
        : images.white}
    />
  );

  if (!isLinked) return image;

  return (
    <Link css={{ lineHeight: 1 }} to="/">
      {image}
    </Link>
  );
};

export default Logo;
