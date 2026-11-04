import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiCode } from 'react-icons/fi';

import StatCard from '@/components/StatCard';
import { CARD_STAT_ICON_GLYPH_SIZE } from '@/constants/_core/ui/page.constants';
import { goToProjects } from '@/redux/actions/_domain/project.action';
import { IDashboardKpis } from '@/types/_core/dashboard.type';

type Props = {
  kpis: IDashboardKpis;
};

export const ActiveProjectsKpiCard = ({ kpis }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // the section only draws this card when the figure was sent
  const activeProjects = kpis.activeProjects ?? 0;

  return (
    <StatCard
      icon={<FiCode size={CARD_STAT_ICON_GLYPH_SIZE} />}
      label={t('dashboard:activeProjects')}
      onClick={() => navigate(goToProjects())}
      sub={kpis.projects !== undefined ? `${kpis.projects} ${t('dashboard:total')}` : undefined}
      value={activeProjects.toLocaleString()}
    />
  );
};
