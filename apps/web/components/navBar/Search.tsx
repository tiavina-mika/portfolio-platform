'use client';

import { debounce } from 'lodash';
import { ChangeEvent, useState } from 'react';

import { Locale } from '@/i18n/config';
import { searchData } from '@/server/mutations/search.mutation';
import { ISearchResult } from '@/types/app.type';
import { cn } from '@/utils/app.utils';


import Loading from '../Loading';
import NextIcon from '../NextIcon';
import Text from '../typography/Text';
import TextLink from '../typography/TextLink';
import { Input } from '../ui/Input';

type Props = {
  locale: Locale;
  tSearch: string;
  tNoResults: string;
  className?: string;
  inputClassName?: string;
  searchIconClassName?: string;
};
const Search = ({
  locale,
  tSearch,
  tNoResults,
  className,
  inputClassName,
  searchIconClassName,
}: Props) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearch(value);

    const run = debounce(async (debouncedValue: string) => {
      if (debouncedValue.length > 3) {
        setLoading(true);
        try {
          const result = await searchData({
            search: debouncedValue,
            locale,
            tNoResults,
          });

          setSearchResults(result);
          setLoading(false);
        }
        catch (error) {
          console.log('error: ', error);
          setLoading(false);
        }
      }
      else {
        setSearchResults([]);
      }
    }, 1000);

    run(value);
  };

  const handleClick = () => {
    if (searchResults.length > 0) {
      setSearchResults([]);
      setSearch('');
    }
  };

  return (
    <div
      className={cn(
        'relative flex w-full max-w-[484px] flex-1 flex-row items-center justify-end',
        className
      )}
    >
      <div className="relative w-full">
        <NextIcon
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
          onChange={searchHandler}
          placeholder={tSearch}
          type="text"
          value={search}
          className={cn(
            `
              flex h-[50px] w-full rounded-3xl border-0 px-12 text-sm
              placeholder:text-muted-foreground
              focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0
              disabled:opacity-50
              dark:border-input
            `,
            inputClassName
          )}
        />
        {loading && (
          <Loading
            className="size-4"
            rootClassName="absolute right-5 top-1/2 transform -translate-y-1/2"
          />
        )}
      </div>
      {searchResults && searchResults.length > 0 && (
        <div className={`
          absolute inset-x-0 top-full z-10 rounded-md border border-neutral-200 bg-white px-2 pt-2 pb-3
          shadow-md
          dark:border-neutral-700 dark:bg-neutral-900
        `}
        >
          {searchResults.map((result, index) => (
            <div
              className="p-2"
              key={result.id + index}
              onClick={handleClick}
              role="button" // div is not interactive, so we need to add role="button" to make it accessible
              tabIndex={0} // add tabIndex to make it focusable
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClick();
                }
              }}
            >
              {result.url ? (
                <TextLink className="font-medium" href={result.url}>
                  {result.title}
                </TextLink>
              ) : (
                <Text>{result.title}</Text>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
