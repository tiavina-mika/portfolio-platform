import { useTranslations } from 'next-intl';

import CtaBand from '@/components/layouts/CtaBand';
import PageSection from '@/components/layouts/PageSection';
import HomeHero from '@/containers/home/hero/HomeHero';
import HomeIncluded from '@/containers/home/included/HomeIncluded';
import HomeProcess from '@/containers/home/process/HomeProcess';
import HomeProjects from '@/containers/home/projects/HomeProjects';
import HomeSupports from '@/containers/home/supports/HomeSupports';
import { ROUTES } from '@/i18n/routes';

/**
 * The home page layout: the order of the sections, ending with the invitation to the simulator and the
 * call to ask for a firm quote
 */
const HomePage = () => {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col self-stretch">
      <HomeHero />
      <HomeSupports />
      <HomeIncluded />
      <HomeProcess />
      <HomeProjects />
      <PageSection aria-labelledby="home-simulator-title" id="simulator">
        <CtaBand
          cta={{ label: t('simulator.cta'), href: ROUTES.simulator }}
          description={t('simulator.description')}
          eyebrow={t('simulator.eyebrow')}
          layout="stacked"
          title={t('simulator.title')}
          titleId="home-simulator-title"
          variant="inverted"
        />
      </PageSection>
      <PageSection
        aria-labelledby="home-contact-title"
        id="contact"
        className={`
          pb-0
          md:pb-0
        `}
      >
        <CtaBand
          cta={{ label: t('contact.cta'), href: ROUTES.contact }}
          description={t('contact.description')}
          title={t('contact.title')}
          titleId="home-contact-title"
        />
      </PageSection>
    </div>
  );
};

export default HomePage;
