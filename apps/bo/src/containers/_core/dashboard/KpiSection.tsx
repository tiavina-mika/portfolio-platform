import { useNavigate } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiUsers } from 'react-icons/fi';

import KpiGrid from '@/components/KpiGrid';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import { CARD_STAT_ICON_GLYPH_SIZE } from '@/constants/_core/ui/page.constants';
import { goToList } from '@/redux/actions/_core/util.action';
import { IDashboardKpis } from '@/types/_core/dashboard.type';
import { getDashboardKpiCards } from '@/utils/_core/dashboard.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

type Props = {
  kpis: IDashboardKpis | null;
  loading: boolean;
};

const SKELETON_CARDS_COUNT = 4;

const KpiSection = ({ kpis, loading }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <KpiGrid>
        {[...Array(SKELETON_CARDS_COUNT)].map((_, index) => <StatCardSkeleton withIcon key={index} />)}
      </KpiGrid>
    );
  }

  if (!kpis) return null;

  // a figure the account may not read is not sent at all: its card is left out, never drawn as a zero
  const cards = getDashboardKpiCards().filter((card) => kpis[card.field] !== undefined);
  const { totalUsers, monthRevenue } = kpis;

  if (totalUsers === undefined && monthRevenue === undefined && !cards.length) return null;

  return (
    <KpiGrid>
      {totalUsers !== undefined && (
        <StatCard
          icon={<FiUsers size={CARD_STAT_ICON_GLYPH_SIZE} />}
          label={t('user:users')}
          onClick={() => navigate(goToList('users'))}
          // a caption only qualifies a figure that is there — an empty platform shows its zeros bare
          sub={totalUsers > 0 ? `+${kpis.newUsersThisWeek ?? 0} ${t('dashboard:thisWeek')}` : undefined}
          value={totalUsers.toLocaleString()}
        />
      )}
      {cards.map((card) => {
        const { Component } = card;

        // registered cards are lazy: the skeleton holds the card's place while its chunk loads
        return (
          <Suspense fallback={<StatCardSkeleton withIcon />} key={card.key}>
            <Component kpis={kpis} />
          </Suspense>
        );
      })}
      {monthRevenue !== undefined && (
        <StatCard
          icon={<FiCreditCard size={CARD_STAT_ICON_GLYPH_SIZE} />}
          label={t('dashboard:monthRevenue')}
          onClick={() => navigate(goToList('payments'))}
          value={formatPriceWithCurrency(monthRevenue, kpis.monthRevenueCurrency)}
          sub={kpis.monthPaymentsCount
            ? `${kpis.monthPaymentsCount} ${t('dashboard:transactions')}`
            : undefined}
        />
      )}
    </KpiGrid>
  );
};

export default KpiSection;
