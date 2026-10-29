import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import BooleanIcons from '@/components/BooleanIcons';
import { IBan } from '@/types/user.type';
import { displayDate, isDateExpired } from '@/utils/date.utils';
import { getUserFullName } from '@/utils/user.utils';

type Props = {
  bans: IBan[] | undefined;
};
const UserBans = ({ bans = [] }: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('user:bans.bannedAt')}</TableCell>
          <TableCell>{t('user:bans.until')}</TableCell>
          <TableCell>{t('common:expired')}</TableCell>
          <TableCell>{t('user:bans.bannedBy')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bans.map((ban: IBan, index: number) => (
          <TableRow key={index}>
            <TableCell>{displayDate(ban.bannedAt)}</TableCell>
            <TableCell>{displayDate(ban.until)}</TableCell>
            <TableCell>
              <BooleanIcons value={isDateExpired(ban.until)} />
            </TableCell>
            <TableCell>
              {ban.bannedBy ? getUserFullName(ban.bannedBy) : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserBans;
