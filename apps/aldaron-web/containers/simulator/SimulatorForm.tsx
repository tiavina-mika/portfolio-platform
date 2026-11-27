'use client';

import { useTranslations } from 'next-intl';
import { Dispatch } from 'react';

import OptionCard from '@/components/forms/OptionCard';
import { useCurrency } from '@/hooks/useCurrency';
import {
  ISimulatorEstimate,
  ISimulatorState,
  SimulatorBring,
  SimulatorRich,
} from '@/types/simulator.type';
import {
  SIMULATOR_BRING,
  SIMULATOR_PRICING,
  SIMULATOR_SUPPORTS,
} from '@/utils/simulator.constants';
import { SimulatorAction } from '@/utils/simulator.utils';

import SimulatorMaintenance from './SimulatorMaintenance';
import SimulatorPayment from './SimulatorPayment';
import SimulatorScreens from './SimulatorScreens';
import SimulatorStep from './SimulatorStep';

type Props = {
  state: ISimulatorState;
  /**
   * The estimate of the answers: it holds what a screen of each support costs
   */
  estimate: ISimulatorEstimate;
  dispatch: Dispatch<SimulatorAction>;
};

const OPTIONS_CLASS_NAME = `
  grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-2
`;
const SUB_CLASS_NAME = 'grid gap-3 border-t border-border pt-4';
const SUB_LEGEND_CLASS_NAME = 'mb-3 text-[15px] leading-[1.3] font-semibold';
const RICH_VALUES: SimulatorRich[] = ['simple', 'rich'];

/**
 * The questions of the simulator. The steps of the supports that are not picked are not drawn, and the
 * numbers of the steps shown follow each other.
 */
const SimulatorForm = ({ state, estimate, dispatch }: Props) => {
  const t = useTranslations('SimulatorPage');
  const { formatPrice: money } = useCurrency();
  const designRate = SIMULATOR_PRICING.design[state.bring];
  const pickedSupports = SIMULATOR_SUPPORTS.filter(support => state.sup[support]);
  // the steps before the supports are the bring and the platforms ones
  const firstSupportNumber = 3;
  const getSupportNumber = (support: (typeof SIMULATOR_SUPPORTS)[number]) =>
    firstSupportNumber + pickedSupports.indexOf(support);

  const renderPayment = (support: 'mobile' | 'app') => (
    <SimulatorPayment
      count={state.payN[support]}
      countLabel={t('payment.count')}
      help={t('payment.help', { a: money(SIMULATOR_PRICING.payExtra) })}
      hint={t('payment.hint')}
      isOn={state.pay[support]}
      onCountChange={value => dispatch({ type: 'setPaymentCount', support, value })}
      onToggle={isOn => dispatch({ type: 'setPayment', support, isOn })}
      title={t('payment.title')}
    />
  );

  const renderScreens = (support: (typeof SIMULATOR_SUPPORTS)[number]) => (
    <SimulatorScreens
      label={t('screens')}
      onChange={value => dispatch({ type: 'setScreens', support, value })}
      unitPrice={t('screenUnit', { a: money(estimate.unitPrices[support]) })}
      value={state[support]}
    />
  );

  return (
    <form noValidate className="grid gap-5" onSubmit={event => event.preventDefault()}>
      <SimulatorStep number={1} title={t('steps.bring')}>
        <div className={OPTIONS_CLASS_NAME}>
          {SIMULATOR_BRING.map((value: SimulatorBring) => (
            <OptionCard
              checked={state.bring === value}
              hint={t(`bring.${value}.hint`)}
              key={value}
              label={t(`bring.${value}.title`)}
              name="simulator-bring"
              onChange={() => dispatch({ type: 'setBring', value })}
              type="radio"
              value={value}
            />
          ))}
        </div>
        <div
          aria-live="polite"
          className={`
            grid gap-1 rounded-md border border-brand bg-[color-mix(in_oklab,var(--brand)_10%,var(--card))]
            p-4 text-[15px]
          `}
        >
          <b className="leading-[1.3] font-semibold">{t('design.label')}</b>
          <span>{designRate ? t('design.perScreen', { a: money(designRate) }) : t('design.none')}</span>
        </div>
      </SimulatorStep>

      <SimulatorStep number={2} title={t('steps.platforms')}>
        <p className="text-[15px] text-pretty text-muted-foreground">{t('platforms.help')}</p>
        <div className={OPTIONS_CLASS_NAME}>
          {SIMULATOR_SUPPORTS.map(support => (
            <OptionCard
              checked={state.sup[support]}
              key={support}
              label={t(`platforms.${support}`)}
              onChange={event => dispatch({
                type: 'setSupport',
                support,
                isPicked: event.target.checked,
              })}
            />
          ))}
        </div>
        {pickedSupports.length > 0 && (
          <dl
            className={`
              m-0 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm leading-[1.4]
              text-muted-foreground
            `}
          >
            {pickedSupports.map(support => (
              <div className="contents" key={support}>
                <dt className="font-semibold text-foreground">{t(`platforms.${support}`)}</dt>
                <dd className="m-0">{t(`platforms.examples.${support}`)}</dd>
              </div>
            ))}
          </dl>
        )}
      </SimulatorStep>

      {state.sup.web && (
        <SimulatorStep number={getSupportNumber('web')} title={t('steps.web')}>
          {renderScreens('web')}
        </SimulatorStep>
      )}

      {state.sup.app && (
        <SimulatorStep number={getSupportNumber('app')} title={t('steps.app')}>
          {renderScreens('app')}
          <fieldset className={SUB_CLASS_NAME}>
            <legend className={SUB_LEGEND_CLASS_NAME}>{t('rich.question')}</legend>
            <div className={OPTIONS_CLASS_NAME}>
              {RICH_VALUES.map(value => (
                <OptionCard
                  checked={state.rich === value}
                  hint={t(`rich.${value}.hint`)}
                  key={value}
                  label={t(`rich.${value}.title`)}
                  name="simulator-rich"
                  onChange={() => dispatch({ type: 'setRich', value })}
                  type="radio"
                  value={value}
                />
              ))}
            </div>
          </fieldset>
          {renderPayment('app')}
        </SimulatorStep>
      )}

      {state.sup.mobile && (
        <SimulatorStep number={getSupportNumber('mobile')} title={t('steps.mobile')}>
          {renderScreens('mobile')}
          <div className={SUB_CLASS_NAME}>
            <OptionCard
              checked={state.chat}
              hint={t('chat.hint')}
              label={t('chat.title')}
              onChange={event => dispatch({ type: 'setChat', isOn: event.target.checked })}
            />
          </div>
          {renderPayment('mobile')}
        </SimulatorStep>
      )}

      {state.sup.bo && (
        <SimulatorStep number={getSupportNumber('bo')} title={t('steps.bo')}>
          {renderScreens('bo')}
        </SimulatorStep>
      )}

      <SimulatorStep number={firstSupportNumber + pickedSupports.length} title={t('steps.maintenance')}>
        <SimulatorMaintenance />
      </SimulatorStep>
    </form>
  );
};

export default SimulatorForm;
