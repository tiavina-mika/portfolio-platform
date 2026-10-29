'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { useSiteSearch } from '@/hooks/useSiteSearch';
import { Locale } from '@/i18n/config';
import { cn } from '@/utils/app.utils';

import Loading from '../Loading';
import NextIcon from '../NextIcon';
import Text from '../typography/Text';
import TextLink from '../typography/TextLink';
import { Input } from '../ui/Input';

type Props = {
  locale: Locale;
  /**
   * Called when a result is followed
   */
  onNavigate?: () => void;
  className?: string;
  inputClassName?: string;
  searchIconClassName?: string;
};

const MESSAGE_CLASS_NAME = 'px-2 py-2 text-sm text-muted-foreground';

/**
 * The site search: a field and, under it, a floating list of results (or the loading, empty and error
 * states, each one told with a text and never by color alone)
 */
const NavBarSearch = ({
  locale, onNavigate, className, inputClassName, searchIconClassName,
}: Props) => {
  const t = useTranslations('NavBar');
  const tCommon = useTranslations('Common');
  const {
    query, setQuery, results, isLoading, hasError, isEmpty, clear, retry,
  } = useSiteSearch({ locale, tNoResults: tCommon('noResults') });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  const handleNavigate = () => {
    clear();
    onNavigate?.();
  };

  return (
    <div
      role="search"
      className={cn(
        'relative flex w-full max-w-[484px] flex-1 flex-row items-center justify-end',
        className
      )}
    >
      <div className="relative w-full">
        <NextIcon
          alt=""
          aria-hidden="true"
          src="/icons/search.svg"
          className={cn(
            `
              absolute top-1/2 left-5 size-5 -translate-y-1/2 transform text-gray-500
              peer-focus:text-gray-900
            `,
            searchIconClassName
          )}
        />
        <Input
          aria-label={t('search')}
          autoComplete="off"
          enterKeyHint="search"
          onChange={handleChange}
          placeholder={t('search')}
          type="search"
          value={query}
          className={cn(
            `
              flex h-[50px] w-full rounded-3xl border-0 px-12 text-sm
              placeholder:text-muted-foreground
              focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0
              disabled:opacity-50
              dark:border-input
              [&::-webkit-search-cancel-button]:hidden
            `,
            inputClassName
          )}
        />
        {isLoading && (
          <Loading
            className="size-4"
            rootClassName="absolute right-5 top-1/2 transform -translate-y-1/2"
          />
        )}
      </div>
      {/* always mounted: a live region announces what is added to it, not itself */}
      <div
        aria-live="polite"
        className={`
          absolute inset-x-0 top-full z-10 flex flex-col rounded-md border border-neutral-200 bg-white px-2
          pt-2 pb-3 shadow-md
          empty:hidden
          dark:border-neutral-700 dark:bg-neutral-900
        `}
      >
        {results.map(result => (
          <div className="p-2" key={result.id}>
            <TextLink className="font-medium" href={result.url} onClick={handleNavigate}>
              {result.title}
            </TextLink>
          </div>
        ))}
        {isLoading && <Text className={MESSAGE_CLASS_NAME} role="status">{t('searching')}</Text>}
        {isEmpty && !isLoading && (
          <Text className={MESSAGE_CLASS_NAME} role="status">
            {t('noResults', { query: query.trim() })}
          </Text>
        )}
        {hasError && !isLoading && (
          <div className="flex flex-wrap items-center gap-3 p-2" role="status">
            <Text className="text-sm text-error">{t('searchUnavailable')}</Text>
            <button
              className="text-sm font-medium underline"
              onClick={retry}
              type="button"
            >
              {tCommon('tryAgain')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBarSearch;
