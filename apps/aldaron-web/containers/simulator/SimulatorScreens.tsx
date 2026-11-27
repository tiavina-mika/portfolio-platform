'use client';

import { useId, useState } from 'react';

import { SCREENS_MAX } from '@/utils/simulator.constants';
import { clampScreens } from '@/utils/simulator.utils';

type Props = {
  /**
   * The name of the field: "Number of screens (approximate)"
   */
  label: string;
  /**
   * What one screen costs, written: "20 € / écran"
   */
  unitPrice: string;
  value: number;
  onChange: (value: number) => void;
};

const NUMBER_CLASS_NAME = `
  h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-base font-medium
`;

/**
 * The number of screens of a support: a slider and a number field that follow each other. Typing keeps
 * what is written until the field is left, so clearing it to type another number is not undone; leaving
 * it empty counts as zero screens.
 */
const SimulatorScreens = ({
  label, unitPrice, value, onChange,
}: Props) => {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (text !== '') onChange(clampScreens(text));
  };

  const handleBlur = () => {
    if (draft === null) return;

    onChange(clampScreens(draft));
    setDraft(null);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <label className="leading-[1.3] font-semibold" htmlFor={`${id}-number`} id={`${id}-label`}>
          {label}
        </label>
        <span
          className="font-mono text-[13px] leading-[1.3] font-medium whitespace-nowrap text-muted-foreground"
          id={`${id}-unit`}
        >
          {unitPrice}
        </span>
      </div>
      <div
        className={`
          grid grid-cols-[minmax(0,1fr)_92px] items-center gap-4
          min-[480px]:grid-cols-[minmax(0,1fr)_110px]
        `}
      >
        <input
          aria-labelledby={`${id}-label`}
          className="m-0 h-11 w-full cursor-pointer accent-brand"
          max={SCREENS_MAX}
          min={0}
          step={1}
          type="range"
          value={value}
          onChange={event => {
            setDraft(null);
            onChange(clampScreens(event.target.value));
          }}
        />
        <input
          aria-describedby={`${id}-unit`}
          className={NUMBER_CLASS_NAME}
          id={`${id}-number`}
          inputMode="numeric"
          max={SCREENS_MAX}
          min={0}
          onBlur={handleBlur}
          onChange={event => handleDraftChange(event.target.value)}
          step={1}
          type="number"
          value={draft ?? value}
        />
      </div>
    </div>
  );
};

export default SimulatorScreens;
