'use client';

import { useContext } from 'react';

import { CurrencyContext, CurrencyContextValue } from '@/providers/CurrencyProvider';
import { DEFAULT_CURRENCY } from '@/utils/constants';
import { convertPrices, formatPrice, getFallbackRates } from '@/utils/currency.utils';

// outside a provider (a story, a test) the prices stay in euros
const euroOnly: CurrencyContextValue = {
  currency: DEFAULT_CURRENCY,
  setCurrency: () => undefined,
  isRateIndicative: false,
  formatPrice: (euros, withSymbol) => formatPrice(euros, {
    currency: DEFAULT_CURRENCY, rates: getFallbackRates(), withSymbol,
  }),
  convertPrices: text => convertPrices(text, DEFAULT_CURRENCY, getFallbackRates()),
};

export const useCurrency = (): CurrencyContextValue => useContext(CurrencyContext) ?? euroOnly;
