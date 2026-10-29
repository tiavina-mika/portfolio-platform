import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import Avatar from '@/components/Avatar';
import { IUser } from '@/types/user.type';
import { getUserFullName } from '@/utils/user.utils';

type Props = {
  user: IUser;
};

const UserCell = ({
  user,
}: Props) => {
  return (
    <ListItem sx={{ p: 0 }}>
      <ListItemAvatar>
        <Avatar size={42} user={user} />
      </ListItemAvatar>
      <ListItemText primary={getUserFullName(user)} secondary={user.get('username')} />
    </ListItem>
  );
};

export default UserCell;
