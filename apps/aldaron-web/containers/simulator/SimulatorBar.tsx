import Button from '@/components/buttons/Button';

type Props = {
  /**
   * The big price of the estimate, written
   */
  priceLabel: string;
  /**
   * The short name of the quote action
   */
  actionLabel: string;
  onAction: () => void;
};

/**
 * The bar that stays at the bottom of the screen below 880px, where the estimate is far above: the price
 * and the quote action are always at hand. The price is already read in the estimate, so it is hidden here.
 */
const SimulatorBar = ({ priceLabel, actionLabel, onAction }: Props) => (
  <div
    className={`
      sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-popover
      px-4 py-3 shadow-lg
      min-[880px]:hidden
      md:-mx-6 md:px-6
    `}
  >
    <p
      aria-hidden
      className="m-0 font-display text-[22px] leading-[1.05] font-bold tracking-[-0.03em] tabular-nums"
    >
      {priceLabel}
    </p>
    <Button className="max-w-[48%] flex-none" onClick={onAction} variant="brand">
      {actionLabel}
    </Button>
  </div>
);

export default SimulatorBar;
