import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle } from 'react-icons/fi';

import {
  PAGE_HEAD_ACTION_ICON_SIZE, PAGE_HEAD_ACTION_SKELETON_WIDTH,
} from '@/constants/_core/ui/page.constants';
import { BUTTON_HEIGHT } from '@/constants/_core/ui/ui.constants';
import { IReportSummary } from '@/types/_core/report.type';

type Props = {
  summary: IReportSummary | null;
  active: boolean;
  onToggle: (active: boolean) => void;
};

/**
 * How much of the queue touches someone's safety or money and is still open, and a way to see only
 * that. It states a number rather than offering a plain "urgent" switch: an operator opening the
 * page needs to know whether there are two such reports or forty before deciding to work the queue
 * in order at all, and a switch with nothing behind it would send them to an empty list.
 *
 * Nothing to handle means the control is not drawn — an emphasised zero is still something to read
 * past on every visit.
 */
const ReportPriorityToggle = ({ summary, active, onToggle }: Props) => {
  const { t } = useTranslation(['user']);

  if (!summary) return <Skeleton height={BUTTON_HEIGHT} variant="rounded" width={PAGE_HEAD_ACTION_SKELETON_WIDTH} />;

  if (summary.urgentOpen === 0 && !active) return null;

  return (
    <Button
      color="error"
      onClick={() => onToggle(!active)}
      startIcon={<FiAlertTriangle size={PAGE_HEAD_ACTION_ICON_SIZE} />}
      variant={active
        ? 'contained'
        : 'outlined'}
    >
      {t('user:reports.handleFirstWithCount', { count: summary.urgentOpen })}
    </Button>
  );
};

export default ReportPriorityToggle;
