import { Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import BooleanIcons from '@/components/BooleanIcons';
import { IUser } from '@/types/_core/user.type';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
};
const UserContacts = ({ user }: Props) => {
  const options = useMemo(() => {
    return [{
      label: user.email,
      value: !!user.emailVerified,
    }, {
      label: getFullPhoneNumber(user.phone) || '',
      value: !!user.phoneVerified,
    }];

  }, [user]);

  return (
    <Stack spacing={0.5}>
      {options.filter((option) => option.label).map((item, index) => (
        <Stack
          direction="row"
          key={index}
          spacing={0.5}
          sx={{
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">{item.label || '—'}</Typography>
          <BooleanIcons size={14} value={item.value} />
        </Stack>
      ))}
    </Stack>
  );
};

export default UserContacts;
