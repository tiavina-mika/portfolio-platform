'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import PaginationButtons from '@/components/PaginationButtons';
import {
  Tabs, TabsContent, TabsCount, TabsList, TabsTrigger,
} from '@/components/ui/Tabs';
import Price from '@/containers/currency/Price';
import { IProject, ProjectSupportType } from '@/types/project.type';
import { PROJECT_SUPPORTS, PROJECTS_PER_PAGE } from '@/utils/project.constants';

import ProjectCard from './ProjectCard';

type Props = {
  projects: IProject[];
};

type Filter = 'all' | ProjectSupportType;

/**
 * The delivered projects: a filter by support (with the number of projects of each), the cards of the
 * current page, and the pagination. Changing the filter goes back to the first page.
 */
const ProjectsGallery = ({ projects }: Props) => {
  const t = useTranslations('ProjectsPage');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

  const filtered = filter === 'all'
    ? projects
    : projects.filter(project => project.supports.includes(filter));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE));
  // the filter can leave fewer pages than the one the visitor was on
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PROJECTS_PER_PAGE;
  const visible = filtered.slice(start, start + PROJECTS_PER_PAGE);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: t('filterAll'), count: projects.length },
    ...PROJECT_SUPPORTS.map(support => ({
      value: support,
      label: t(`supports.${support}`),
      count: projects.filter(project => project.supports.includes(support)).length,
    })),
  ];

  const handleFilterChange = (value: string) => {
    setFilter(value as Filter);
    setPage(1);
  };

  return (
    <Tabs className="grid gap-10" onValueChange={handleFilterChange} value={filter}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <TabsList variant="pill">
          {filters.map(item => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
              <TabsCount>{item.count}</TabsCount>
            </TabsTrigger>
          ))}
        </TabsList>
        <span
          aria-live="polite"
          className={'font-mono text-[13px] leading-none font-medium text-muted-foreground'}
        >
          {filtered.length > 0 && t('range', {
            start: start + 1,
            end: start + visible.length,
            total: filtered.length,
          })}
        </span>
      </div>
      <TabsContent className="grid gap-10 pt-0" value={filter}>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4 p-0">
          {visible.map(project => (
            <li className="flex min-w-0" key={project.id}>
              <ProjectCard
                eyebrow={t(`items.${project.id}.eyebrow`)}
                name={project.name}
                screenshotLabel={t('screenshot')}
                summary={t(`items.${project.id}.summary`)}
                facts={[
                  {
                    label: t('facts.supports'),
                    value: project.supports.map(support => t(`supports.${support}`)).join(' · '),
                  },
                  {
                    label: t('facts.screens'),
                    value: PROJECT_SUPPORTS
                      .filter(support => project.screens[support])
                      .map(support => `${project.screens[support]} ${t(`supports.${support}`).toLowerCase()}`)
                      .join(' · '),
                  },
                  { label: t('facts.leadTime'), value: `${project.weeks} ${t('weeks')}` },
                  { label: t('facts.price'), value: <Price text={t(`items.${project.id}.price`)} /> },
                ]}
              />
            </li>
          ))}
        </ul>
        {pageCount > 1 && (
          <PaginationButtons
            onChange={setPage}
            page={currentPage}
            pageCount={pageCount}
            labels={{
              nav: t('pagination.nav'),
              previous: t('pagination.previous'),
              next: t('pagination.next'),
              page: t('pagination.page'),
            }}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProjectsGallery;
