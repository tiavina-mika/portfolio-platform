'use client';

import { useLocale } from 'next-intl';
import {
  createContext, ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';

import { Currency, Rates } from '@/types/app.type';
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  RATES_MAX_AGE_MS,
  RATES_STORAGE_KEY,
} from '@/utils/constants';
import {
  convertPrices,
  fetchRates,
  formatPrice,
  getFallbackRates,
  parseCurrency,
  readStorage,
  readStoredRates,
  writeStorage,
} from '@/utils/currency.utils';

export type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /**
   * True while the converted prices use the fixed fallback rates: no live rate could be fetched
   */
  isRateIndicative: boolean;
  /**
   * An amount in euros, written in the chosen currency
   */
  formatPrice: (euros: number, withSymbol?: boolean) => string;
  /**
   * A text whose prices are written in euros, with its prices written in the chosen currency
   */
  convertPrices: (text: string) => string;
};

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * The currency the prices are shown in (the euro, until the visitor picks another one) and the rates
 * that convert them. The choice is kept in the browser, and so are the rates for 12 hours. The first
 * render is always in euros, like the server's, so the page never mismatches while hydrating.
 */
const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Rates>(getFallbackRates);
  const [isRateIndicative, setIsRateIndicative] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = parseCurrency(readStorage(CURRENCY_STORAGE_KEY));

      if (stored) setCurrencyState(stored);

      const cached = readStoredRates(readStorage(RATES_STORAGE_KEY), RATES_MAX_AGE_MS);

      if (cached) {
        setRates(previous => ({ ...previous, ...cached }));
        setIsRateIndicative(false);
        return;
      }

      const fresh = await fetchRates();

      if (!fresh) return;

      setRates(previous => ({ ...previous, ...fresh }));
      setIsRateIndicative(false);
      writeStorage(RATES_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), ...fresh }));
    };

    void load();
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    writeStorage(CURRENCY_STORAGE_KEY, next);
  }, []);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    isRateIndicative,
    formatPrice: (euros, withSymbol) => formatPrice(euros, {
      currency, rates, withSymbol, locale,
    }),
    convertPrices: text => convertPrices(text, currency, rates),
  }), [currency, isRateIndicative, locale, rates, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyProvider;
