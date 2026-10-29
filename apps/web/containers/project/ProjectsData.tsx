import { notFound } from 'next/navigation';


import Pagination from '@/components/Pagination';
import Projects from '@/containers/projects/Projects';
import { Locale } from '@/i18n/config';
import { getProjects } from '@/server/queries/project.queries';
import { IError, ISearchParams } from '@/types/app.type';
import { IProject } from '@/types/project.type';
import { getPaginatedQuery } from '@/utils/app.utils';
import { PAGINATION } from '@/utils/constants';
import { projectSearchParamsSchema } from '@/validations/app.validations';

type Props = {
  locale: Locale;
  searchParams: ISearchParams;
};

const PaginatedProjects = async ({ locale, searchParams }: Props) => {
  const { perPage } = PAGINATION;

  const parsedSearchParams = projectSearchParamsSchema.parse(searchParams);
  const page = parseInt(parsedSearchParams.page, 10) || 1;
  const { orderedBy } = parsedSearchParams;
  const { order } = parsedSearchParams;
  const { tag } = parsedSearchParams;
  const { technologies } = parsedSearchParams;

  // preload the data from server
  const data = await getProjects({
    orderedBy,
    order,
    locale,
    tag,
    technologies,
    ...getPaginatedQuery(perPage, page),
  });

  if ((data as IError).error) {
    notFound();
  }

  const { projects, count } = data as {
    projects: IProject[];
    count: number;
  };

  return (
    <>
      <Projects
        locale={locale}
        projects={projects}
        className={`
          mt-10
          lg:mt-20
        `}
      />
      <Pagination
        className="mt-4"
        page={page}
        perPage={perPage}
        searchParams={parsedSearchParams}
        total={count}
      />
    </>
  );
};

export default PaginatedProjects;
