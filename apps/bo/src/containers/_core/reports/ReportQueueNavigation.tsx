import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { REPORT_FILE_NAV_ICON_SIZE } from '@/constants/_core/ui/inbox.constants';

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

/**
 * The way through the queue from a report's own page: the report before and the report after the
 * one that is open, so the queue can be worked one file at a time without going back to the list.
 * It wraps around — after the last report of the page comes the first — as the queue is a loop to
 * be cleared, not a book to be finished.
 */
const ReportQueueNavigation = ({ onPrevious, onNext }: Props) => {
  const { t } = useTranslation(['common']);

  return (
    <>
      <Button
        color="inherit"
        onClick={onPrevious}
        startIcon={<FiChevronLeft size={REPORT_FILE_NAV_ICON_SIZE} />}
        variant="outlined"
      >
        {t('common:previous')}
      </Button>
      <Button
        color="inherit"
        endIcon={<FiChevronRight size={REPORT_FILE_NAV_ICON_SIZE} />}
        onClick={onNext}
        variant="outlined"
      >
        {t('common:next')}
      </Button>
    </>
  );
};

export default ReportQueueNavigation;
