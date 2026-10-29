import {
  useTheme, type SxProps, type Theme,
} from '@mui/material';
import MUIAvatar from '@mui/material/Avatar';

import { IUser } from '@/types/user.type';
import { RESPONSIVE_BREAKPOINT } from '@/utils/constants';
import { getUserFullName, getUserFullNameAbbreviation } from '@/utils/user.utils';


const SIZE = 56;

const classes = {
  avatar: (theme: Theme) => ({
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { '&.MuiAvatar-root': { fontSize: 14 } },
  }),
};

type Props = {
  user: IUser;
  size?: number;
  sx?: Omit<SxProps<Theme>, 'size' | 'bgcolor'>;
};

const Avatar = ({
  user, size = SIZE, sx,
}: Props) => {
  const theme = useTheme();

  if (!user.has('image')) {
    return (
      <MUIAvatar
        css={classes.avatar}
        sx={{ width: size, height: size, bgcolor: theme.palette.primary.main, ...sx }}
      >
        {getUserFullNameAbbreviation(user)}
      </MUIAvatar>
    );
  }

  return <MUIAvatar alt={getUserFullName(user)} src={(user.get('image')!).url} sx={{ width: size, height: size, ...sx }} />;
};

export default Avatar;
