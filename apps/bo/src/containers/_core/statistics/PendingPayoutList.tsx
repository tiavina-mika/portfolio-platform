import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import StatisticsTableContainer from '@/containers/_core/statistics/StatisticsTableContainer';
import { IPendingPayoutPoint } from '@/types/_core/statistics.type';
import { displayDate } from '@/utils/_core/date.utils';
import { formatStatisticsAmount } from '@/utils/_core/statistics.utils';

const classes = {
  name: (theme: Theme) => ({ fontWeight: theme.typography.fontWeightBold }),
};

type Props = {
  payouts: IPendingPayoutPoint[];
  /** ISO 4217 code the amounts are in */
  currency?: string;
};

/**
 * What the platform still owes its drivers for rides already completed, one row per driver. The
 * oldest ride is what makes a row urgent: a small amount owed for a month weighs more than a large
 * one owed since yesterday.
 */
const PendingPayoutList = ({ payouts, currency }: Props) => {
  const { t } = useTranslation(['statistics']);

  if (payouts.length === 0) return <EmptyData title={t('statistics:noPendingPayouts')} />;

  return (
    <StatisticsTableContainer>
      <TableHead>
        <TableRow>
          <TableCell>{t('statistics:driver')}</TableCell>
          <TableCell align="right">{t('statistics:ridesCount')}</TableCell>
          <TableCell align="right">{t('statistics:amount')}</TableCell>
          <TableCell align="right">{t('statistics:oldestRide')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payouts.map((payout) => (
          <TableRow key={payout.driverId}>
            <TableCell css={classes.name}>{payout.fullName}</TableCell>
            <TableCell align="right">{payout.ridesCount}</TableCell>
            <TableCell align="right">{formatStatisticsAmount(payout.amount, currency)}</TableCell>
            <TableCell align="right">{displayDate(payout.oldestAt, false)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StatisticsTableContainer>
  );
};

export default PendingPayoutList;
