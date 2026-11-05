import { useTranslations } from 'next-intl';

import EmptyNotice from '@/components/EmptyNotice';
import Section from '@/components/layouts/Section';
import Pagination, { PaginationProps } from '@/components/Pagination';
import StatusBanner from '@/components/StatusBanner';
import SectionDescription from '@/components/typography/SectionDescription';
import SectionTitle from '@/components/typography/SectionTitle';
import TextLink from '@/components/typography/TextLink';

import { type ProjectCardData } from './ProjectCard';
import ProjectCards from './ProjectCards';
import ProjectsSkeleton from './ProjectsSkeleton';

export type ProjectsStatus = 'ready' | 'loading' | 'error' | 'offline';

type Props = {
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards, `error` a
   * banner with a retry button, `offline` a notice (the projects come back on reconnection)
   */
  status: ProjectsStatus;
  projects?: ProjectCardData[];
  /**
   * Title (with the optional description under it) of a list that sits among other sections of a
   * page: the home page and the projects of the same society
   */
  title?: string;
  description?: string;
  /**
   * Link to the whole list, under the cards
   */
  moreLink?: { href: string; label: string };
  /**
   * Page, size of a page and total of the list: the pagination shows under the cards only, and only
   * when there is more than one page
   */
  pagination?: Pick<PaginationProps, 'page' | 'perPage' | 'total'>;
  /**
   * Search params kept in the links of the pagination (the filters and the sort)
   */
  searchParams?: Record<string, string>;
  /**
   * Nothing is rendered, instead of the empty notice, when there is no project to show
   * @default false
   */
  hideWhenEmpty?: boolean;
  /**
   * Retry of the `error` banner
   */
  onRetry?: () => void;
  className?: string;
  listClassName?: string;
};

/**
 * A list of project cards in its own band, or the state that takes the place of the cards: skeleton
 * cards while they load, a banner with a retry (or an offline notice) if they fail, a notice when
 * no project is published yet
 */
const ProjectsSection = ({
  status,
  projects = [],
  title,
  description,
  moreLink,
  pagination,
  searchParams,
  hideWhenEmpty = false,
  onRetry,
  className,
  listClassName,
}: Props) => {
  const t = useTranslations('Project');
  const tCommon = useTranslations('Common');

  if (status === 'ready' && !projects.length && hideWhenEmpty) return null;

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div aria-label={t('loading')} role="status">
            <ProjectsSkeleton />
          </div>
        );
      case 'error':
        return (
          <StatusBanner onRetry={onRetry} retryLabel={tCommon('tryAgain')} variant="error">
            {t('loadError')}
          </StatusBanner>
        );
      case 'offline':
        return <StatusBanner variant="offline">{t('offline')}</StatusBanner>;
      default:
        break;
    }

    if (!projects.length) {
      return <EmptyNotice>{t('noProjectsYet')}</EmptyNotice>;
    }

    return <ProjectCards className={listClassName} projects={projects} />;
  };

  return (
    <Section className="flex flex-col" rootClassName={className}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {description && <SectionDescription>{description}</SectionDescription>}
      {renderContent()}
      {status === 'ready' && pagination && (
        <Pagination
          className="pt-8"
          page={pagination.page}
          perPage={pagination.perPage}
          searchParams={searchParams}
          total={pagination.total}
        />
      )}
      {status === 'ready' && moreLink && (
        <div className="pt-16">
          <TextLink href={moreLink.href} variant="button">
            {moreLink.label}
          </TextLink>
        </div>
      )}
    </Section>
  );
};

export default ProjectsSection;
