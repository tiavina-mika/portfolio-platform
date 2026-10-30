import * as Sentry from '@sentry/react';
import { type ErrorComponentProps, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorFallbackCard from '@/components/ErrorFallbackCard';

/*
 * rendered by TanStack Router's own error boundary (defaultErrorComponent, routes.tsx) — mounted
 * inside the router, so it can navigate through it instead of a hard reload like ErrorBoundary.tsx
 */
const ErrorPage = ({ error, reset }: ErrorComponentProps) => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();

  // the router catches the error before the outer boundary can see it, so it is reported here
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleReturnToHome = () => {
    reset();
    navigate({ to: '/' });
  };

  return (
    <ErrorFallbackCard
      isCodeWord
      actionLabel={t('returnToHome')}
      code={t('error')}
      message={t('errors.somethingWentWrong')}
      onAction={handleReturnToHome}
    />
  );
};

export default ErrorPage;
