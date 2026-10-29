import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import StatisticsTableContainer from '@/containers/_core/statistics/StatisticsTableContainer';
import { IOldestOpenReportPoint } from '@/types/_core/statistics.type';
import { displayDate } from '@/utils/_core/date.utils';

const classes = {
  reason: (theme: Theme) => ({ fontWeight: theme.typography.fontWeightBold }),
};

type Props = {
  reports: IOldestOpenReportPoint[];
  onOpen: (reportId: string) => void;
};

/**
 * The reports that have been waiting longest for a decision, oldest first. They are what the average
 * handling time hides: a quick average can sit on top of one file nobody opened for a month, so the
 * team reads this list to know which one to take next.
 */
const OldestOpenReportList = ({ reports, onOpen }: Props) => {
  const { t } = useTranslation(['statistics', 'user']);

  if (reports.length === 0) return <EmptyData title={t('statistics:noOpenReports')} />;

  return (
    <StatisticsTableContainer>
      <TableHead>
        <TableRow>
          <TableCell>{t('user:reports.reason')}</TableCell>
          <TableCell>{t('statistics:reportTarget')}</TableCell>
          <TableCell align="right">{t('statistics:receivedOn')}</TableCell>
          <TableCell align="right">{t('user:reports.age')}</TableCell>
          <TableCell align="right">{t('user:reports.status')}</TableCell>
          <TableCell align="right">
            <Box component="span" sx={visuallyHidden}>{t('statistics:actions')}</Box>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.reportId}>
            <TableCell css={classes.reason}>{t(`user:reports.reasons.${report.reason}`)}</TableCell>
            <TableCell>{t(`user:reports.targetTypes.${report.targetType}`)}</TableCell>
            <TableCell align="right">{displayDate(report.createdAt, false)}</TableCell>
            <TableCell align="right">{t('user:reports.ageInDays', { count: report.ageDays })}</TableCell>
            <TableCell align="right">{t(`user:reports.statuses.${report.status}`)}</TableCell>
            <TableCell align="right">
              <Button onClick={() => onOpen(report.reportId)} size="small" variant="outlined">
                {t('statistics:openReport')}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StatisticsTableContainer>
  );
};

export default OldestOpenReportList;
