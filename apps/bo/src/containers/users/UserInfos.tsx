import {
  Badge, Box, Stack, type StackOwnProps, type Theme, Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';

import Avatar from '@/components/Avatar';
import Link from '@/components/Link';
import { IUser } from '@/types/user.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { getUserFullName } from '@/utils/user.utils';

const classes = {
  badge: (theme: Theme) => ({
    '& .MuiBadge-badge': {
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      } as const,
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }),
  badgeOn: (theme: Theme) => ({
    '& .MuiBadge-badge': {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.main,
    },
  }),
  badgeOff: (theme: Theme) => ({
    '& .MuiBadge-badge': {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.main,
    },
  }),
};

type Props = {
  user: IUser;
  direction?: StackOwnProps['direction'];
};

const UserInfo = ({
  user, direction = 'column',
}: Props) => {
  return (
    <Stack
      direction={direction}
      sx={{ alignItems: direction === 'column' ? 'center' : 'flex-start' }}
      spacing={direction === 'column'
        ? 0
        : 1}
    >
      <div className={direction === 'column'
        ? 'flexRow'
        : 'flexCenter stretchSelf'}
      >
        <Badge
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          overlap="circular"
          variant="dot"
          css={[
            classes.badge,
            user.get('isOnline')
              ? classes.badgeOn
              : classes.badgeOff,
          ]}
        >
          <Avatar
            user={user}
            size={direction === 'column'
              ? 64
              : 32}
          />
        </Badge>
      </div>
      <div>
        <Box sx={{ mt: direction === 'column' ? 1 : 0 }}>
          <Typography
            variant="h6"
            sx={{
              textAlign: direction === 'column'
                ? 'center'
                : 'left',
            }}
          >
            <Link
              css={{ textDecoration: 'none', color: '#000' }}
              params={{ id: user.id }}
              to={PATH_NAMES.users + '/$id'}
            >
              {getUserFullName(user)}
            </Link>
          </Typography>
        </Box>
        <div>
          <Typography sx={{ color: grey[500] }}>{user.get('username')}</Typography>
        </div>
      </div>
    </Stack>
  );
};

export default UserInfo;
