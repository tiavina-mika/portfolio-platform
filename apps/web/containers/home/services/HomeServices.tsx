import { useTranslations } from 'next-intl';

import RevealListItem from '@/components/animation/RevealListItem';
import Section from '@/components/layouts/Section';
import SectionTitle from '@/components/typography/SectionTitle';
import {
  PageWebIcon,
  SearchIcon,
  SuccessIcon,
  UserIcon,
} from '@/containers/home/services/HomeServicesIcons';

const SERVICES = [
  { key: '1', icon: <PageWebIcon className="size-6" /> },
  { key: '2', icon: <UserIcon className="size-6" /> },
  { key: '3', icon: <SearchIcon className="size-6" /> },
  { key: '4', icon: <SuccessIcon className="size-6" /> },
];

/**
 * What I can do for a client, as a grid of cards. Static: the texts come from the translations
 */
const HomeServices = () => {
  const t = useTranslations('HomeServices');

  return (
    <Section className="flex flex-col" rootClassName="mt-2 mb-10 md:mb-20 lg:mb-24">
      <SectionTitle>{t('title')}</SectionTitle>
      <ul className={`
        grid list-none grid-cols-1 gap-4 p-0
        md:grid-cols-2
      `}
      >
        {SERVICES.map(({ key, icon }, index) => (
          <RevealListItem className="flex min-w-0" index={index} key={key}>
            <article className="flex flex-1 flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground">
              <span
                aria-hidden
                className="inline-flex size-12 flex-none items-center justify-center rounded-lg bg-accent"
              >
                {/* strokes use currentColor, so the icon follows light and dark mode */}
                {icon}
              </span>
              <h3 className="text-lg leading-tight font-bold">{t(`items.${key}.title`)}</h3>
              <p className="text-base leading-normal text-muted-foreground">
                {t(`items.${key}.description`)}
              </p>
            </article>
          </RevealListItem>
        ))}
      </ul>
    </Section>
  );
};

export default HomeServices;
