'use client';

import { useTranslations } from 'next-intl';

import { useCurrency } from '@/hooks/useCurrency';
import { ISimulatorEstimate, ISimulatorState } from '@/types/simulator.type';
import { computeEstimate, getEffectiveState, getPriceDisplay } from '@/utils/simulator.utils';

type SimulatorPrice = {
  /**
   * The big price, written: an amount, "from" the minimum order, or "large project"
   */
  label: string;
  estimate: ISimulatorEstimate;
};

/**
 * The estimate of the answers and the way its price is written in the language and the currency of
 * the page
 */
export const useSimulatorPrice = (state: ISimulatorState): SimulatorPrice => {
  const t = useTranslations('SimulatorPage');
  const { formatPrice: money } = useCurrency();
  const display = getPriceDisplay(state);
  const estimate = computeEstimate(getEffectiveState(state));

  const getLabel = (): string => {
    if (display.kind === 'large') return t('result.large');
    if (display.kind === 'from') return t('result.from', { a: money(display.amount) });

    return money(display.amount);
  };

  return { label: getLabel(), estimate };
};
