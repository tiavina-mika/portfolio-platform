import { useTranslations } from 'next-intl';

import CtaBand from '@/components/layouts/CtaBand';
import PageHero from '@/components/layouts/PageHero';
import PageSection from '@/components/layouts/PageSection';
import AboutAudience from '@/containers/about/AboutAudience';
import AboutPrinciples from '@/containers/about/AboutPrinciples';
import { ROUTES } from '@/i18n/routes';

/**
 * The about page: who Aldaron is, how it works, who it works for, then an invitation to talk
 */
const AboutPage = () => {
  const t = useTranslations('AboutPage');

  return (
    <div className="flex flex-col self-stretch">
      <PageHero
        description={t('description')}
        descriptionClassName="max-w-[60ch]"
        eyebrow={t('eyebrow')}
        title={t('title')}
        className={`
          pb-10
          md:pb-16
        `}
      />
      <AboutPrinciples />
      <AboutAudience />
      <PageSection
        aria-labelledby="about-cta-title"
        className={`
          pb-0
          md:pb-0
        `}
      >
        <CtaBand
          cta={{ label: t('cta.quote'), href: ROUTES.contact }}
          description={t('cta.description')}
          title={t('cta.title')}
          titleId="about-cta-title"
        />
      </PageSection>
    </div>
  );
};

export default AboutPage;
