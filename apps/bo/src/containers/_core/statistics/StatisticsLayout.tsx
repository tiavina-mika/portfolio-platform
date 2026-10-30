import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import ExportButton from '@/components/ExportButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import {
  STATISTICS_CONTENT_GAP, STATISTICS_CONTENT_GAP_MOBILE, STATISTICS_LAYOUT_GAP,
  STATISTICS_LAYOUT_GAP_COMPACT, STATISTICS_RAIL_WIDTH,
} from '@/constants/_core/ui/chart.constants';
import StatisticsNav from '@/containers/_core/statistics/StatisticsNav';
import StatisticsToolbar from '@/containers/_core/statistics/StatisticsToolbar';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { ExportFormat } from '@/types/_core/app.type';
import { IStatisticsNavItem, StatisticsPeriod, StatisticsViewEnum } from '@/types/_core/statistics.type';

const classes = {
  // the rail keeps its width and the charts take the rest; under `lg` the tabs stack above the charts
  body: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${STATISTICS_RAIL_WIDTH}px minmax(0, 1fr)`,
    alignItems: 'start',
    gap: STATISTICS_LAYOUT_GAP,
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: STATISTICS_LAYOUT_GAP_COMPACT,
    },
  }),
  content: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: STATISTICS_CONTENT_GAP,
    minWidth: 0,
    [theme.breakpoints.down('sm')]: { gap: STATISTICS_CONTENT_GAP_MOBILE },
  }),
};

type Props = {
  viewTitle: string;
  activeView: StatisticsViewEnum;
  navItems: IStatisticsNavItem[];
  onNavigate: (view: StatisticsViewEnum) => void;
  period?: StatisticsPeriod;
  isComparing?: boolean;
  withPeriod?: boolean;
  exportDisabled?: boolean;
  // writes every series of the open view to one file
  onExport: (format: ExportFormat) => void;
  children: ReactNode;
};

/**
 * The frame every statistics view is drawn in: the page head with the export of the whole view, the
 * navigation between views, and the band naming the open one with its period. The views only bring
 * their own cards.
 */
const StatisticsLayout = ({
  viewTitle, activeView, navItems, onNavigate, period, isComparing, withPeriod, exportDisabled,
  onExport, children,
}: Props) => {
  const { t } = useTranslation();
  const isCompact = useBreakpoint('lg');

  return (
    <>
      <Head title={viewTitle} />
      <PageHeader
        actions={<ExportButton withLabel disabled={exportDisabled} onExport={onExport} />}
        title={t('common:statistics')}
      />
      <div css={classes.body}>
        <StatisticsNav
          items={navItems}
          onChange={onNavigate}
          value={activeView}
          variant={isCompact ? 'tabs' : 'rail'}
        />
        <div css={classes.content}>
          <StatisticsToolbar
            isComparing={isComparing}
            period={period}
            title={viewTitle}
            withPeriod={withPeriod}
          />
          {children}
        </div>
      </div>
    </>
  );
};

export default StatisticsLayout;
