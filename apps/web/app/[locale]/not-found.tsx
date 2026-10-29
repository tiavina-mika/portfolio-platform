/**
 * for now there is an issue with the translation of the not found page
 */

import { getTranslations } from 'next-intl/server';

import NotFound from '@/containers/NotFound';

const TranslatedNotFoundPage = async () => {
  const t = await getTranslations('App');

  return (
    <NotFound
      description={t('pageNotFoundDescription')}
      linkText={t('gotToHomePage')}
      secondaryLinkText={t('contactMe')}
      title={t('pageNotFound')}
    />
  );
};

export default TranslatedNotFoundPage;
