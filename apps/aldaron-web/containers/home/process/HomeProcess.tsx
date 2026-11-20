import { useTranslations } from 'next-intl';

import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import { HOME_PROCESS_STEP_KEYS } from '@/utils/home.constants';

const TITLE_ID = 'home-process-title';

/**
 * How a project goes: four numbered steps, three of them with the share of the price paid at that
 * moment (the scoping is free, so it has none)
 */
const HomeProcess = () => {
  const t = useTranslations('Home.process');

  return (
    <PageSection aria-labelledby={TITLE_ID} id="process">
      <SectionIntro eyebrow={t('eyebrow')} title={t('title')} titleId={TITLE_ID} />
      <ol
        className={'m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-0'}
      >
        {HOME_PROCESS_STEP_KEYS.map(key => (
          <li
            className="grid content-start gap-2.5 border-t-2 border-foreground pt-4"
            key={key}
          >
            <span
              className="font-mono text-xs leading-none font-medium tracking-[0.08em] text-brand-text"
            >
              {`0${key}`}
            </span>
            <b className="font-display text-xl leading-tight font-bold tracking-[-0.01em]">
              {t(`steps.${key}.title`)}
            </b>
            <span className="text-[15px] leading-normal text-pretty text-muted-foreground">
              {t(`steps.${key}.description`)}
            </span>
            {t.has(`steps.${key}.payment`) && (
              <span className="font-mono text-sm leading-none font-semibold">
                {t(`steps.${key}.payment`)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </PageSection>
  );
};

export default HomeProcess;
