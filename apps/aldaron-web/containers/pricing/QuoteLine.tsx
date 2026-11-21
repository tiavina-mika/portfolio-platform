import Price from '@/containers/currency/Price';

type Props = {
  /**
   * The case: "Showcase website"
   */
  title: string;
  /**
   * What the case holds, in one line
   */
  detail: string;
  /**
   * The price of the case, written in euros (converted by `Price`)
   * @example '1 500 €'
   */
  price: string;
};

/**
 * A line of a quote: the case, what it holds, its price. Goes in a `PriceList`.
 */
const QuoteLine = ({ title, detail, price }: Props) => (
  <li
    className={`
      grid gap-3 border-t border-border px-6 py-5
      first:border-t-0
      sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center
    `}
  >
    <div className="grid gap-1">
      <b className="text-[17px] leading-[1.3] font-semibold">{title}</b>
      <span className="font-mono text-[13px] leading-[1.4] font-medium text-muted-foreground">
        {detail}
      </span>
    </div>
    <span className="font-display text-2xl leading-[1.2] font-bold tracking-[-0.02em] tabular-nums">
      <Price text={price} />
    </span>
  </li>
);

export default QuoteLine;
