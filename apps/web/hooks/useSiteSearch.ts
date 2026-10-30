'use client';

import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { Locale } from '@/i18n/config';
import { searchData } from '@/server/mutations/search.mutation';
import { ISearchResult } from '@/types/app.type';
import { SEARCH_EMPTY_RESULT_ID } from '@/utils/constants';

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

type Input = {
  locale: Locale;
  tNoResults: string;
};

type Output = {
  query: string;
  setQuery: (query: string) => void;
  results: ISearchResult[];
  isLoading: boolean;
  hasError: boolean;
  /** the search ran and nothing matched (the placeholder row is not part of `results`) */
  isEmpty: boolean;
  clear: () => void;
  retry: () => void;
};

/**
 * Debounced site search shared by the desktop and the mobile navigation bars
 */
export const useSiteSearch = ({ locale, tNoResults }: Input): Output => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setHasError(false);
      return;
    }

    let isCancelled = false;

    const runSearch = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const found = await searchData({ search: debouncedQuery, locale, tNoResults });

        if (!isCancelled) setResults(found);
      }
      catch {
        if (!isCancelled) {
          setResults([]);
          setHasError(true);
        }
      }
      finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    runSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, locale, tNoResults, attempt]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasError(false);
  }, []);

  const retry = useCallback(() => setAttempt(prev => prev + 1), []);

  const isEmpty = results.length === 1 && results[0].id === SEARCH_EMPTY_RESULT_ID;

  return {
    query,
    setQuery,
    results: isEmpty ? [] : results,
    isLoading,
    hasError,
    isEmpty,
    clear,
    retry,
  };
};
