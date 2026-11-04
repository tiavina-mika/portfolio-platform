import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { upperCase } from 'string-ts';

import { IPlatform } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';


type Props = {
  platforms: IPlatform[];
};
const UserPlatforms = ({ platforms = [] }: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('common:platform')}</TableCell>
          <TableCell>{t('user:connectionCount')}</TableCell>
          <TableCell>{t('user:lastConnected')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {platforms.map((platform: IPlatform, index: number) => (
          <TableRow key={index}>
            <TableCell css={{ fontWeight: 500 }}>{upperCase(platform.name)}</TableCell>
            <TableCell>{platform.count}</TableCell>
            <TableCell>
              {dayjs(platform.lastConnectedAt).isValid() ? displayDate(platform.lastConnectedAt) : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserPlatforms;
