'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useId } from 'react';

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
  const { currency, setCurrency, isRateIndicative } = useCurrency();
  const noteId = useId();
  // the note only matters once a converted price is on screen
  const isNoteShown = isRateIndicative && currency !== 'EUR';

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value as Currency);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-describedby={isNoteShown ? noteId : undefined}
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
      {isNoteShown && (
        <span className="font-mono text-xs text-muted-foreground" id={noteId}>
          {t('indicativeRate')}
        </span>
      )}
    </div>
  );
};

export default CurrencySelect;
