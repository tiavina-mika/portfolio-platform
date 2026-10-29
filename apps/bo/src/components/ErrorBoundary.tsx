import * as Sentry from '@sentry/react';
import { type ErrorInfo, type ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

import ErrorFallbackCard from '@/components/ErrorFallbackCard';

const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const {
    t,
  } = useTranslation();

  /*
   * reload from scratch rather than navigating — this outer boundary sits above the router itself,
   * so the crash may originate from the router and a plain reset would just re-throw immediately
   */
  const handleReload = () => {
    resetErrorBoundary();
    window.location.href = '/';
  };

  return (
    <ErrorFallbackCard
      isCodeWord
      actionLabel={t('returnToHome')}
      code={t('error')}
      message={t('errors.somethingWentWrong')}
      onAction={handleReload}
    />
  );
};

const logError = (error: unknown, info: ErrorInfo) => {
  console.error('Uncaught rendering error caught by ErrorBoundary:', error, info);
  Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
};

type Props = {
  children: ReactNode;
};

/*
 * last-resort safety net for anything that escapes the router's own error boundary
 * (see ErrorPage.tsx — TanStack Router wraps every route in its own CatchBoundary already)
 */
const ErrorBoundary = ({ children }: Props) => (
  <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
