
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache, Suspense } from 'react';
import { capitalize, titleCase } from 'string-ts';

import FadeInImage from '@/components/FadeImage';
import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import {
  Card, CardContent, CardHeader, CardImage,
} from '@/components/ui/Card';
import YouTube from '@/components/YouTube';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import Share from '@/containers/common/Share';
import Newsletter from '@/containers/newsletter/NewsLetter';
import NonPaginatedProjects from '@/containers/projects/NonPaginatedProjects';
import ProjectLinks from '@/containers/projects/ProjectLinks';
import ProjectSection from '@/containers/projects/ProjectSection';
import ProjectsSkeleton from '@/containers/projects/ProjectsSkeleton';
import { defaultLocale, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getProject } from '@/server/queries/project.queries';
import { IError, IUploadedFile } from '@/types/app.type';
import { IProject } from '@/types/project.type';
import { getAbsoluteUrl, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { generateOGImageUrl } from '@/utils/next.utils';
import { getSSRCurrentPathname } from '@/utils/server.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { slugify } from '@/utils/utils';

import { getCachedApp } from '../../page';

const getCachedProject = cache(
  async (slug: string, locale: Locale): Promise<IProject | null> => {
    const project = await getProject(slug, locale);

    // no project or an error
    if (!project || (project as IError)?.error) return null;

    return project as IProject;
  }
);

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
  const app = await getCachedApp();

  // it may return an error instead of a parse object, so we need to check if it has an id
  if (!project) return {};

  const translated = project?.get('translated');

  const title =
    getTranslatedField(translated, locale, 'metaTitle') ||
    getTranslatedField(translated, locale, 'title');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');
  const tags = getTranslatedField(translated, locale, 'tags') || '';
  const url = getTranslatedAbsoluteUrl(ROUTES.projects.preview().pathname, {
    locale,
    slug,
  });

  const ogImage = generateOGImageUrl({
    title,
    image: app?.get('image')?.url || '',
  });

  return {
    title: titleCase(title),
    description,
    keywords: tags.split(',').map((tag: string) => tag.trim()),
    // comment this part if using generated og image (see ./opengraph-image.tsx)
    openGraph: {
      title: titleCase(title),
      description,
      type: 'article',
      url,
      locale: locale || defaultLocale,
      images: [
        {
          url: ogImage, // Dynamic og route
          width: 800,
          height: 600,
        },
        {
          url: ogImage, // Dynamic og route
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const ProjectPage = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const t = await getTranslations('Project');

  const project = await getCachedProject(slug, locale);

  if (!project) {
    notFound();
  }

  const pathname = await getSSRCurrentPathname();
  const currentPathname = getAbsoluteUrl(pathname);

  const translated = project.get('translated');

  const translatedTags = getTranslatedField(translated, locale, 'tags');
  const title = getTranslatedField(translated, locale, 'title');
  const societyDescription = getTranslatedField(
    translated,
    locale,
    'societyDescription'
  );

  return (
    <>
      {/* -------------------------- */}
      {/* --------- header --------- */}
      {/* -------------------------- */}
      <PageHeader
        description={getTranslatedField(translated, locale, 'description')}
        image={project.get('image')?.url}
        title={getTranslatedField(translated, locale, 'title')}
      >
        <div className={`
          flex flex-col gap-8
          lg:flex-row lg:gap-5
        `}
        >
          {project.has('website') && (
            <TextLink
              buttonVariant="contained"
              href={project.get('website')!}
              variant="button"
            >
              {t('visitSite')}
            </TextLink>
          )}
          {project.has('repositories') &&
            (project.get('repositories') || []).length > 0 && (
            <TextLink
              href={project.get('repositories')?.[0]?.url || ''}
              variant="button"
              buttonVariant={
                project.get('website') && project.get('repositories')?.[0]
                  ? 'outlined'
                  : 'contained'
              }
            >
              {t('seeCodeSource')}
            </TextLink>
          )}
        </div>
      </PageHeader>
      {/* -------------------------- */}
      {/* ---------- body ---------- */}
      {/* -------------------------- */}
      <Section className={`
        mt-8 flex flex-col gap-8
        md:mb-12
        lg:mt-24 lg:mb-0 lg:gap-8
        xl:flex-row xl:gap-16
      `}
      >
        {/* ---------------------- */}
        {/* -------- left -------- */}
        {/* ---------------------- */}
        <div className="flex flex-2 flex-col gap-8">
          {/* ------ content ------ */}
          <ProjectSection title={t('projectDescription')}>
            <ReadOnlyTextCodeEditor
              content={getTranslatedField(translated, locale, 'content')}
            />
          </ProjectSection>
          {(project.has('links') ||
            project.has('repositories') ||
            project.has('npm') ||
            project.has('codesandbox')) && (
            <ProjectSection
              className="flex flex-col gap-1"
              title={t('links')}
            >
              {/* links */}
              {project.has('links') && (
                <ProjectLinks links={project.get('links') || []} />
              )}
              {/* repositories */}
              {project.has('repositories') && (
                <ProjectLinks
                  icon="/icons/github.svg"
                  iconSize={24}
                  links={project.get('repositories') || []}
                />
              )}
              {/* npm */}
              {project.has('npm') && (
                <ProjectLinks
                  icon="/icons/npm.svg"
                  iconSize={24}
                  links={project.get('npm')!}
                />
              )}
              {/* codesandbox */}
              {project.has('codesandbox') && (
                <ProjectLinks
                  icon="/icons/codesandbox.svg"
                  iconSize={22}
                  links={project.get('codesandbox')!}
                />
              )}
            </ProjectSection>
          )}
          {/* -------------------- */}
          {/* ------ images ------ */}
          {/* -------------------- */}
          {project.has('images') && (project.get('images') || []).length > 0 && (
            <ProjectSection
              title={t('screenShot')}
              className={`
                mt-4 flex flex-col items-center
                lg:mt-6
                xl:mt-12
              `}
            >
              <div className={`
                w-full space-y-12
                md:w-[700px]
              `}
              >
                {(project.get('images') || [])
                  .map((image: IUploadedFile, index: number) => (
                    <FadeInImage
                      alt={title}
                      height={0}
                      key={image.publicId + index}
                      sizes="100vw"
                      src={image.url}
                      style={{ width: '100%', height: '100%' }}
                      width={0}
                    />
                  ))}
              </div>
            </ProjectSection>
          )}
          {/* -------------------- */}
          {/* ------ youtube ----- */}
          {/* -------------------- */}
          {project.has('youtube') && (
            <ProjectSection
              title={t('video')}
              className={`
                flex flex-col items-center
                lg:mt-6
                xl:mt-12
              `}
            >
              <div className={`
                w-full
                md:w-[700px]
              `}
              >
                <YouTube src={project.get('youtube')!} />
              </div>
            </ProjectSection>
          )}
        </div>
        {/* ---------------------- */}
        {/* -------- right ------- */}
        {/* ---------------------- */}
        <div className={`
          flex-1
          max-md:mt-8
        `}
        >
          {(project.has('logo') ||
            project.has('society') ||
            !!translatedTags) && (
            <Card className={`
              pb-12!
              lg:pb-20!
            `}
            >
              {/* logo */}
              {project.has('logo') && (
                <CardHeader>
                  <CardImage
                    alt={title}
                    className="object-top-left"
                    containerClassName="h-[50px] md:h-[50px] max-md:mb-2"
                    objectSize="scale-down"
                    src={project.get('logo')!.url}
                  />
                </CardHeader>
              )}
              <CardContent className={`
                flex flex-col gap-4
                lg:gap-6
              `}
              >
                {societyDescription && (
                  <ProjectSection
                    title={t('societyDescription')}
                    titleLevel={5}
                  >
                    <ReadOnlyTextCodeEditor content={societyDescription} />
                  </ProjectSection>
                )}
                {project.has('society') && (
                  <ProjectSection title={t('society')} titleLevel={5}>
                    <Text size="lg">{project.get('society')}</Text>
                  </ProjectSection>
                )}
                {/* platforms */}
                {project.has('platforms') && (
                  <ProjectSection
                    className="flex flex-row flex-wrap gap-2"
                    title="Platforms"
                    titleLevel={5}
                  >
                    {(project.get('platforms') || [])
                      .map((platform: string, index: number) => (
                        <Text key={platform + index}>
                          {platform}
                          {index < (project.get('platforms') || []).length - 1 && ','}
                        </Text>
                      ))}
                  </ProjectSection>
                )}
                {/* technologies */}
                {project.has('technologies') && (
                  <ProjectSection
                    className="mt-4 flex flex-row flex-wrap gap-4"
                    title={t('technologies')}
                    titleLevel={5}
                  >
                    {(project.get('technologies') || [])
                      .map((technology: string, index: number) => (
                        <TextLink
                          buttonVariant="outlined"
                          className="px-3! py-2!"
                          href={`${ROUTES.projects.root}?technologies=${slugify(technology)}`}
                          key={technology + index}
                          variant="button"
                        >
                          {capitalize(technology)}
                        </TextLink>
                      ))}
                  </ProjectSection>
                )}
                {/* tags */}
                {!!translatedTags && (
                  <ProjectSection
                    className="flex flex-row flex-wrap gap-2"
                    rootClassName="max-md:mt-4"
                    title="Tags"
                    titleLevel={5}
                  >
                    {translatedTags
                      .split(',')
                      .map((tag: string, index: number) => (
                        <TextLink
                          href={`${ROUTES.projects.root}?tags=${slugify(tag)}`}
                          key={tag + index}
                        >
                          {capitalize(tag)}
                          {index < translatedTags.split(',').length - 1 && ','}
                        </TextLink>
                      ))}
                  </ProjectSection>
                )}

                {/* share on social media */}
                <Share currentPathname={currentPathname} parseObj={project} />
              </CardContent>
            </Card>
          )}
        </div>
      </Section>

      {/* other projects from the same society */}
      {project.has('society') && (
        <Suspense
          fallback={(
            <Section rootClassName="mb-20 mt-16">
              <ProjectsSkeleton />
            </Section>
          )}
        >
          <NonPaginatedProjects
            limit={18}
            locale={locale}
            otherThanProjectId={project.id}
            society={project.get('society')}
            title={t('otherProjectsFrom', { society: project.get('society')! })}
            className={`
              mt-6 mb-0!
              md:mt-16
              xl:mt-6
            `}
          />
        </Suspense>
      )}
      <Newsletter locale={locale} />
    </>
  );
};

export default ProjectPage;
