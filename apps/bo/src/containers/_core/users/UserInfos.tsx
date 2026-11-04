import {
  Badge, Box, Stack, StackOwnProps, Theme, Typography,
} from '@mui/material';

import type { ReactNode } from 'react';

import Avatar from '@/components/Avatar';
import Link from '@/components/Link';
import { PERSON_ROW_IDENTITY_GAP } from '@/constants/_core/ui/entity.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import { IUser } from '@/types/_core/user.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

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
  contactType?: 'email' | 'phone';
  // how large the face is drawn — a person a block is about is shown larger than one it only names
  size?: number;
  // what qualifies the person in the record being read: the seats they booked, the score they hold
  badge?: ReactNode;
  /*
   * the line under the name. It replaces the contact line rather than adding to it: where a block
   * states what the person did on this record, the phone number is not the fact worth the row
   */
  meta?: ReactNode;
  // a second line under `meta`, for what is too wide to join the facts (a leg with two ends)
  detail?: ReactNode;
  // what acts on the person from here — the way to their account, most of the time
  actions?: ReactNode;
};

/**
 * A person as a block: their face, their name linking to their account, and — where the caller
 * gives them — a qualifier next to the name, a line of facts under it, and what acts on them at
 * the far end of the row.
 */
const UserInfo = ({
  user,
  direction = 'column',
  contactType = 'phone',
  size,
  badge,
  meta,
  detail,
  actions,
}: Props) => {
  const isColumn = direction === 'column';
  const avatarSize = size ?? (isColumn
    ? 64
    : 34);

  return (
    <Stack
      direction={direction}
      spacing={direction === 'column'
        ? 0
        : 2}
      sx={{
        // the face, the identity and the trailing actions sit on one baseline in either direction
        alignItems: 'center',
        width: actions
          ? '100%'
          : undefined,
      }}
    >
      <div className={isColumn
        ? 'flexRow'
        : 'flexCenter stretchSelf'}
      >
        <Badge
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          overlap="circular"
          variant="dot"
          css={[
            classes.badge,
            user.isOnline
              ? classes.badgeOn
              : classes.badgeOff,
          ]}
        >
          <Avatar size={avatarSize} user={user} />
        </Badge>
      </div>
      <div css={{ flex: actions ? 1 : undefined, minWidth: 0 }}>
        <Box
          sx={{
            mt: isColumn
              ? 1
              : 0,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: `${PERSON_ROW_IDENTITY_GAP}px`,
            justifyContent: isColumn
              ? 'center'
              : 'flex-start',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: isColumn
                ? 'center'
                : 'left',
            }}
          >
            <Link
              params={{ id: user.id }}
              to={PATH_NAMES.users + '/$id'}
              /*
               * inherits the surrounding text colour instead of a fixed black — the hard-coded
               * value made the link unreadable in dark mode, which is why the user card read as
               * a dead end rather than as the way to the owner's page
               */
              css={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {getUserFullName(user)}
            </Link>
          </Typography>
          {badge}
        </Box>
        <div css={{ marginTop: isColumn ? 0 : -2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZE_META }}>
            {meta ?? (contactType === 'email'
              ? user.email
              : getFullPhoneNumber(user.phone))}
          </Typography>
        </div>
        {detail}
      </div>
      {actions}
    </Stack>
  );
};

export default UserInfo;
