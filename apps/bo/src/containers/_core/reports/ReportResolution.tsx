import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import LabelValue from '@/components/LabelValue';
import { IReport } from '@/types/_core/report.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

type Props = {
  report: IReport;
  // whether the report still owes a decision: an open one is written, a closed one is read
  isOpen: boolean;
  // how tall the note is drawn — a side sheet is short of room, a page is not
  rows: number;
  // a card that already carries the word "Resolution" in its header does not repeat it
  hasTitle?: boolean;
};

/**
 * The ruling on a report: the note an operator writes while the report is open, and — once it is
 * closed — who closed it, when, and with what words. It has to sit inside the decision form's
 * context, since the note is a field of that form and the buttons that submit it live elsewhere.
 */
const ReportResolution = ({
  report, isOpen, rows, hasTitle = true,
}: Props) => {
  const { t } = useTranslation(['user']);

  if (isOpen) {
    return (
      <Stack spacing={1}>
        {hasTitle && <Typography variant="h6">{t('user:reports.resolution')}</Typography>}
        {report.reviewedBy && (
          <>
            <LabelValue
              label={t('user:reports.reviewedBy')}
              value={getUserFullName(report.reviewedBy)}
            />
            <LabelValue
              label={t('user:reports.reviewStartedAt')}
              value={displayDate(report.reviewStartedAt, true)}
            />
          </>
        )}
        <TextField
          fullWidth
          multiline
          name="resolution"
          placeholder={t('user:reports.resolutionPlaceholder')}
          rows={rows}
          variant="outlined"
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <LabelValue
        label={t('user:reports.resolvedBy')}
        value={getUserFullName(report.resolvedBy)}
      />
      <LabelValue
        label={t('user:reports.resolvedAt')}
        value={displayDate(report.resolvedAt, true)}
      />
      <LabelValue
        label={t('user:reports.resolution')}
        value={report.resolution ?? '-'}
      />
    </Stack>
  );
};

export default ReportResolution;
