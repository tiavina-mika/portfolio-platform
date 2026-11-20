import { ReactNode } from 'react';

type Props = {
  /**
   * The rank of the step among the steps shown
   */
  number: number;
  title: string;
  children: ReactNode;
};

/**
 * One question of the simulator: a card with a numbered title, grouping the controls that answer it
 */
const SimulatorStep = ({ number, title, children }: Props) => (
  <fieldset
    className={`
      grid min-w-0 gap-4 rounded-lg border border-border bg-card p-4
      sm:p-6
      [&>legend+*]:clear-both
    `}
  >
    <legend
      className={`
        float-left mb-4 flex w-full items-center gap-3 p-0 text-xl leading-tight font-bold tracking-[-0.01em]
      `}
    >
      <span
        aria-hidden
        className={`
          grid size-7 flex-none place-items-center rounded-md bg-primary font-mono text-[13px] font-medium
          text-primary-foreground
        `}
      >
        {number}
      </span>
      {title}
    </legend>
    {children}
  </fieldset>
);

export default SimulatorStep;
