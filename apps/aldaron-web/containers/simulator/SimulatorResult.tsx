'use client';

import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button';
import Eyebrow from '@/components/typography/Eyebrow';
import { ISimulatorEstimate, ISimulatorState } from '@/types/simulator.type';
import { cn } from '@/utils/app.utils';

import SimulatorInstalments from './SimulatorInstalments';
import SimulatorLines from './SimulatorLines';

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
// the actions wrap their long names instead of widening the card
const ACTION_CLASS_NAME = 'h-auto py-2 text-center text-[15px] leading-[1.2] whitespace-normal';
const TICKS_CLASS_NAME = `
  m-0 list-none p-0
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
  const { parts, isOverCeiling } = estimate;
  const precision = isOverCeiling
    ? t('result.empty')
    : t(state.bring === 'idea' ? 'result.firstEstimate' : 'result.refine');
  const isRich = state.sup.app && state.rich === 'rich';
  const paymentNotes = [
    isRich ? t('result.paymentRich') : '',
    parts.design > 0 ? t('result.paymentDesign') : '',
  ].filter(Boolean);
  const included = [
    state.sup.mobile ? t('result.included.store') : t('result.included.release'),
    t('result.included.handover'),
    t('result.included.bugs'),
  ];

  return (
    <aside
      aria-labelledby="simulator-result-title"
      className={`
        grid grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-border bg-card p-4
        min-[880px]:sticky min-[880px]:top-5
        sm:p-6
      `}
    >
      <h2 className="m-0 flex" id="simulator-result-title">
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
        <p className="m-0 font-mono text-sm leading-[1.4] font-medium text-muted-foreground">{precision}</p>
      </div>
      {!isOverCeiling && <SimulatorLines estimate={estimate} />}
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
      <SimulatorInstalments notes={paymentNotes} />
      <div className="grid gap-2">
        <Button
          fullWidth
          className={cn(ACTION_CLASS_NAME, 'min-h-13 px-4.5')}
          onClick={onRequestQuote}
          size="lg"
          variant="brand"
        >
          {t('result.request')}
        </Button>
        <Button
          fullWidth
          className={cn(ACTION_CLASS_NAME, 'min-h-11')}
          onClick={onCopySummary}
          variant="outline"
        >
          {t('result.copy')}
        </Button>
      </div>
    </aside>
  );
};

export default SimulatorResult;
