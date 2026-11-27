'use client';

import { useTranslations } from 'next-intl';

import { useCurrency } from '@/hooks/useCurrency';
import { ISimulatorEstimate, SimulatorLineKey } from '@/types/simulator.type';
import { SIMULATOR_LINES, SIMULATOR_PRICING } from '@/utils/simulator.constants';
import { isApproximateLine } from '@/utils/simulator.utils';

type Props = {
  estimate: ISimulatorEstimate;
};

/**
 * What the price is made of: one line per support, option and top-up that costs something, each with the
 * calculation behind its amount. An amount the rounding moved away from that calculation starts with "≈".
 */
const SimulatorLines = ({ estimate }: Props) => {
  const t = useTranslations('SimulatorPage.lines');
  const { formatPrice: money } = useCurrency();
  const {
    parts, screens, unitPrices, designScreens, designRate, paymentCounts, floor,
  } = estimate;

  const labels: Record<SimulatorLineKey, string> = {
    web: t('web'),
    app: t('app'),
    mobile: t('mobile'),
    bo: t('bo'),
    design: t('design'),
    chat: t('chat'),
    payMobile: `${t('payment')} · ${t('mobile')}`,
    payApp: `${t('payment')} · ${t('app')}`,
    floorAdj: t('floor'),
  };

  const getScreensDetail = (count: number, unitPrice: number) =>
    t('details.screens', { count, a: money(unitPrice) });

  const getPaymentDetail = (count: number) => (count > 1
    ? t('details.paymentExtra', {
      count,
      first: money(SIMULATOR_PRICING.payFirst),
      extra: count - 1,
      unit: money(SIMULATOR_PRICING.payExtra),
    })
    : t('details.payment', { count }));

  const getDetail = (key: SimulatorLineKey): string | null => {
    switch (key) {
      case 'web':
      case 'app':
      case 'mobile':
      case 'bo':
        return getScreensDetail(screens[key], unitPrices[key]);
      case 'design':
        // one decimal at most: a shared screen counts for half
        return getScreensDetail(Math.round(designScreens * 10) / 10, designRate);
      case 'payMobile':
        return getPaymentDetail(paymentCounts.mobile);
      case 'payApp':
        return getPaymentDetail(paymentCounts.app);
      case 'floorAdj':
        return t('details.minimum', { a: money(floor) });
      default:
        return null;
    }
  };

  const keys = SIMULATOR_LINES.filter(key => parts[key] > 0);

  if (!keys.length) return null;

  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {keys.map(key => {
        const detail = getDetail(key);

        return (
          <li className="flex justify-between gap-3 border-t border-border pt-2 text-[15px]" key={key}>
            <span className="flex flex-col">
              {labels[key]}
              {detail && (
                <span className="font-mono text-[13px] text-muted-foreground tabular-nums">{detail}</span>
              )}
            </span>
            <span className="font-mono whitespace-nowrap tabular-nums">
              {isApproximateLine(key, estimate) && '≈ '}
              {money(parts[key])}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default SimulatorLines;
