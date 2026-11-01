import { useTheme } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiFlag } from 'react-icons/fi';

import { DASHBOARD_SHORT_DATE_TIME_FORMAT } from '@/constants/_core/dashboard.constants';
import {
  DASHBOARD_ALERT_SKELETON_ROWS, DASHBOARD_ALERTS_COLUMNS,
  DASHBOARD_CARD_ICON_SIZE, DASHBOARD_SECTION_TITLE_ICON_SIZE,
} from '@/constants/_core/ui/chart.constants';
import DashboardListCard, {
  DashboardAlertRow, DashboardListCardSkeleton,
} from '@/containers/_core/dashboard/DashboardListCard';
import DashboardSection from '@/containers/_core/dashboard/DashboardSection';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import { goToList } from '@/redux/actions/_core/util.action';
import { IDashboardAlerts } from '@/types/_core/dashboard.type';
import { displayReportTarget, getReportReasonLabelByValue } from '@/utils/_core/report.utils';
import { getStatusSolidColor } from '@/utils/_core/theme/styles.utils';

type Props = {
  alerts: IDashboardAlerts | null;
  loading: boolean;
};

const AlertsSection = ({ alerts, loading }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  if (!loading && !alerts) return null;

  // a backlog the account may not read is not sent at all: its card is left out, not drawn empty
  const { openReports } = alerts ?? {};
  const shownCardsCount = openReports ? 1 : 0;

  if (!loading && alerts && !shownCardsCount) return null;

  return (
    <DashboardSection
      columns={loading || !alerts ? DASHBOARD_ALERTS_COLUMNS : shownCardsCount}
      icon={<FiAlertTriangle color={getStatusSolidColor(theme, 'error')} size={DASHBOARD_SECTION_TITLE_ICON_SIZE} />}
      title={t('dashboard:alerts')}
    >
      {loading || !alerts
        ? Array.from({ length: DASHBOARD_ALERTS_COLUMNS }, (_, index) => (
          <DashboardListCardSkeleton key={index} rows={DASHBOARD_ALERT_SKELETON_ROWS} />
        ))
        : (
          <>
            {openReports && (
              <DashboardListCard
                count={alerts.openReportsCount}
                emptyDescription={t('dashboard:noUnresolvedReports')}
                footerLabel={t('dashboard:seeAllReports')}
                icon={<FiFlag size={DASHBOARD_CARD_ICON_SIZE} />}
                isEmpty={openReports.length === 0}
                onFooterClick={() => navigate(goToList('reports'))}
                title={t('dashboard:unresolvedReports')}
                tone="warning"
                variant="alert"
              >
                {openReports.map((report) => (
                  <DashboardAlertRow
                    key={report.objectId}
                    title={getReportReasonLabelByValue(report.reason)}
                    meta={[
                      displayReportTarget(report.targetLabel, report.targetId),
                      dayjs(report.createdAt).format(DASHBOARD_SHORT_DATE_TIME_FORMAT),
                    ].join(' · ')}
                  >
                    <ReportStatusChip status={report.status} />
                  </DashboardAlertRow>
                ))}
              </DashboardListCard>
            )}
          </>
        )}
    </DashboardSection>
  );
};

export default AlertsSection;
