import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

import { PAGE_HEAD_META_GAP } from '@/constants/_core/ui/page.constants';
import ReportAgeCell from '@/containers/_core/reports/ReportAgeCell';
import { IReport } from '@/types/_core/report.type';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PAGE_HEAD_META_GAP}px`,
  },
  separator: { color: 'text.disabled' },
};

type Props = {
  report: IReport;
  // where the report stands among the ones being worked through, when it is one of them
  position?: { current: number; total: number };
};

/**
 * The line under a report's heading: how long it has been waiting — called out once an open one is
 * past the dispute deadline — and its place in the queue it is being worked through.
 */
const ReportPageMeta = ({ report, position }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Box component="span" css={classes.root}>
      <ReportAgeCell createdAt={report.createdAt} status={report.status} />
      {position && (
        <>
          <Box aria-hidden component="span" sx={classes.separator}>·</Box>
          <span>{t('user:reports.positionOf', { position: position.current, count: position.total })}</span>
        </>
      )}
    </Box>
  );
};

export default ReportPageMeta;
