import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import Pagination, { PaginationProps } from '@/components/Pagination';
import { Locale } from '@/i18n/config';
import {
  ICategory, ICategoryWithPagesPreview, IPage,
} from '@/types/cms.type';

import PageHeader from './PageHeader';
import Pages from './Pages';
import PageSubcategories from './PageSubcategories';
import PageSubcategoryPreview from './PageSubcategoryPreview';

type Props = {
  category: ICategory;
  categoryName: string;
  breadcrumbs: BreadcrumbsSegment[];
  locale: Locale;
  subcategories?: ICategory[];
  subcategoriesWithPages?: ICategoryWithPagesPreview[];
  pages?: IPage[];
  pagination?: PaginationProps;
  /**
   * `loading` shows the header and skeleton cards where the subcategories (or, without any, the
   * pages) will come
   * @default ready
   */
  status?: 'ready' | 'loading';
};

/**
 * A category opened by its address: the header (its picture as banner, its name as title), then its
 * subcategories, the previews of the pages of its own subcategories and the pages attached to it
 */
const CategoryPagesView = ({
  category, categoryName, breadcrumbs, locale, subcategories, subcategoriesWithPages, pages, pagination,
  status = 'ready',
}: Props) => {
  const t = useTranslations('Page');
  const previewsTitleId = useId();
  const hasSubcategories = !!subcategories && subcategories.length > 0;
  const hasSubcategoriesWithPages = !!subcategoriesWithPages && subcategoriesWithPages.length > 0;
  const hasPages = !!pages && pages.length > 0;

  const header = (
    <PageHeader
      bannerUrl={category.image?.url}
      breadcrumbs={breadcrumbs}
      locale={locale}
      title={categoryName}
    />
  );

  if (status === 'loading') {
    return (
      <div className={`
        flex flex-col gap-4 self-stretch pb-10
        md:pb-16
      `}
      >
        {header}
        {category.hasSubcategories ? (
          <PageSubcategories
            locale={locale}
            parentCategory={category}
            status="loading"
            subcategories={[]}
          />
        ) : (
          <Pages locale={locale} pages={[]} status="loading" />
        )}
      </div>
    );
  }

  return (
    <div className={`
      flex flex-col gap-4 self-stretch pb-10
      md:pb-16
    `}
    >
      {header}
      {hasSubcategories && (
        <PageSubcategories
          locale={locale}
          parentCategory={category}
          subcategories={subcategories}
        />
      )}
      {hasSubcategoriesWithPages && (
        <Section
          aria-labelledby={previewsTitleId}
          as="section"
          className="flex-col gap-10"
          rootClassName="py-6"
        >
          <h2 className="sr-only" id={previewsTitleId}>{t('subcategories')}</h2>
          {subcategoriesWithPages.map(({ category: subcategory, pages: subcategoryPages, total }) => (
            <PageSubcategoryPreview
              key={subcategory.id}
              locale={locale}
              pages={subcategoryPages}
              parentCategory={category}
              subcategory={subcategory}
              total={total}
            />
          ))}
        </Section>
      )}
      {hasPages ? (
        <>
          <Pages locale={locale} pages={pages} />
          {pagination && (
            <Section className="flex-col">
              <Pagination {...pagination} />
            </Section>
          )}
        </>
      ) : !hasSubcategories && !hasSubcategoriesWithPages && (
        <Pages locale={locale} pages={[]} />
      )}
    </div>
  );
};

export default CategoryPagesView;
