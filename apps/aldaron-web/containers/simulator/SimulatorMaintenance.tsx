'use client';

import { useTranslations } from 'next-intl';

import { useCurrency } from '@/hooks/useCurrency';
import { SIMULATOR_MAINTENANCE_TIERS } from '@/utils/simulator.constants';

/**
 * The optional maintenance offers: what each one costs per month and covers. Nothing is chosen here, and
 * none of it counts in the estimate.
 */
const SimulatorMaintenance = () => {
  const t = useTranslations('SimulatorPage.maintenance');
  const { formatPrice: money } = useCurrency();

  return (
    <div className="grid gap-7">
      <p className="m-0">{t('hint')}</p>
      {/* the price column is shared by the rows: it widens when a price in ariary needs it */}
      <ul className="m-0 grid list-none grid-cols-[minmax(96px,max-content)_minmax(0,1fr)] gap-x-4 p-0">
        {SIMULATOR_MAINTENANCE_TIERS.map(tier => (
          <li
            className="col-span-2 grid grid-cols-subgrid items-baseline border-t border-border py-3"
            key={tier.id}
          >
            <span className="font-mono text-sm font-medium text-brand-text">
              {t('price', { a: money(tier.price) })}
            </span>
            <span>
              <b className="block font-semibold">{t(`tiers.${tier.id}.name`)}</b>
              <span className="text-sm leading-[1.4] text-muted-foreground">
                {t(`tiers.${tier.id}.description`)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimulatorMaintenance;
