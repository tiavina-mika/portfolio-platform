import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import { DASHBOARD_UPDATED_AT_FORMAT } from '@/constants/_core/dashboard.constants';
import { DASHBOARD_SECTION_GAP, DASHBOARD_SECTION_GAP_MOBILE, DASHBOARD_PARTIAL_NOTICE_PADDING_TOP } from '@/constants/_core/ui/chart.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import AlertsSection from '@/containers/_core/dashboard/AlertsSection';
import DashboardErrorCard from '@/containers/_core/dashboard/DashboardErrorCard';
import DashboardNoAccess from '@/containers/_core/dashboard/DashboardNoAccess';
import KpiSection from '@/containers/_core/dashboard/KpiSection';
import RecentSection from '@/containers/_core/dashboard/RecentSection';
import { useDashboardNoAccessLinks } from '@/hooks/_core/useDashboardNoAccessLinks';
import { loadDashboardStats } from '@/redux/actions/_core/dashboard.action';
import {
  getDashboardAlertsSelector,
  getDashboardHasErrorSelector,
  getDashboardKpisSelector,
  getDashboardLoadingSelector,
  getDashboardRecentSelector,
  getDashboardUpdatedAtSelector,
} from '@/redux/reducers/_core/dashboard.reducer';
import { getDashboardCoverage } from '@/utils/_core/dashboard.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  sections: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${DASHBOARD_SECTION_GAP}px`,
    [theme.breakpoints.down('sm')]: { gap: `${DASHBOARD_SECTION_GAP_MOBILE}px` },
  }),
  // on a phone the actions share the row equally, so the time would take half of it from the button
  updatedAt: (theme: Theme) => ({
    color: getDesignTokens(theme).textMuted,
    [theme.breakpoints.down('sm')]: { display: 'none' },
  }),
  partialNotice: (theme: Theme) => ({
    paddingTop: `${DASHBOARD_PARTIAL_NOTICE_PADDING_TOP}px`,
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
  }),
};

const Home = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const kpis = useSelector(getDashboardKpisSelector);
  const alerts = useSelector(getDashboardAlertsSelector);
  const recent = useSelector(getDashboardRecentSelector);
  const isFetching = useSelector(getDashboardLoadingSelector);
  const hasError = useSelector(getDashboardHasErrorSelector);
  const updatedAt = useSelector(getDashboardUpdatedAtSelector);
  const noAccessLinks = useDashboardNoAccessLinks();

  // how much the account sees is only known once the three parts are in
  const coverage = kpis && alerts && recent ? getDashboardCoverage({ kpis, alerts, recent }) : null;

  /*
   * the figures are loaded by the route without holding the navigation, so the page can render a
   * frame before the load has started — no figures and no error yet means they are on their way.
   * Each band is fed by its own call and drops its placeholder as soon as its own part is in,
   * without waiting for the other two. The figures of a previous visit are kept on screen while
   * they are read again: a band only draws its placeholder when it has nothing to show, and the
   * time beside the refresh button says how old what is shown is.
   */
  const isPending = (part: unknown): boolean => !part && (isFetching || !hasError);

  // a failed read swaps the bands for the retry card, unless a new read is already on its way
  const isFailed = hasError && !isFetching;

  const handleRefresh = () => {
    dispatch(loadDashboardStats());
  };

  const actions = (
    <>
      {updatedAt && (
        <Typography css={classes.updatedAt} variant="caption">
          {t('dashboard:updatedAt', { time: dayjs(updatedAt).format(DASHBOARD_UPDATED_AT_FORMAT) })}
        </Typography>
      )}
      <Button
        disabled={isFetching}
        onClick={handleRefresh}
        startIcon={<FiRefreshCw size={PAGE_HEAD_ACTION_ICON_SIZE} />}
        variant="outlined"
      >
        {t('common:refresh')}
      </Button>
    </>
  );

  return (
    <>
      <Head title={t('common:dashboard')} />
      <PageHeader actions={actions} pretitle={t('common:home')} title={t('common:dashboard')} />
      {isFailed && <DashboardErrorCard onRetry={handleRefresh} />}
      {!isFailed && coverage === 'none' && <DashboardNoAccess links={noAccessLinks} />}
      {!isFailed && coverage !== 'none' && (
        <div css={classes.sections}>
          <KpiSection kpis={kpis} loading={isPending(kpis)} />
          <Divider />
          <AlertsSection alerts={alerts} loading={isPending(alerts)} />
          <Divider />
          <RecentSection
            loading={isPending(recent)}
            newUsersCount={kpis?.newUsersThisWeek ?? 0}
            recent={recent}
          />
          {coverage === 'partial' && (
            <Typography css={classes.partialNotice} variant="body1">
              {t('dashboard:partialNotice')}
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
