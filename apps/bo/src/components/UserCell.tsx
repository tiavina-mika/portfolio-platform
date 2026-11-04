import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import Avatar from '@/components/Avatar';
import { IUser } from '@/types/_core/user.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

import Link from './Link';

const classes = {
  root: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  center: {
    justifyContent: 'center',
  },
};

export type UserCellProps = {
  user: IUser | undefined;
  contactType?: 'email' | 'phone';
  isActive?: boolean;
  position?: 'left' | 'right' | 'center';
  compact?: boolean;
};

const UserCell = ({
  user,
  contactType = 'phone',
  isActive = false,
  position = 'left',
  compact = false,
}: UserCellProps) => {
  if (!user) return null;

  /*
   * a user reached through another object's pointer (an article's author, a ride's driver) is
   * plain JSON carrying `objectId` — only a user fetched as the row itself goes through
   * `toJSONWithId` and gains an `id`. Reading `id` alone linked every such cell to /users/undefined.
   */
  const userId = user.id ?? user.objectId;

  return (
    // a cell of a table, not a row of a list: as an `li` it would sit outside any `ul`
    <ListItem component="div" css={[classes.root, classes[position]]}>
      <ListItemAvatar>
        <Avatar isNameShown size={compact ? 32 : 42} user={user} />
      </ListItemAvatar>
      <Link
        css={{ color: isActive ? 'primary.main' : 'inherit' }}
        params={{ id: userId }}
        preload={false}
        to={PATH_NAMES.users + '/$id'}
      >
        <ListItemText
          primary={getUserFullName(user)}
          secondary={contactType === 'email' ? user.email : getFullPhoneNumber(user.phone)}
          slotProps={{
            primary: compact ? { variant: 'body2', noWrap: true } : undefined,
            secondary: compact ? { noWrap: true } : undefined,
          }}
        />
      </Link>
    </ListItem>
  );
};

export default UserCell;
