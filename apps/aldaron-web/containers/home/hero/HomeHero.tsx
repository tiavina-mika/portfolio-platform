import { useTranslations } from 'next-intl';

import ButtonLink from '@/components/buttons/ButtonLink';
import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import Price from '@/containers/currency/Price';
import { ROUTES } from '@/i18n/routes';
import { HOME_FACT_KEYS } from '@/utils/home.constants';

/**
 * The top of the home page: what Aldaron does, the two calls to action and the three facts that
 * reassure (the entry price, the fixed price, the bug fixes)
 */
const HomeHero = () => {
  const t = useTranslations('Home.hero');

  return (
    <PageSection
      hasDivider={false}
      className={`
        items-start gap-7
        md:pt-18
      `}
    >
      <SectionIntro
        className="gap-7"
        description={t('description')}
        eyebrow={t('eyebrow')}
        level={1}
        title={t('title')}
      />
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={ROUTES.simulator} size="lg" variant="brand">{t('ctaSimulator')}</ButtonLink>
        <ButtonLink href={ROUTES.pricing} size="lg" variant="outline">{t('ctaPricing')}</ButtonLink>
      </div>
      <ul
        className={`
          m-0 flex list-none flex-wrap gap-x-8 gap-y-3 p-0 pt-4 font-mono text-[13px] leading-[1.4]
          tracking-[0.04em] text-muted-foreground
        `}
      >
        {HOME_FACT_KEYS.map(key => (
          <li className="flex items-center gap-2" key={key}>
            <span aria-hidden className="block size-1.5 flex-none bg-brand" />
            <Price text={t(`facts.${key}`)} />
          </li>
        ))}
      </ul>
    </PageSection>
  );
};

export default HomeHero;
