import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import Projects from '@/containers/project/Projects';
import ProjectsHeader from '@/containers/project/ProjectsHeader';
import { locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { ISearchParams } from '@/types/app.type';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';
import { getSocialMetadata } from '@/utils/og.utils';
import { projectSearchParamsSchema } from '@/validations/app.validations';

import ProjectsPage from './ProjectsPage';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async (
  props: MetaDataProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tOg = await getTranslations({ locale, namespace: 'OpenGraph' });

  const keywords = (await parent).keywords || [];

  // canonical always points to the unfiltered, page-1 listing — filters/pagination are not canonical
  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.projects.root, { locale: loc })])
  );
  const title = t('projects.metaTitle');
  const description = t('projects.metaDescription');

  return {
    title,
    description,
    keywords: [...keywords, 'projects', 'portfolio'],
    alternates: getAlternates(urlsByLocale, locale),
    ...getSocialMetadata({
      card: {
        layout: OgCardLayoutEnum.CENTERED,
        chip: tOg('projects.chip'),
        title: tOg('projects.title', { appName: APP_NAME }),
        subtitle: tOg('projects.subtitle'),
      },
      title,
      description,
      url: urlsByLocale[locale],
      locale,
    }),
  };
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<ISearchParams>;
};

const ProjectsContent = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const parsedSearchParams = projectSearchParamsSchema.parse(searchParams);
  const page = parseInt(parsedSearchParams.page, 10) || 1;
  const {
    order, orderedBy, tag, technologies,
  } = parsedSearchParams;

  // the filters and the sort that the links of the pagination keep
  const linkSearchParams: Record<string, string> = {
    ...(tag ? { tag } : {}),
    ...(technologies ? { technologies } : {}),
    ...(orderedBy ? { orderedBy } : {}),
    ...(order === 'asc' ? { order } : {}),
  };

  return (
    <ProjectsPage
      header={<ProjectsHeader locale={locale} />}
      projects={(
        <Projects
          locale={locale}
          order={order}
          orderedBy={orderedBy}
          page={page}
          searchParams={linkSearchParams}
          tag={tag}
          technologies={technologies}
        />
      )}
    />
  );
};

/**
 * this route reads `searchParams` (pagination/filters), which — unlike `params` — is never
 * covered by `generateStaticParams` and so is always request-time data — wrapped in its own
 * `<Suspense>` boundary so `cacheComponents` can still validate/prerender the static shell
 * (nav/footer) around it
 */
const ProjectsApp = (props: Props) => (
  <Suspense fallback={null}>
    <ProjectsContent {...props} />
  </Suspense>
);

export default ProjectsApp;
