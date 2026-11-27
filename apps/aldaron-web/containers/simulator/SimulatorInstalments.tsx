'use client';

import { useTranslations } from 'next-intl';

import { SIMULATOR_INSTALMENTS } from '@/utils/simulator.constants';

type Props = {
  /**
   * What else the answers change in the way the project is paid, one paragraph each
   */
  notes: string[];
};

/**
 * How the price is paid: the three instalments, each with its share and its moment, then the notes
 */
const SimulatorInstalments = ({ notes }: Props) => {
  const t = useTranslations('SimulatorPage.result.payment');

  return (
    <div className="grid gap-5 border-t border-border pt-4">
      <div className="grid gap-4">
        <p className="m-0 text-[15px] text-pretty text-muted-foreground">{t('intro')}</p>
        <ul className="m-0 grid list-none p-0">
          {SIMULATOR_INSTALMENTS.map(moment => (
            <li
              className="grid grid-cols-[56px_minmax(0,1fr)] items-baseline gap-3 border-t border-border py-2"
              key={moment}
            >
              <span className="font-mono text-sm font-medium">{t(`${moment}.share`)}</span>
              <span>{t(`${moment}.when`)}</span>
            </li>
          ))}
        </ul>
      </div>
      {notes.map(note => (
        <p className="m-0 text-sm leading-[1.4] text-pretty text-muted-foreground" key={note}>{note}</p>
      ))}
    </div>
  );
};

export default SimulatorInstalments;
