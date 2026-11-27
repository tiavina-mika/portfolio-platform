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
          className="max-w-[62ch]"
          description={t('lead')}
          descriptionClassName="max-w-none md:text-lg"
          eyebrow={t('eyebrow')}
          level={1}
          title={t('title')}
          titleClassName={`
            max-w-none text-[clamp(30px,7vw,52px)] leading-[1.05] tracking-[-0.03em]
            md:text-[52px]
            lg:text-[52px]
          `}
        />
        <SimulatorProvider />
      </Section>
    </div>
  );
};

export default SimulatorPage;
