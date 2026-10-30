import { useTranslations } from 'next-intl';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import Title from '@/components/typography/Title';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { Link } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';
import { createQueryString } from '@/utils/next.utils';

export type ArticlesSort = 'newest' | 'oldest';

export type ArticlesHeaderCategory = {
  slug: string;
  name: string;
};

type Props = {
  locale: Locale;
  /**
   * The categories offered as filters, next to the "all" chip
   */
  categories: ArticlesHeaderCategory[];
  /**
   * Slug of the category the list is filtered on, none shows every article
   */
  category?: string;
  /**
   * Name of that category: it becomes the title of the page, under the "Category" eyebrow
   */
  categoryName?: string;
  sort: ArticlesSort;
  /**
   * Keyword the list is filtered on, kept by the links of the header
   */
  tag?: string;
};

const FOCUS_CLASSES = `
  focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring
`;

const SORTS: ArticlesSort[] = ['newest', 'oldest'];

/**
 * The address of the list for a combination of filters: the default sort and the "all" chip add
 * nothing to the query, so they keep the plain address of the blog
 */
const getArticlesUrl = ({ category, sort, tag }: Pick<Props, 'category' | 'sort' | 'tag'>): string => {
  const query = createQueryString({
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
    ...(sort === 'oldest' ? { order: 'asc' } : {}),
  });

  return query ? `?${query}` : ROUTES.articles.root;
};

/**
 * The top of the blog page: breadcrumbs and "Articles" title (or the chosen category as title),
 * the category chips and the sort links. Every filter is a link that changes the address, so a
 * filtered list can be shared; the chosen chip and the chosen sort carry `aria-current`.
 */
const ArticlesHeader = ({
  locale, categories, category, categoryName, sort, tag,
}: Props) => {
  const t = useTranslations('Article');
  const tNavBar = useTranslations('NavBar');

  const chips = [{ slug: undefined, name: t('allCategories') }, ...categories];

  return (
    <Section
      as="header"
      className="flex-col gap-5"
      rootClassName="mt-4 mb-4 md:mt-8 xl:mt-12"
    >
      {categoryName ? (
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium">{t('category')}</span>
          <Title level={1}>{categoryName}</Title>
        </div>
      ) : (
        <>
          <Breadcrumbs
            locale={locale}
            segments={[{ name: tNavBar('blog'), link: ROUTES.articles.root }]}
          />
          <Title level={1}>{t('articles')}</Title>
        </>
      )}

      <nav aria-label={t('categories')} className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isCurrent = chip.slug === category;

          return (
            <Link
              aria-current={isCurrent ? 'true' : undefined}
              href={getArticlesUrl({ category: chip.slug, sort, tag })}
              key={chip.slug ?? 'all'}
              prefetch={false}
              className={cn(
                `
                  box-border inline-flex min-h-11 items-center rounded-full border-[1.5px] border-solid px-4.5
                  text-[15px] font-semibold no-underline
                `,
                FOCUS_CLASSES,
                isCurrent
                  ? 'border-primary bg-primary text-primary-foreground'
                  : `
                    border-input text-foreground
                    hover:border-primary
                  `
              )}
            >
              {chip.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2.5 text-sm font-medium">
        <span className="text-muted-foreground">{t('sortBy')}</span>
        {SORTS.map((option) => {
          const isCurrent = option === sort;

          return (
            <Link
              aria-current={isCurrent ? 'true' : undefined}
              href={getArticlesUrl({ category, sort: option, tag })}
              key={option}
              prefetch={false}
              className={cn(
                'inline-flex min-h-11 items-center rounded-md text-foreground underline-offset-4',
                FOCUS_CLASSES,
                isCurrent ? 'font-bold underline' : `
                  no-underline
                  hover:underline
                `
              )}
            >
              {t(option)}
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

export default ArticlesHeader;
