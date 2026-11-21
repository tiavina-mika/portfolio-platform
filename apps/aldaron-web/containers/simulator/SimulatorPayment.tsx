'use client';

import { useId } from 'react';

import OptionCard from '@/components/forms/OptionCard';
import { SIMULATOR_PAYMENT_COUNTS } from '@/utils/simulator.constants';

type Props = {
  /**
   * The name of the option: "Online payment"
   */
  title: string;
  hint: string;
  /**
   * The name of the number of integrations field
   */
  countLabel: string;
  /**
   * Tells what an integration beyond the first one costs
   */
  help: string;
  isOn: boolean;
  count: number;
  onToggle: (isOn: boolean) => void;
  onCountChange: (count: number) => void;
};

/**
 * The online payment option of a support: a choice, then, once it is on, how many integrations are
 * needed
 */
const SimulatorPayment = ({
  title, hint, countLabel, help, isOn, count, onToggle, onCountChange,
}: Props) => {
  const id = useId();

  return (
    <div className="grid gap-3 border-t border-border pt-4">
      <OptionCard
        checked={isOn}
        hint={hint}
        label={title}
        onChange={event => onToggle(event.target.checked)}
      />
      {isOn && (
        <div className="grid gap-3">
          <label className="leading-[1.3] font-semibold" htmlFor={`${id}-count`}>{countLabel}</label>
          <select
            aria-describedby={`${id}-help`}
            id={`${id}-count`}
            onChange={event => onCountChange(Number(event.target.value))}
            value={count}
            className={`
              h-11 max-w-35 cursor-pointer rounded-md border border-input bg-background px-3 font-mono
              text-base font-medium
            `}
          >
            {SIMULATOR_PAYMENT_COUNTS.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <p className="text-[15px] text-pretty text-muted-foreground" id={`${id}-help`}>{help}</p>
        </div>
      )}
    </div>
  );
};

export default SimulatorPayment;
