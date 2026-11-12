'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
};

/*
 * Replaces the root layout when it crashes, so it is rendered outside the translation provider:
 * the generic Next.js error page is used rather than a text that could not be translated.
 */
const GlobalError = ({ error }: GlobalErrorProps) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
};

export default GlobalError;
