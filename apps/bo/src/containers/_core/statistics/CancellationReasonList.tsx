import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { UNSPECIFIED_CANCEL_REASON } from '@shared/domain-constants';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import StatisticsTableContainer from '@/containers/_core/statistics/StatisticsTableContainer';
import { ICancellationReasonPoint } from '@/types/_core/statistics.type';

const classes = {
  count: (theme: Theme) => ({ fontWeight: theme.typography.fontWeightBold }),
};

type Props = {
  reasons: ICancellationReasonPoint[];
};

const CancellationReasonList = ({ reasons }: Props) => {
  const { t } = useTranslation(['statistics']);

  if (reasons.length === 0) return <EmptyData />;

  return (
    <StatisticsTableContainer>
      <TableHead>
        <TableRow>
          <TableCell>{t('statistics:cancellationReasons')}</TableCell>
          <TableCell align="right">{t('statistics:occurrences')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reasons.map((point) => (
          <TableRow key={point.reason}>
            <TableCell>
              {point.reason === UNSPECIFIED_CANCEL_REASON
                ? t('statistics:unspecifiedCancelReason')
                : point.reason}
            </TableCell>
            <TableCell align="right" css={classes.count}>{point.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StatisticsTableContainer>
  );
};

export default CancellationReasonList;
