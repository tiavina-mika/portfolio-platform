import { useTranslations } from 'next-intl';
import { capitalize } from 'string-ts';

import FadeInImage from '@/components/FadeImage';
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import {
  Card, CardContent, CardHeader, CardImage,
} from '@/components/ui/Card';
import YouTube from '@/components/YouTube';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import Share from '@/containers/common/Share';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IProject } from '@/types/project.type';
import { collections } from '@/utils/constants';
import { createQueryString } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { slugify } from '@/utils/utils';

import ProjectLinks from './ProjectLinks';
import ProjectSection from './ProjectSection';

const getProjectsUrl = (filter: Record<string, string>): string =>
  `${ROUTES.projects.root}?${createQueryString(filter)}`;

type Props = {
  project: IProject;
  locale: Locale;
  /**
   * Absolute address of the project page, put in the sharing links
   * @example 'https://example.com/en/projects/slug'
   */
  currentPathname: string;
};

/**
 * The body of a project page: the description, the links, the screenshots and the video on the left,
 * the logo, the society, the technologies and the share block on the right
 */
const Project = ({ project, locale, currentPathname }: Props) => {
  const t = useTranslations('Project');

  const { translated } = project;
  const title = getTranslatedField(translated, locale, 'title');
  const tags = getTranslatedField(translated, locale, 'tags') || '';
  const societyDescription = getTranslatedField(translated, locale, 'societyDescription');

  const translatedTags = tags
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean);
  const hasLinks = !!(
    project.links?.length ||
    project.repositories?.length ||
    project.npm?.length ||
    project.codesandbox?.length
  );

  return (
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
          <ReadOnlyTextCodeEditor content={getTranslatedField(translated, locale, 'content')} />
        </ProjectSection>
        {hasLinks && (
          <ProjectSection className="flex flex-col gap-1" title={t('links')}>
            {!!project.links?.length && <ProjectLinks links={project.links} />}
            {!!project.repositories?.length && (
              <ProjectLinks icon="/icons/github.svg" iconSize={24} links={project.repositories} />
            )}
            {!!project.npm?.length && (
              <ProjectLinks icon="/icons/npm.svg" iconSize={24} links={project.npm} />
            )}
            {!!project.codesandbox?.length && (
              <ProjectLinks icon="/icons/codesandbox.svg" iconSize={22} links={project.codesandbox} />
            )}
          </ProjectSection>
        )}
        {/* ------ images ------ */}
        {!!project.images?.length && (
          <ProjectSection
            title={t('screenShot')}
            className={`
              flex flex-col items-center pt-4
              lg:pt-6
              xl:pt-12
            `}
          >
            <div className={`
              flex w-full flex-col gap-12
              md:w-[700px]
            `}
            >
              {project.images.map((image, index) => (
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
        {/* ------ youtube ----- */}
        {project.youtube && (
          <ProjectSection
            title={t('video')}
            className={`
              flex flex-col items-center
              lg:pt-6
              xl:pt-12
            `}
          >
            <div className={`
              w-full
              md:w-[700px]
            `}
            >
              <YouTube src={project.youtube} />
            </div>
          </ProjectSection>
        )}
      </div>
      {/* ---------------------- */}
      {/* -------- right ------- */}
      {/* ---------------------- */}
      <div className={`
        flex-1
        max-md:pt-8
      `}
      >
        <Card className={`
          pb-12!
          lg:pb-20!
        `}
        >
          {/* logo */}
          {project.logo && (
            <CardHeader>
              <CardImage
                alt={title}
                className="object-top-left"
                containerClassName="h-[50px] md:h-[50px] max-md:mb-2"
                objectSize="scale-down"
                src={project.logo.url}
              />
            </CardHeader>
          )}
          <CardContent className={`
            flex flex-col gap-4
            lg:gap-6
          `}
          >
            {societyDescription && (
              <ProjectSection title={t('societyDescription')} titleLevel={5}>
                <ReadOnlyTextCodeEditor content={societyDescription} />
              </ProjectSection>
            )}
            {project.society && (
              <ProjectSection title={t('society')} titleLevel={5}>
                <Text size="lg">{project.society}</Text>
              </ProjectSection>
            )}
            {/* platforms */}
            {!!project.platforms?.length && (
              <ProjectSection
                className="flex flex-row flex-wrap gap-2"
                title={t('platforms')}
                titleLevel={5}
              >
                {project.platforms.map((platform, index) => (
                  <Text key={platform + index}>
                    {platform}
                    {index < project.platforms!.length - 1 && ','}
                  </Text>
                ))}
              </ProjectSection>
            )}
            {/* technologies */}
            {!!project.technologies?.length && (
              <ProjectSection
                className="flex flex-row flex-wrap gap-4 pt-4"
                title={t('technologies')}
                titleLevel={5}
              >
                {project.technologies.map((technology, index) => (
                  <TextLink
                    buttonVariant="outlined"
                    className="px-3! py-2!"
                    href={getProjectsUrl({ technologies: slugify(technology) })}
                    key={technology + index}
                    variant="button"
                  >
                    {capitalize(technology)}
                  </TextLink>
                ))}
              </ProjectSection>
            )}
            {/* tags */}
            {translatedTags.length > 0 && (
              <ProjectSection
                className="flex flex-row flex-wrap gap-2"
                rootClassName="max-md:pt-4"
                title={t('tags')}
                titleLevel={5}
              >
                {translatedTags.map((tag, index) => (
                  <TextLink
                    href={getProjectsUrl({ tag: slugify(tag) })}
                    key={tag + index}
                  >
                    {capitalize(tag)}
                    {index < translatedTags.length - 1 && ','}
                  </TextLink>
                ))}
              </ProjectSection>
            )}

            {/* share on social media */}
            <Share
              collection={collections.Project}
              currentPathname={currentPathname}
              id={project.id}
              totalMediaShare={project.totalMediaShare}
            />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
};

export default Project;
