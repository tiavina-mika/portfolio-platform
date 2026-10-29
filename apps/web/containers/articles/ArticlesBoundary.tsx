'use client';

import { ReactNode } from 'react';

import RefreshErrorBoundary, { RefreshErrorFallbackProps } from '@/components/RefreshErrorBoundary';

import ArticlesSection from './ArticlesSection';

const ArticlesFallback = ({ isOnline, onRetry }: RefreshErrorFallbackProps) => (
  <ArticlesSection onRetry={onRetry} status={isOnline ? 'error' : 'offline'} />
);

type Props = {
  children: ReactNode;
};

/**
 * If the articles fail to load, a banner takes the place of the cards (the header of the page stays):
 * a retry when online, a notice when the device is offline
 */
const ArticlesBoundary = ({ children }: Props) => (
  <RefreshErrorBoundary fallback={ArticlesFallback}>
    {children}
  </RefreshErrorBoundary>
);

export default ArticlesBoundary;
