import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import Link from '@/components/Link';
import {
  INBOX_CONTEXT_CARD_PADDING, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_TITLE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import ReportReasonCell from '@/containers/_core/reports/ReportReasonCell';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import { ITicketReportContext } from '@/types/_core/contact.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const classes = {
  card: { padding: `${INBOX_CONTEXT_CARD_PADDING}px` },
  title: { display: 'block', marginBottom: `${INBOX_CONTEXT_TITLE_GAP}px` },
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
  },
};

type Props = {
  report: ITicketReportContext;
};

/**
 * The moderation file behind a ticket a report opened: why it was filed, where it stands, and the way
 * into it. The conversation is where the reporter is answered; suspending an account or dismissing
 * the report is decided on the report itself, so an agent needs to get there from the thread.
 */
const ContactReportCard = ({ report }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Card css={classes.card}>
      <Typography css={classes.title} variant="overline">
        {t('user:contacts.linkedReport.title')}
      </Typography>
      <Box css={classes.body}>
        <Box css={classes.chips}>
          <ReportReasonCell reason={report.reason} />
          <ReportStatusChip status={report.status} />
        </Box>
        <Link params={{ id: report.id }} to={`${PATH_NAMES.reports}/$id`} variant="body2">
          {t('user:contacts.linkedReport.open')}
        </Link>
      </Box>
    </Card>
  );
};

export default ContactReportCard;
