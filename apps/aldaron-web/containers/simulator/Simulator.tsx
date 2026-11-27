'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useReducer } from 'react';

import { useSimulatorPrice } from '@/hooks/useSimulatorPrice';
import { useSimulatorRecapLabels } from '@/hooks/useSimulatorRecapLabels';
import { IEstimate } from '@/types/estimate.type';
import { SIMULATOR_EXAMPLES } from '@/utils/simulator.constants';
import {
  buildEstimate,
  buildRecap,
  createInitialState,
  simulatorReducer,
} from '@/utils/simulator.utils';

import SimulatorBar from './SimulatorBar';
import SimulatorExamples from './SimulatorExamples';
import SimulatorForm from './SimulatorForm';
import SimulatorResult from './SimulatorResult';

export type SimulatorProps = {
  /**
   * The visitor asks for a quote: the estimate is handed over so the quote request can start from it
   */
  onRequestQuote: (estimate: IEstimate) => void;
  /**
   * The visitor copies the written summary of the estimate
   */
  onCopySummary: (summary: string) => void;
};

/**
 * The price simulator: the examples, the questions, and the estimate that follows every answer. The
 * answers are the only state; the estimate is computed from them.
 */
const Simulator = ({ onRequestQuote, onCopySummary }: SimulatorProps) => {
  const t = useTranslations('SimulatorPage');
  const locale = useLocale();
  const recapLabels = useSimulatorRecapLabels();
  const [state, dispatch] = useReducer(simulatorReducer, undefined, createInitialState);
  const { label: priceLabel, estimate } = useSimulatorPrice(state);

  const handleRequestQuote = () => onRequestQuote(buildEstimate(state, recapLabels, locale));
  const handleCopySummary = () => onCopySummary(buildRecap(state, recapLabels, locale));

  return (
    <div className="grid gap-8">
      <SimulatorExamples
        activeId={state.example}
        examples={SIMULATOR_EXAMPLES.map(({ id }) => ({ id, label: t(`examples.${id}`) }))}
        label={t('examples.label')}
        onSelect={id => dispatch({ type: 'toggleExample', id })}
      />
      <div
        className={`
          grid grid-cols-[minmax(0,1fr)] items-start gap-8
          min-[880px]:grid-cols-[minmax(0,1fr)_380px] min-[880px]:gap-10
        `}
      >
        <SimulatorForm dispatch={dispatch} estimate={estimate} state={state} />
        <SimulatorResult
          estimate={estimate}
          onCopySummary={handleCopySummary}
          onRequestQuote={handleRequestQuote}
          priceLabel={priceLabel}
          state={state}
        />
      </div>
      <SimulatorBar
        actionLabel={t('result.requestShort')}
        onAction={handleRequestQuote}
        priceLabel={priceLabel}
      />
    </div>
  );
};

export default Simulator;
