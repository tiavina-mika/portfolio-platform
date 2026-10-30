import { Box, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ExportButton from '@/components/ExportButton';
import Head from '@/components/Head';
import PeriodSelector from '@/components/PeriodSelector';
import { FINANCE_PAGE_MAX_WIDTH } from '@/constants/_core/ui.constants';
import FinanceOverviewSection from '@/containers/_core/finance/FinanceOverviewSection';
import { loadFinanceOverview, recheckOverduePendingPayment } from '@/redux/actions/_core/finance.action';
import { getAppErrorSelector, getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import {
  getFinanceLoadingSelector, getFinanceOverviewSelector, getOverduePendingPaymentsSelector,
} from '@/redux/reducers/_core/finance.reducer';
import { getSettingsMoneyCountrySelector } from '@/redux/reducers/_core/settings.reducer';
import { financeOverviewRoute } from '@/routes/protected/_core/finance.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getFinanceOverviewExportColumns } from '@/utils/_core/finance.utils';

const FinanceOverview = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['finance']);
  const { period }: IPeriodSearchParams = financeOverviewRoute.useSearch();

  const overview = useSelector(getFinanceOverviewSelector);
  const overduePendingPayments = useSelector(getOverduePendingPaymentsSelector);
  const loading = useSelector(getFinanceLoadingSelector);
  // every load clears it first, so it can only describe the read this page just made
  const moneyCountry = useSelector(getSettingsMoneyCountrySelector);
  const loadError = useSelector(getAppErrorSelector);
  const isRechecking = useSelector(getAppLoadingSelector);
  // payments the operator was asked about again on this visit: they stay listed, marked, until settled
  const [recheckedIds, setRecheckedIds] = useState<string[]>([]);
  // a refused question shares the app error with a failed read, and must not pass for one
  const [hasRecheckFailed, setHasRecheckFailed] = useState(false);

  const loadOverview = useCallback(() => {
    setHasRecheckFailed(false);
    dispatch(loadFinanceOverview(period));
  }, [dispatch, period]);

  /*
   * the figures of the previous visit, or of the previous period, stay on screen while these are
   * read — the section only draws its placeholder when there is nothing to show yet
   */
  useEffect(() => {
    loadOverview();
    // the action reads the country from the store: a change of country reads the figures again
  }, [loadOverview, moneyCountry]);

  const handleRecheck = async (paymentId: string): Promise<void> => {
    const error = await dispatch(recheckOverduePendingPayment(paymentId, period));

    setHasRecheckFailed(!!error);

    if (!error) {
      setRecheckedIds((ids) => [...ids, paymentId]);
    }
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(overview?.points ?? [], getFinanceOverviewExportColumns(t), 'finance-overview', format);
  };

  return (
    <Box sx={{ maxWidth: FINANCE_PAGE_MAX_WIDTH, mx: 'auto', p: { xs: 2, md: 3 }, width: '100%' }}>
      <Head title={t('finance:overview')} />
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <ExportButton disabled={loading || !overview} onExport={handleExport} />
        <PeriodSelector period={period} />
      </Stack>
      <FinanceOverviewSection
        isRechecking={isRechecking}
        loadError={!!loadError && !hasRecheckFailed}
        loading={loading && !overview}
        onRecheck={handleRecheck}
        onRetry={loadOverview}
        overduePendingPayments={overduePendingPayments}
        overview={overview}
        period={period}
        recheckedIds={recheckedIds}
      />
    </Box>
  );
};

export default FinanceOverview;
