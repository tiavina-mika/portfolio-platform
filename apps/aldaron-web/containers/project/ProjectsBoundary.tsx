'use client';

import { ReactNode } from 'react';

import RefreshErrorBoundary, { RefreshErrorFallbackProps } from '@/components/RefreshErrorBoundary';

import ProjectsSection from './ProjectsSection';

const ProjectsFallback = ({ isOnline, onRetry }: RefreshErrorFallbackProps) => (
  <ProjectsSection onRetry={onRetry} status={isOnline ? 'error' : 'offline'} />
);

type Props = {
  children: ReactNode;
};

/**
 * If the projects fail to load, a banner takes the place of the cards (the header of the page stays):
 * a retry when online, a notice when the device is offline
 */
const ProjectsBoundary = ({ children }: Props) => (
  <RefreshErrorBoundary fallback={ProjectsFallback}>
    {children}
  </RefreshErrorBoundary>
);

export default ProjectsBoundary;
