import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { DASHBOARD_SHORT_DATE_TIME_FORMAT } from '@/constants/_core/dashboard.constants';
import DashboardListCard, {
  DashboardActivityRow, DashboardRowMeta,
} from '@/containers/_core/dashboard/DashboardListCard';
import ProjectStatusCell from '@/containers/_domain/project/ProjectStatusCell';
import { goToProjects } from '@/redux/actions/_domain/project.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IDashboardRecent } from '@/types/_core/dashboard.type';
import { getParseDateValue } from '@/utils/_core/date.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';

type Props = {
  recent: IDashboardRecent;
};

export const RecentProjectsColumn = ({ recent }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = useSelector(getSettingsLocaleSelector);
  // the section only draws this column when the rows were sent
  const projects = recent.projects ?? [];

  return (
    <DashboardListCard
      emptyDescription={t('dashboard:noRecentProjects')}
      footerLabel={t('dashboard:seeAllProjects')}
      isEmpty={projects.length === 0}
      onFooterClick={() => navigate(goToProjects())}
      title={t('project:project.projects')}
      variant="activity"
    >
      {projects.map((project) => (
        <DashboardActivityRow
          key={project.objectId}
          status={<ProjectStatusCell project={project} />}
          title={getTranslatedField(project.translated, locale, 'name') || '—'}
        >
          {project.updatedAt && (
            <DashboardRowMeta>
              {dayjs(getParseDateValue(project.updatedAt)).format(DASHBOARD_SHORT_DATE_TIME_FORMAT)}
            </DashboardRowMeta>
          )}
        </DashboardActivityRow>
      ))}
    </DashboardListCard>
  );
};
