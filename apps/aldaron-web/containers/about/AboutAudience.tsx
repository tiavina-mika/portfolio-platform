import { useTranslations } from 'next-intl';

import ButtonLink from '@/components/buttons/ButtonLink';
import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import { ROUTES } from '@/i18n/routes';
import { cn } from '@/utils/app.utils';

const BUILD_ITEMS = ['1', '2', '3', '4'];
const AVOID_ITEMS = ['1', '2'];

type ListProps = {
  title: string;
  /**
   * The mark before each line: a plus for what is done, a minus for what is not
   */
  mark: string;
  markClassName: string;
  items: string[];
};

const AudienceList = ({
  title, mark, markClassName, items,
}: ListProps) => (
  <div className="grid gap-3">
    <h3 className="font-sans text-lg leading-[1.3] font-semibold tracking-normal">{title}</h3>
    <ul className="m-0 grid list-none gap-2.5 p-0 text-base leading-[1.45]">
      {items.map(item => (
        <li className="flex gap-2.5" key={item}>
          <span aria-hidden className={cn('font-mono text-[15px] leading-[1.45]', markClassName)}>{mark}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Who Aldaron works for, and what it builds and does not build
 */
const AboutAudience = () => {
  const t = useTranslations('AboutPage.audience');

  return (
    <PageSection
      aria-labelledby="about-audience-title"
      className={'grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-x-16 gap-y-10'}
    >
      <SectionIntro
        className="gap-4"
        description={t('text')}
        descriptionClassName="max-w-none leading-[1.6]"
        eyebrow={t('eyebrow')}
        title={t('title')}
        titleId="about-audience-title"
      />
      <div className="grid gap-8">
        <AudienceList
          items={BUILD_ITEMS.map(key => t(`build.items.${key}`))}
          mark="+"
          markClassName="text-brand-text"
          title={t('build.title')}
        />
        <AudienceList
          items={AVOID_ITEMS.map(key => t(`avoid.items.${key}`))}
          mark="−"
          markClassName="text-muted-foreground"
          title={t('avoid.title')}
        />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ROUTES.pricing} size="lg" variant="outline">
            {t('pricing')}
          </ButtonLink>
        </div>
      </div>
    </PageSection>
  );
};

export default AboutAudience;
