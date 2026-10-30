'use client';

import { getCookie, setCookie } from 'cookies-next';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import env from '@/env';
import { COOKIES } from '@/utils/constants';

import Button from './buttons/Button';
import Text from './typography/Text';

type ConsentValue = 'granted' | 'denied';

const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Asks for the consent to the audience measurement cookies, once. Nothing shows when there is no
 * analytics id, or once the visitor answered.
 */
const CookieConsentBanner = () => {
  const t = useTranslations('Cookies');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !getCookie(COOKIES.consent));
  }, []);

  const handleChoice = (consent: ConsentValue) => {
    setCookie(COOKIES.consent, consent, { maxAge: CONSENT_MAX_AGE_SECONDS });
    window.gtag?.('consent', 'update', { analytics_storage: consent });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      aria-label={t('title')}
      aria-live="polite"
      role="dialog"
      className={`
        fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 rounded-lg bg-white p-4
        shadow-lg ring-1 ring-black/10
        dark:bg-neutral-900 dark:ring-white/10
      `}
    >
      <Text as="span" className="font-semibold" size="sm">{t('title')}</Text>
      <Text as="span" size="sm">{t('description')}</Text>
      <div className="flex flex-row gap-2">
        <Button
          color="default"
          onClick={() => handleChoice('denied')}
          size="sm"
          variant="outlined"
        >
          {t('decline')}
        </Button>
        <Button
          color="primary"
          onClick={() => handleChoice('granted')}
          size="sm"
          variant="contained"
        >
          {t('accept')}
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
