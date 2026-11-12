'use client';

import { ReactNode } from 'react';

import RefreshErrorBoundary, { RefreshErrorFallbackProps } from '@/components/RefreshErrorBoundary';

import HomeArticlesSection from './HomeArticlesSection';

const HomeArticlesFallback = ({ isOnline, onRetry }: RefreshErrorFallbackProps) => (
  <HomeArticlesSection onRetry={onRetry} status={isOnline ? 'error' : 'offline'} />
);

type Props = {
  children: ReactNode;
};

/**
 * If the articles fail to load, the section stays with its header and a banner takes the place of
 * the cards: a retry when online, a notice when the device is offline
 */
const HomeArticlesBoundary = ({ children }: Props) => (
  <RefreshErrorBoundary fallback={HomeArticlesFallback}>
    {children}
  </RefreshErrorBoundary>
);

export default HomeArticlesBoundary;
