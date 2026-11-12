/**
 * for now there is an issue with the translation of the not found page
 */

import { useTranslations } from 'next-intl';

import NotFound from '@/containers/common/NotFound';

const TranslatedNotFoundApp = () => {
  const t = useTranslations('App');

  return (
    <NotFound
      blogText={t('readBlog')}
      code={t('errorCode')}
      contactText={t('contactMe')}
      description={t('pageNotFoundDescription')}
      homeText={t('gotToHomePage')}
      title={t('pageNotFound')}
    />
  );
};

export default TranslatedNotFoundApp;
