'use client';

import { useCurrency } from '@/hooks/useCurrency';

type Props = {
  /**
   * A text whose prices are written in euros, e.g. "À partir de 1 500 €". Every price in it is
   * written in the currency the visitor chose.
   */
  text?: string;
  /**
   * An amount in euros, written alone
   */
  amount?: number;
  className?: string;
};

/**
 * A price, or a text holding prices, in the currency the visitor chose (the euro by default). The
 * prices of the site are always written in euros: this is the only place they are converted.
 */
const Price = ({ text, amount, className }: Props) => {
  const { convertPrices, formatPrice } = useCurrency();

  return (
    <span className={className}>
      {amount === undefined ? convertPrices(text ?? '') : formatPrice(amount)}
    </span>
  );
};

export default Price;
