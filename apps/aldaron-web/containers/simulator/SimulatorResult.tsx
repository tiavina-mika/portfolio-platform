'use client';

import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button';
import Eyebrow from '@/components/typography/Eyebrow';
import { useCurrency } from '@/hooks/useCurrency';
import { ISimulatorEstimate, ISimulatorState } from '@/types/simulator.type';
import { cn } from '@/utils/app.utils';
import { SIMULATOR_LINES } from '@/utils/simulator.constants';

type Props = {
  state: ISimulatorState;
  /**
   * The estimate of the answers, and the big price written from it
   */
  estimate: ISimulatorEstimate;
  priceLabel: string;
  onRequestQuote: () => void;
  onCopySummary: () => void;
};

const BLOCK_CLASS_NAME = 'grid gap-2 border-t border-border pt-4';
const TICKS_CLASS_NAME = `
  m-0 grid list-none gap-2 p-0
  *:relative *:pl-5.5 *:text-[15px]
  *:before:absolute *:before:top-[0.6em] *:before:left-0.5 *:before:size-2 *:before:content-['']
`;

/**
 * The estimate: the price, the lines it is made of, what is and is not included, how it is paid, and the
 * two actions (ask for a quote, copy the summary). It follows the page on a wide screen.
 */
const SimulatorResult = ({
  state, estimate, priceLabel, onRequestQuote, onCopySummary,
}: Props) => {
  const t = useTranslations('SimulatorPage');
  const { convertPrices, formatPrice: money } = useCurrency();
  const { parts, isOverCeiling } = estimate;

  const lineLabels: Record<(typeof SIMULATOR_LINES)[number], string> = {
    web: t('lines.web'),
    app: t('lines.app'),
    mobile: t('lines.mobile'),
    bo: t('lines.bo'),
    design: t('lines.design'),
    chat: t('lines.chat'),
    payMobile: `${t('lines.payment')} · ${t('lines.mobile')}`,
    payApp: `${t('lines.payment')} · ${t('lines.app')}`,
    floorAdj: t('lines.floor'),
  };
  const lines = isOverCeiling ? [] : SIMULATOR_LINES.filter(key => parts[key] > 0);
  const precision = isOverCeiling
    ? t('result.empty')
    : t(state.bring === 'idea' ? 'result.firstEstimate' : 'result.refine');
  const isRich = state.sup.app && state.rich === 'rich';
  const included = [
    state.sup.mobile ? t('result.included.store') : t('result.included.release'),
    t('result.included.handover'),
    t('result.included.bugs'),
  ];

  return (
    <aside
      aria-labelledby="simulator-result-title"
      className={`
        grid gap-5 rounded-lg border border-border bg-card p-4
        min-[880px]:sticky min-[880px]:top-5
        sm:p-6
      `}
    >
      <h2 className="m-0" id="simulator-result-title">
        <Eyebrow>{t('result.title')}</Eyebrow>
      </h2>
      <div aria-atomic="true" aria-live="polite" className="flex flex-col gap-2">
        <p
          className={`
            m-0 font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance tabular-nums
            md:text-[44px]
          `}
        >
          {priceLabel}
        </p>
        <p className="m-0 font-mono text-sm leading-[1.4] text-muted-foreground">{precision}</p>
        {state.maintenance && (
          <p className="m-0 font-mono text-sm leading-[1.4] text-muted-foreground">
            {convertPrices(t('maintenance.line'))}
          </p>
        )}
      </div>
      {lines.length > 0 && (
        <ul className="m-0 grid list-none gap-2 p-0">
          {lines.map(key => (
            <li
              className="flex justify-between gap-3 border-t border-border pt-2 text-[15px]"
              key={key}
            >
              <span>{lineLabels[key]}</span>
              <span className="font-mono tabular-nums">{money(parts[key])}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 text-sm text-muted-foreground">{t('result.indicative')}</p>
      <div className={BLOCK_CLASS_NAME}>
        <h3 className="text-[15px] leading-[1.3] font-semibold">{t('result.includedTitle')}</h3>
        <ul className={cn(TICKS_CLASS_NAME, '*:before:bg-success')}>
          {included.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className={BLOCK_CLASS_NAME}>
        <h3 className="text-[15px] leading-[1.3] font-semibold">{t('result.excludedTitle')}</h3>
        <ul className={cn(TICKS_CLASS_NAME, '*:before:bg-muted-foreground')}>
          <li>{t(state.sup.mobile ? 'result.excluded.mobile' : 'result.excluded.web')}</li>
        </ul>
      </div>
      <div className={BLOCK_CLASS_NAME}>
        <p className="m-0 text-[15px] text-pretty text-muted-foreground">
          {[
            t('result.payment'),
            isRich && t('result.paymentRich'),
            parts.design > 0 && t('result.paymentDesign'),
          ].filter(Boolean).join(' ')}
        </p>
      </div>
      <div className="grid gap-2">
        <Button
          fullWidth
          onClick={onRequestQuote}
          size="lg"
          variant="brand"
        >
          {t('result.request')}
        </Button>
        <Button fullWidth onClick={onCopySummary} variant="outline">
          {t('result.copy')}
        </Button>
      </div>
    </aside>
  );
};

export default SimulatorResult;
