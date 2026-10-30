import { useTranslations } from 'next-intl';
import { useId } from 'react';

import EmptyNotice from '@/components/EmptyNotice';
import Section from '@/components/layouts/Section';
import { Locale } from '@/i18n/config';
import { ICategory } from '@/types/cms.type';

import PageCardSkeleton from './PageCardSkeleton';
import PageSubcategoryCard from './PageSubcategoryCard';

export type PageSubcategoriesStatus = 'ready' | 'loading';

type Props = {
  parentCategory: ICategory;
  subcategories: ICategory[];
  locale: Locale;
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards
   * @default ready
   */
  status?: PageSubcategoriesStatus;
};

const SKELETON_COUNT = 3;

const GRID_CLASSES = `
  grid list-none grid-cols-1 gap-x-6 gap-y-12
  md:grid-cols-2 md:gap-x-8
  lg:grid-cols-3 lg:gap-x-12
  xl:gap-y-16
`;

/**
 * The subcategories of a category, as a grid of cards (one column on a phone, two from md, three
 * from lg), or the state that takes its place: skeleton cards while they load, a notice without any
 */
const PageSubcategories = ({
  parentCategory, subcategories, locale, status = 'ready',
}: Props) => {
  const t = useTranslations('Page');
  const titleId = useId();

  return (
    <Section
      aria-labelledby={titleId}
      as="section"
      className="flex-col"
      rootClassName="py-6"
    >
      {/* the cards are links, not headings: this one keeps the outline without a skipped level */}
      <h2 className="sr-only" id={titleId}>{t('subcategories')}</h2>
      {status === 'loading' && (
        <div aria-label={t('loadingSubcategories')} role="status">
          <ul aria-hidden className={GRID_CLASSES}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li className="flex min-w-0" key={index}>
                <PageCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      )}
      {status === 'ready' && subcategories.length === 0 && (
        <EmptyNotice>{t('noSubcategories')}</EmptyNotice>
      )}
      {status === 'ready' && subcategories.length > 0 && (
        <ul className={GRID_CLASSES}>
          {subcategories.map((subcategory) => (
            <li className="flex min-w-0" key={subcategory.id}>
              <PageSubcategoryCard
                locale={locale}
                parentCategory={parentCategory}
                subcategory={subcategory}
              />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

export default PageSubcategories;
