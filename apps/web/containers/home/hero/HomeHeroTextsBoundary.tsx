'use client';

import { ReactNode } from 'react';

import RefreshErrorBoundary from '@/components/RefreshErrorBoundary';

import HomeHeroTextsError from './HomeHeroTextsError';

type Props = {
  children: ReactNode;
};

/**
 * Wraps the hero description loaded from the database: if it fails, a banner with a retry button takes
 * its place and the rest of the hero stays. A client file, as the fallback is a component and a server
 * component cannot hand a function to a client one
 */
const HomeHeroTextsBoundary = ({ children }: Props) => {
  return (
    <RefreshErrorBoundary fallback={HomeHeroTextsError}>
      {children}
    </RefreshErrorBoundary>
  );
};

export default HomeHeroTextsBoundary;
