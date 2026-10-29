'use client';

import { useRouter } from 'next/navigation';
import { ComponentType, ReactNode, startTransition } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useIsOnline } from '@/hooks/useIsOnline';

export type RefreshErrorFallbackProps = {
  /**
   * `false` when the failure comes from a lost connection: the content comes back by itself
   */
  isOnline: boolean;
  onRetry: () => void;
};

type FallbackComponent = ComponentType<RefreshErrorFallbackProps>;

type RefreshFallbackProps = {
  fallback: FallbackComponent;
  resetErrorBoundary: () => void;
};

const RefreshFallback = ({ fallback, resetErrorBoundary }: RefreshFallbackProps) => {
  const Fallback = fallback;
  const router = useRouter();
  const isOnline = useIsOnline();

  // the content comes from the server: refresh the page data, then render the children again
  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      resetErrorBoundary();
    });
  };

  return <Fallback isOnline={isOnline} onRetry={handleRetry} />;
};

type Props = {
  children: ReactNode;
  /**
   * What takes the place of the children when they fail to render
   */
  fallback: FallbackComponent;
};

/**
 * Wraps content rendered from server data: if it fails, the fallback takes its place with a retry
 * that refreshes the server data, and knows whether the device is offline.
 */
const RefreshErrorBoundary = ({ children, fallback }: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <RefreshFallback fallback={fallback} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RefreshErrorBoundary;
