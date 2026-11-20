import { useTranslations } from 'next-intl';

import ButtonLink from '@/components/buttons/ButtonLink';
import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import {
  Card, CardContent, CardDescription, CardEyebrow, CardHeader, CardTitle,
} from '@/components/ui/Card';
import Price from '@/containers/currency/Price';
import { ROUTES } from '@/i18n/routes';
import { HOME_PROJECTS } from '@/utils/home.constants';

const TITLE_ID = 'home-projects-title';

/**
 * Three delivered products at a fixed price: what it is, what it is made of, how long it took and what
 * it cost, then the link to every project
 */
const HomeProjects = () => {
  const t = useTranslations('Home.projects');

  return (
    <PageSection aria-labelledby={TITLE_ID} id="projects">
      <SectionIntro eyebrow={t('eyebrow')} title={t('title')} titleId={TITLE_ID} />
      <ul
        className={'m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-stretch gap-4 p-0'}
      >
        {HOME_PROJECTS.map(project => (
          <li className="flex" key={project.key}>
            <Card as="article">
              <CardHeader>
                <div>
                  <CardEyebrow>{t(`items.${project.key}.eyebrow`)}</CardEyebrow>
                  <CardTitle gutterBottom={false} level={3}>{project.name}</CardTitle>
                  <CardDescription>{t(`items.${project.key}.summary`)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="gap-4">
                <div
                  className={`
                    grid aspect-[16/10] place-items-center rounded-md border border-border
                    bg-[repeating-linear-gradient(135deg,var(--muted)_0_12px,var(--card)_12px_24px)] p-3
                    text-center font-mono text-xs leading-[1.4] text-muted-foreground
                  `}
                >
                  {t('screenshot')}
                </div>
                <span className="font-mono text-[13px] leading-normal text-muted-foreground">
                  {project.supports.map(support => t(`supports.${support}`)).join(' · ')}
                  {' · '}
                  {project.weeks}
                  {' '}
                  {t('weeks')}
                  {' · '}
                  <Price amount={project.price} />
                </span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <div>
        <ButtonLink href={ROUTES.projects.root} size="lg" variant="outline">{t('all')}</ButtonLink>
      </div>
    </PageSection>
  );
};

export default HomeProjects;
