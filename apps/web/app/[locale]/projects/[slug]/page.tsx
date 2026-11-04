import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import { titleCase } from 'string-ts';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import Newsletter from '@/containers/newsletter/NewsLetter';
import NonPaginatedProjects from '@/containers/project/NonPaginatedProjects';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getProject, getProjectSlugsForLocale } from '@/server/queries/project.queries';
import { IError } from '@/types/app.type';
import { OgCard, OgCardLayoutEnum } from '@/types/og.type';
import { IProject } from '@/types/project.type';
import { getAbsoluteUrl, getAlternates } from '@/utils/app.utils';
import { GENERATE_STATIC_PARAMS_FALLBACK_SLUG } from '@/utils/constants';
import { getProjectJsonLd } from '@/utils/jsonLd.utils';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { generateOGImageUrl, getSocialImages } from '@/utils/og.utils';
import { getTranslatedField } from '@/utils/translation.utils';

import ProjectPage from './ProjectPage';

const getCachedProject = cache(
  async (slug: string, locale: Locale): Promise<IProject | null> => {
    const project = await getProject(slug, locale);

    // no project or an error
    if (!project || (project as IError)?.error) return null;

    return project as IProject;
  }
);

/**
 * the share card of a project: its society in the chip (the portfolio when it has none) and its
 * title as the page heading shows it — not the meta title, which is written for search engines
 */
const getProjectOgCard = async (project: IProject, locale: Locale): Promise<OgCard> => {
  const t = await getTranslations({ locale, namespace: 'OpenGraph' });

  return {
    layout: OgCardLayoutEnum.LEFT,
    chip: project.society || t('projects.chip'),
    title: getTranslatedField(project.translated, locale, 'title'),
  };
};

/**
 * prerenders every published project at build time, per locale. Slugs missing at build time still
 * render on demand (dynamicParams defaults to true).
 */
export const generateStaticParams = async ({ params }: { params: { locale: string } }) => {
  const locale = params.locale as Locale;
  const slugs = await getProjectSlugsForLocale(locale);

  // `cacheComponents` requires at least one result — see GENERATE_STATIC_PARAMS_FALLBACK_SLUG
  if (slugs.length === 0) return [{ slug: GENERATE_STATIC_PARAMS_FALLBACK_SLUG }];

  return slugs.map((slug) => ({ slug }));
};

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const slug = params.slug;
  const locale = params.locale as Locale;
  const project = await getCachedProject(slug, locale);

  if (!project) return {};

  const translated = project.translated;

  const title =
    getTranslatedField(translated, locale, 'metaTitle') ||
    getTranslatedField(translated, locale, 'title');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');
  const tags = getTranslatedField(translated, locale, 'tags') || '';

  // the equivalent project URL for every locale, from each locale's own translated slug
  const projectsPath = retrievePathnameFromDynamicPathname(ROUTES.projects.preview().pathname);
  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [
      loc,
      getAbsoluteUrl(`/${loc}${projectsPath}${getTranslatedField(translated, loc, 'slug')}`),
    ])
  );
  const url = urlsByLocale[locale];

  const { openGraphImages, twitter } = getSocialImages(
    await getProjectOgCard(project, locale),
    titleCase(title),
    description
  );

  return {
    title: titleCase(title),
    description,
    keywords: tags ? tags.split(',').map((tag: string) => tag.trim()) : undefined,
    alternates: getAlternates(urlsByLocale, locale),
    openGraph: {
      title: titleCase(title),
      description,
      type: 'article',
      url,
      locale: locale || defaultLocale,
      images: openGraphImages,
    },
    twitter,
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const ProjectApp = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const tNavBar = await getTranslations('NavBar');
  const t = await getTranslations('Project');

  const project = await getCachedProject(slug, locale);

  if (!project) {
    notFound();
  }

  // derived from route params instead of `headers()`, so this route can be statically prerendered
  const projectsPath = retrievePathnameFromDynamicPathname(ROUTES.projects.preview().pathname);
  const currentPathname = getAbsoluteUrl(`/${locale}${projectsPath}${slug}`);

  const title = getTranslatedField(project.translated, locale, 'title');
  const ogImage = generateOGImageUrl(await getProjectOgCard(project, locale));

  const breadcrumbs: BreadcrumbsSegment[] = [
    { name: tNavBar('projects'), link: ROUTES.projects.root },
    { name: title, link: ROUTES.projects.preview(slug) },
  ];

  return (
    <>
      <JsonLd
        data={getProjectJsonLd({
          project,
          locale,
          url: currentPathname,
          image: project.image?.url || ogImage,
        })}
      />
      <ProjectPage
        breadcrumbs={breadcrumbs}
        currentPathname={currentPathname}
        locale={locale}
        newsletter={<Newsletter locale={locale} />}
        project={project}
        otherProjects={project.society && (
          <NonPaginatedProjects
            limit={18}
            locale={locale}
            otherThanProjectId={project.id}
            society={project.society}
            title={t('otherProjectsFrom', { society: project.society })}
            className={`
              pt-6
              md:pt-16
              xl:pt-6
            `}
          />
        )}
      />
    </>
  );
};

export default ProjectApp;
