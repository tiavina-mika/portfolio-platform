import { getCachedApp } from '@/app/[locale]/page';
import { Locale } from '@/i18n/config';
import { getTranslatedField } from '@/utils/translation.utils';

import HomeHeroTexts from './HomeHeroTexts';

type Props = {
  locale: Locale;
};

/**
 * The hero description, from the app settings in the database. Rendered inside a Suspense boundary
 * (HomeHeroTextsSkeleton) and an error boundary (HomeHeroTextsBoundary)
 */
const DynamicHomeHeroTexts = async ({ locale }: Props) => {
  const app = await getCachedApp();
  const translated = app?.translated;

  if (!translated) return null;

  return <HomeHeroTexts description={getTranslatedField(translated, locale, 'description')} />;
};

export default DynamicHomeHeroTexts;
