import Price from '@/containers/currency/Price';

type Props = {
  /**
   * The option: "Online payment"
   */
  label: string;
  /**
   * What the option covers and how it is counted
   */
  description: string;
  /**
   * What it adds to the price, written in euros (converted by `Price`)
   * @example '€6 to €8 / screen'
   */
  price: string;
};

/**
 * A line of the options: the label and its precision, the price in mono at the end (under the label
 * when the box is narrow). Goes in a `PriceList`.
 */
const OptionLine = ({ label, description, price }: Props) => (
  <li
    className={`
      grid items-baseline gap-3 border-t border-border px-6 py-5
      first:border-t-0
      sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8
    `}
  >
    <div className="grid gap-1">
      <b className="text-[17px] leading-[1.3] font-semibold">{label}</b>
      <span className="max-w-[60ch] text-[15px] leading-normal text-pretty text-muted-foreground">
        {description}
      </span>
    </div>
    <span
      className={`
        font-display text-[22px] leading-[1.2] font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums
        sm:text-right
      `}
    >
      <Price text={price} />
    </span>
  </li>
);

export default OptionLine;
