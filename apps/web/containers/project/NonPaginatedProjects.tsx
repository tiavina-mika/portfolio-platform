import { getTranslations } from 'next-intl/server';

import Section from '@/components/layouts/Section';
import SectionDescription from '@/components/typography/SectionDescription';
import SectionTitle from '@/components/typography/SectionTitle';
import TextLink from '@/components/typography/TextLink';
import Projects from '@/containers/projects/Projects';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getProjects } from '@/server/queries/project.queries';
import { IError } from '@/types/app.type';
import { IProject } from '@/types/project.type';
import { cn } from '@/utils/app.utils';

type Props = {
  locale: Locale;
  title?: string;
  description?: string;
  society?: string;
  otherThanProjectId?: string;
  limit?: number;
  className?: string;
  listContainerClassName?: string;
};

const NonPaginatedProjects = async ({
  locale,
  title,
  description,
  society,
  otherThanProjectId,
  className,
  listContainerClassName,
  limit = 16,
}: Props) => {
  const t = await getTranslations('App');
  const tProject = await getTranslations('Project');
  const data = await getProjects({
    locale,
    limit,
    skip: 0,
    society,
    otherThanProjectId,
  });

  if ((data as IError).error) {
    return null;
  }

  const { projects, count } = data as {
    projects: IProject[];
    count: number;
  };
  const remainingCount = count - projects.length;

  const seeMoreProjects =
    remainingCount > 0 ? t('seeOtherProjects', { count: remainingCount }) : '';

  if (!projects.length) {
    return null;
  }

  return (
    <Section
      className="flex flex-col"
      rootClassName={cn(`
        mt-2 mb-20
        lg:mb-24
      `, className)}
    >
      <SectionTitle>
        {title || tProject('projectDevelopedRecently', { count })}
      </SectionTitle>
      {description && (
        <SectionDescription className="mt-0">{description}</SectionDescription>
      )}

      <Projects
        className={listContainerClassName}
        locale={locale}
        projects={projects}
      />
      {seeMoreProjects && (
        <div className="mt-16">
          <TextLink href={ROUTES.projects.root} variant="button">
            {seeMoreProjects}
          </TextLink>
        </div>
      )}
    </Section>
  );
};

export default NonPaginatedProjects;
