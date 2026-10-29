import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { RowKeepIcon, RowPreviewIcon } from '@/components/icons/RowActionIcons';
import { ROW_ACTIONS_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import { IReport } from '@/types/_core/report.type';
import { isOpenReportStatus } from '@/utils/_core/report.utils';
import { getRowActionsStyles } from '@/utils/_core/theme/styles.utils';

const classes = {
  rowActions: (theme: Theme) => getRowActionsStyles(theme),
};

type Props = {
  report: IReport;
  onPreview: (report: IReport) => void;
  onDismiss: (report: IReport) => void;
};

/**
 * What can be done to one report from its own row.
 *
 * The queue is worked top to bottom, and most of what sits in it needs no decision beyond "nothing
 * to answer here" — so the ruling that closes a report without acting on anyone stands on the row
 * itself rather than behind a dialog opening. Everything that does act on someone (resolving with a
 * note, suspending the reported account) stays in the preview: those are read before they are
 * decided, and a queue that suspends accounts on a single click is a queue that suspends the wrong
 * one eventually.
 *
 * Dismissing only shows on a report that is still open: re-closing a closed one changes nothing,
 * and the button would read as an action the row still owes.
 */
const ReportRowActions = ({
  report, onPreview, onDismiss,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const runAction = (action: (value: IReport) => void) => (event: MouseEvent<HTMLElement>) => {
    // the row itself opens the preview, so a button on it must not fire both
    event.stopPropagation();
    action(report);
  };

  return (
    <div css={classes.rowActions}>
      <Tooltip title={t('viewDetails')}>
        <IconButton aria-label="preview" onClick={runAction(onPreview)}>
          <RowPreviewIcon size={ROW_ACTIONS_ICON_SIZE} />
        </IconButton>
      </Tooltip>
      {isOpenReportStatus(report.status) && (
        <Tooltip title={t('user:reports.dismiss')}>
          <IconButton aria-label="dismiss" onClick={runAction(onDismiss)}>
            <RowKeepIcon size={ROW_ACTIONS_ICON_SIZE} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ReportRowActions;
