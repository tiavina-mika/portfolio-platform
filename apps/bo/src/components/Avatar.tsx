import {
  useTheme, SxProps, Theme,
} from '@mui/material';
import MUIAvatar from '@mui/material/Avatar';

import { FONT_SIZE_META, RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';
import { IUser } from '@/types/_core/user.type';
import { getUserFullName, getUserFullNameAbbreviation } from '@/utils/_core/user.utils';


const SIZE = 56;

type Props = {
  user: IUser;
  size?: number;
  sx?: Omit<SxProps<Theme>, 'size' | 'bgcolor'>;
  /**
   * Set it where the name is already written beside the disc — a list row, a header. The picture
   * then adds nothing to read, and repeating the name makes a screen reader say it twice.
   */
  isNameShown?: boolean;
};

/*
 * `sx` is a union that includes a theme callback and an array, so the caller's styles are appended
 * as an array entry rather than spread into the base object: spreading a callback yields none of
 * its own properties, which silently dropped every style a caller passed as a function.
 */
const mergeSx = (base: SxProps<Theme>, sx?: Omit<SxProps<Theme>, 'size' | 'bgcolor'>): SxProps<Theme> => [
  base,
  ...(Array.isArray(sx)
    ? sx
    : [sx]),
] as SxProps<Theme>;

const Avatar = ({
  user, size = SIZE, sx, isNameShown = false,
}: Props) => {
  const theme = useTheme();

  if (!user.image) {
    return (
      <MUIAvatar
        sx={mergeSx({
          width: size,
          height: size,
          /*
           * initials sit on a gradient rather than on a flat fill: a wall of identical solid discs
           * down a column reads as a pattern, and the shading is what lets one face be told from
           * the next while every one of them stays the same colour
           */
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ` +
            `${theme.palette.primary.dark})`,
          color: theme.palette.primary.contrastText,
          // initials default a step down on small screens; a caller's own fontSize still wins
          [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { fontSize: FONT_SIZE_META },
        }, sx)}
      >
        {getUserFullNameAbbreviation(user)}
      </MUIAvatar>
    );
  }

  return (
    <MUIAvatar
      alt={isNameShown ? '' : getUserFullName(user)}
      src={user.image.url}
      sx={mergeSx({ width: size, height: size }, sx)}
    />
  );
};

export default Avatar;
