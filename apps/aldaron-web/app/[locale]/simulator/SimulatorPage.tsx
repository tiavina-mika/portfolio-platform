import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import SectionIntro from '@/components/layouts/SectionIntro';
import SimulatorProvider from '@/containers/simulator/SimulatorProvider';

/**
 * The simulator page layout: the introduction, then the simulator
 */
const SimulatorPage = () => {
  const t = useTranslations('SimulatorPage');

  return (
    <div className="flex flex-col self-stretch">
      <Section className="flex-col gap-8 pt-8 pb-12">
        <SectionIntro
          description={t('lead')}
          eyebrow={t('eyebrow')}
          level={1}
          title={t('title')}
          titleClassName="max-w-none text-[30px] md:text-[48px] lg:text-[52px]"
        />
        <SimulatorProvider />
      </Section>
    </div>
  );
};

export default SimulatorPage;
