import { useTranslations } from 'next-intl';
import { useId } from 'react';

import EmptyNotice from '@/components/EmptyNotice';
import Section from '@/components/layouts/Section';
import { Locale } from '@/i18n/config';
import { IPage } from '@/types/cms.type';

import PageCard from './PageCard';
import PageCardSkeleton from './PageCardSkeleton';

export type PagesStatus = 'ready' | 'loading';

type Props = {
  pages: IPage[];
  locale: Locale;
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards
   * @default ready
   */
  status?: PagesStatus;
  /**
   * `false` leaves out the hidden h2 and the band around the list, for a list nested in a block
   * of the page that already has its own heading
   * @default true
   */
  isStandalone?: boolean;
};

const SKELETON_COUNT = 3;

const GRID_CLASSES = `
  grid list-none grid-cols-1 gap-x-6 gap-y-12
  md:grid-cols-2 md:gap-x-8
  lg:grid-cols-3 lg:gap-x-12
  xl:gap-y-16
`;

/**
 * The CMS pages of a category, as a grid of cards (one column on a phone, two from md, three from
 * lg), or the state that takes its place: skeleton cards while they load, a notice without any
 */
const Pages = ({
  pages, locale, status = 'ready', isStandalone = true,
}: Props) => {
  const t = useTranslations('Page');
  const titleId = useId();

  const list = (
    <>
      {status === 'loading' && (
        <div aria-label={t('loadingPages')} role="status">
          <ul aria-hidden className={GRID_CLASSES}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li className="flex min-w-0" key={index}>
                <PageCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      )}
      {status === 'ready' && pages.length === 0 && <EmptyNotice>{t('noPagesYet')}</EmptyNotice>}
      {status === 'ready' && pages.length > 0 && (
        <ul className={GRID_CLASSES}>
          {pages.map((page) => (
            <li className="flex min-w-0" key={page.id}>
              <PageCard locale={locale} page={page} titleLevel={isStandalone ? 3 : 4} />
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!isStandalone) return list;

  return (
    <Section
      aria-labelledby={titleId}
      as="section"
      className="flex-col"
      rootClassName="py-6"
    >
      {/* the cards carry h3 names: this one keeps the outline without a skipped level */}
      <h2 className="sr-only" id={titleId}>{t('pages')}</h2>
      {list}
    </Section>
  );
};

export default Pages;
