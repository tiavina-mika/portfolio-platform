'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { useCurrency } from '@/hooks/useCurrency';
import { Currency } from '@/types/app.type';
import { cn } from '@/utils/app.utils';
import { CURRENCIES } from '@/utils/constants';

const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: '€ EUR',
  USD: '$ USD',
  MGA: 'Ar MGA',
};

type Props = {
  className?: string;
};

/**
 * The currency the prices are shown in. A native select: it opens the system picker on a phone.
 */
const CurrencySelect = ({ className }: Props) => {
  const t = useTranslations('NavBar');
  const { currency, setCurrency } = useCurrency();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value as Currency);
  };

  return (
    <select
      aria-label={t('currency')}
      onChange={handleChange}
      value={currency}
      className={cn(
        `
          h-11 cursor-pointer rounded-md border border-input bg-transparent px-2.5 font-mono text-[13px]
          font-medium tracking-[0.04em] text-foreground
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
        `,
        className
      )}
    >
      {CURRENCIES.map(value => (
        <option key={value} value={value}>{CURRENCY_LABELS[value]}</option>
      ))}
    </select>
  );
};

export default CurrencySelect;
