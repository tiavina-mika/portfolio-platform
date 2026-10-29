'use client';

/**
 * This file is used to handle the error boundary in the application
 * it should be called in error.tsx file in the app folder (for each page or slot)
 * @NOTE: import this using lazy import in the error.tsx file
 * @NOTE: this is a client component, so the translation should be inside a Provider
 */
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import { ROUTES } from '@/i18n/routes';

import Section from './layouts/Section';

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorBoundary = ({
  error,
}: ErrorBoundaryProps) => {
  const t = useTranslations('Error');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Section className={`
      flex flex-col justify-center gap-3 py-8
      md:items-center
    `}
    >
      <Title className="font-bold" level={3}>{t('somethingWentWrong')}</Title>
      <Text className="md:mt-4">
        {t('tryAgain')}
      </Text>
      <Text
        as="p"
        className={`
          flex flex-col
          sm:flex-row
          md:items-center
        `}
      >
        <span>{t('ifProblemPersist')} &nbsp; </span>
        <TextLink color="active" href={ROUTES.contact}>
          {t('contactUs')}.
        </TextLink>
      </Text>
    </Section>
  );
};

export default ErrorBoundary;
