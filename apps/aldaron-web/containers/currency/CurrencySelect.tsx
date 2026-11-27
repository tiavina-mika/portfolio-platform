'use client';

import { ChevronDown } from 'lucide-react';
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
      <div className="relative flex">
        <select
          aria-describedby={isNoteShown ? noteId : undefined}
          aria-label={t('currency')}
          onChange={handleChange}
          value={currency}
          className={cn(
            `
              h-9 cursor-pointer appearance-none rounded-md border border-input bg-transparent bg-none py-0
              pr-7 pl-2.5 font-mono text-[13px] leading-none font-medium tracking-[0.04em] text-foreground
              hover:bg-muted
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
              [&>option]:bg-popover [&>option]:text-popover-foreground
            `,
            className
          )}
        >
          {CURRENCIES.map(value => (
            <option key={value} value={value}>{CURRENCY_LABELS[value]}</option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={12}
          className={`
            pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 stroke-[2.5] text-muted-foreground
          `}
        />
      </div>
      {isNoteShown && (
        <span className="font-mono text-xs text-muted-foreground" id={noteId}>
          {t('indicativeRate')}
        </span>
      )}
    </div>
  );
};

export default CurrencySelect;
